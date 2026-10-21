/**
 * Word2Vec NLP Semantic Engine for Turkish Word Vectors
 * Implements Gensim-compatible doesn't match outlier detection & cosine similarity.
 */

import { AnalysisResult, Word2VecDatabase, WordEvaluation } from '../types/word2vec.ts';
import { checkDirectColorMatch, normalizeTurkish, stemTurkishWord } from './turkishNLP.ts';

let databaseCache: Word2VecDatabase | null = null;
let loadPromise: Promise<Word2VecDatabase> | null = null;

/**
 * Loads the Word2Vec database from static JSON
 */
export async function loadWord2VecDatabase(): Promise<Word2VecDatabase> {
  if (databaseCache) return databaseCache;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      const response = await fetch('/data/word2vec_tr.json');
      if (!response.ok) {
        throw new Error(`Failed to load word2vec_tr.json: ${response.status}`);
      }
      const data: Word2VecDatabase = await response.json();
      databaseCache = data;
      return data;
    } catch (err) {
      console.warn('Network load failed, using fallback minimal database:', err);
      // Construct fallback minimal database if network fails
      const fallback = createFallbackDatabase();
      databaseCache = fallback;
      return fallback;
    }
  })();

  return loadPromise;
}

/**
 * Dot product of two vectors
 */
export function dotProduct(v1: number[], v2: number[]): number {
  let sum = 0;
  const len = Math.min(v1.length, v2.length);
  for (let i = 0; i < len; i++) {
    sum += v1[i] * v2[i];
  }
  return sum;
}

/**
 * L2 Euclidean norm
 */
export function vectorNorm(v: number[]): number {
  let sum = 0;
  for (let i = 0; i < v.length; i++) {
    sum += v[i] * v[i];
  }
  return Math.sqrt(sum);
}

/**
 * Cosine similarity between two vectors (-1.0 to 1.0)
 */
export function cosineSimilarity(v1: number[], v2: number[]): number {
  const n1 = vectorNorm(v1);
  const n2 = vectorNorm(v2);
  if (n1 === 0 || n2 === 0) return 0;
  return dotProduct(v1, v2) / (n1 * n2);
}

/**
 * Calculate the mean centroid of a list of vectors
 */
export function computeCentroid(vectors: number[][]): number[] {
  if (vectors.length === 0) return [];
  const dim = vectors[0].length;
  const centroid = new Array(dim).fill(0);
  for (const vec of vectors) {
    for (let i = 0; i < dim; i++) {
      centroid[i] += vec[i];
    }
  }
  for (let i = 0; i < dim; i++) {
    centroid[i] /= vectors.length;
  }
  return centroid;
}

/**
 * Generates a deterministic pseudo-vector for an out-of-vocabulary word
 * using character n-gram hashing so it can still be mathematically evaluated
 */
function generateOovVector(word: string, dim: number, isColor: boolean, colorCentroid: number[]): number[] {
  const vec = new Array(dim).fill(0);
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    hash = (hash << 5) - hash + word.charCodeAt(i);
    hash |= 0;
  }

  for (let i = 0; i < dim; i++) {
    const seed = Math.sin(hash + i * 997) * 10000;
    vec[i] = (seed - Math.floor(seed)) * 2 - 1;
  }

  // Normalize
  const n = vectorNorm(vec);
  const normalized = vec.map((x) => (n > 0 ? x / n : 0));

  if (isColor && colorCentroid && colorCentroid.length === dim) {
    // Bias towards color centroid
    const blended = normalized.map((val, idx) => val * 0.3 + colorCentroid[idx] * 0.7);
    return blended;
  }

  return normalized;
}

/**
 * Evaluates the 4 words using Word2Vec and NLP semantic analysis
 */
export async function analyzeFourWords(rawWords: string[]): Promise<AnalysisResult> {
  const db = await loadWord2VecDatabase();
  const colorCentroid = db.colorCentroid;
  const renkVec = db.renkVector;
  const dim = db.metadata.dimension || 100;

  // Process and extract vectors for each word
  const evaluations: WordEvaluation[] = [];
  const extractedVectors: number[][] = [];

  for (let i = 0; i < rawWords.length; i++) {
    const raw = rawWords[i] || '';
    const normalized = normalizeTurkish(raw);
    const { stem, isColorVariant } = stemTurkishWord(raw);
    const directColorCheck = checkDirectColorMatch(raw);

    let vector: number[] | null = null;
    let coords = { x: 0, y: 0 };
    let category = 'bilinmeyen';
    let isColor = directColorCheck.isColor || isColorVariant;
    let isKnownInVocab = false;

    // Check database exact match
    if (db.vocabulary[normalized]) {
      const entry = db.vocabulary[normalized];
      vector = entry.v;
      coords = { x: entry.x, y: entry.y };
      category = entry.cat;
      isColor = isColor || entry.isColor;
      isKnownInVocab = true;
    } else if (db.vocabulary[stem]) {
      const entry = db.vocabulary[stem];
      vector = entry.v;
      coords = { x: entry.x, y: entry.y };
      category = entry.cat;
      isColor = isColor || entry.isColor;
      isKnownInVocab = true;
    } else {
      // Out of vocabulary: generate vector
      vector = generateOovVector(normalized, dim, isColor, colorCentroid);
      isKnownInVocab = false;
      category = isColor ? 'renk' : 'genel';
      coords = {
        x: isColor ? 2.5 + (Math.sin(i) * 0.5) : -2.5 + (Math.cos(i) * 1.5),
        y: isColor ? 0.8 + (Math.cos(i) * 0.4) : (Math.sin(i * 2) * 1.5)
      };
    }

    extractedVectors.push(vector);

    // Compute similarities to color spaces
    const simToColorCentroid = cosineSimilarity(vector, colorCentroid);
    const simToRenkWord = cosineSimilarity(vector, renkVec);

    // Determine color probability score (0 to 100%)
    let colorProb = 0;
    if (directColorCheck.isColor) {
      colorProb = Math.max(92, Math.min(100, Math.round(simToColorCentroid * 100)));
    } else if (isColor) {
      colorProb = Math.max(85, Math.min(99, Math.round(simToColorCentroid * 100)));
    } else {
      // Base probability directly on cosine similarity to the color centroid
      // Typical non-color has similarity 0.05 to 0.35
      // Typical color has similarity 0.70 to 0.95
      const scaled = Math.max(0, Math.min(1, (simToColorCentroid - 0.20) / 0.55));
      colorProb = Math.round(scaled * 100);
    }

    const hexColor = directColorCheck.hex || (db.colors[normalized]?.hex || (db.colors[stem]?.hex));

    evaluations.push({
      raw,
      normalized,
      stem,
      isKnownInVocab,
      isColor: colorProb >= 50,
      category,
      hexColor,
      simToColorCentroid: Math.round(simToColorCentroid * 1000) / 1000,
      simToRenkWord: Math.round(simToRenkWord * 1000) / 1000,
      simToGroupMean: 0, // filled below
      colorProbability: colorProb,
      coords,
      vector,
      explanation: ''
    });
  }

  // Gensim doesnt_match: Compute mean centroid of the 4 words
  const groupCentroid = computeCentroid(extractedVectors);

  for (let i = 0; i < evaluations.length; i++) {
    const simToMean = cosineSimilarity(extractedVectors[i], groupCentroid);
    evaluations[i].simToGroupMean = Math.round(simToMean * 1000) / 1000;
  }

  // Determine outlier:
  // 1. First priority: Words that are NOT colors when others ARE colors
  const nonColors = evaluations
    .map((e, idx) => ({ ...e, idx }))
    .filter((e) => !e.isColor);

  let outlierIndex = 0;
  let verdict: AnalysisResult['verdict'] = 'clear_non_color';
  let confidenceScore = 95;
  let summaryMessage = '';

  if (nonColors.length === 1) {
    // Exactly one non-color found: standard perfect case!
    outlierIndex = nonColors[0].idx;
    verdict = 'clear_non_color';
    confidenceScore = Math.max(88, 100 - nonColors[0].colorProbability);
    summaryMessage = `Girilen 4 kelimeden "${evaluations[outlierIndex].raw}" bir renk ismi değildir. Diğer 3 kelime renk kümesinde yer almaktadır.`;
  } else if (nonColors.length > 1 && nonColors.length < 4) {
    // Multiple non-colors: pick the one with lowest color similarity + lowest group similarity
    let minSim = Infinity;
    for (const item of nonColors) {
      const combinedScore = item.simToColorCentroid * 0.6 + item.simToGroupMean * 0.4;
      if (combinedScore < minSim) {
        minSim = combinedScore;
        outlierIndex = item.idx;
      }
    }
    verdict = 'clear_non_color';
    confidenceScore = 85;
    summaryMessage = `"${evaluations[outlierIndex].raw}" kelimesi renk uzayına en uzak olan ve renk niteliği taşımayan kelimedir.`;
  } else if (nonColors.length === 0) {
    // All 4 words are colors! Pick the outlier via Gensim doesnt_match
    let minGroupSim = Infinity;
    for (let i = 0; i < evaluations.length; i++) {
      if (evaluations[i].simToGroupMean < minGroupSim) {
        minGroupSim = evaluations[i].simToGroupMean;
        outlierIndex = i;
      }
    }
    verdict = 'all_colors';
    confidenceScore = 70;
    summaryMessage = `Girilen 4 kelimenin tümü renk ismidir. Vektör uzayında küme merkezine en uzak ton: "${evaluations[outlierIndex].raw}".`;
  } else {
    // None are colors! All 4 are non-colors: use Gensim doesnt_match
    let minGroupSim = Infinity;
    for (let i = 0; i < evaluations.length; i++) {
      if (evaluations[i].simToGroupMean < minGroupSim) {
        minGroupSim = evaluations[i].simToGroupMean;
        outlierIndex = i;
      }
    }
    verdict = 'no_colors';
    confidenceScore = 75;
    summaryMessage = `Girilen kelimelerden hiçbiri renk ismi değildir. Semantik olarak gruba en uzak kelime: "${evaluations[outlierIndex].raw}".`;
  }

  // Populate individual explanations
  for (let i = 0; i < evaluations.length; i++) {
    const e = evaluations[i];
    const isOutlier = i === outlierIndex;
    if (isOutlier) {
      e.explanation = e.isColor
        ? `Renk kümesinde yer almasına rağmen diğer kelimelere göre en düşük benzerliğe sahip (Benzerlik: ${(e.simToGroupMean * 100).toFixed(1)}%).`
        : `Renk uzayına benzerliği yalnızca ${(e.simToColorCentroid * 100).toFixed(1)}% seviyesindedir. Anlamsal olarak ${e.category} sınıfına aittir ve bir renk ismi değildir.`;
    } else {
      e.explanation = e.isColor
        ? `Renk uzayına yüksek benzerlik (Centroid: ${(e.simToColorCentroid * 100).toFixed(1)}%, "renk": ${(e.simToRenkWord * 100).toFixed(1)}%). Belirgin bir renk ismidir.`
        : `Renk uzayına benzerliği düşüktür (${(e.simToColorCentroid * 100).toFixed(1)}%).`;
    }
  }

  const groupSims = evaluations.map((e) => e.simToGroupMean);
  const colorSims = evaluations.map((e) => e.simToColorCentroid);

  return {
    timestamp: new Date().toISOString(),
    inputs: rawWords,
    evaluations,
    outlierWord: evaluations[outlierIndex].raw,
    outlierIndex,
    confidenceScore,
    verdict,
    summaryMessage,
    technicalDetails: {
      groupCentroidSimilarityRange: {
        min: Math.min(...groupSims),
        max: Math.max(...groupSims)
      },
      colorSimilarityRange: {
        min: Math.min(...colorSims),
        max: Math.max(...colorSims)
      },
      algorithm: 'Word2Vec Centroid Cosine Distance (KeyedVectors.doesnt_match)',
      model: db.metadata.modelName || 'trModel100 Word2Vec 100-dim',
      vectorDimension: dim
    }
  };
}

/**
 * Creates a minimal fallback database if JSON cannot be loaded
 */
function createFallbackDatabase(): Word2VecDatabase {
  return {
    metadata: {
      modelName: 'trModel100 Fallback Engine',
      sourceArchive: 'word2vecTRmodel100_e0db92f0.zip',
      dimension: 100,
      vocabCount: 150,
      method: 'In-Memory Semantic Fallback',
      description: 'Yerel ve statik Türkçe renk uzayı çözümleyicisi'
    },
    colorCentroid: new Array(100).fill(0.1),
    renkVector: new Array(100).fill(0.12),
    pca: {
      means: new Array(100).fill(0),
      pc1: new Array(100).fill(0.01),
      pc2: new Array(100).fill(-0.01)
    },
    colors: {},
    vocabulary: {}
  };
}
