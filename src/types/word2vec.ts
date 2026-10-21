/**
 * Word2Vec and NLP Turkish Color Outlier Detector Types
 */

export interface WordMetadata {
  v: number[];           // 100-dimensional vector
  simRenk: number;       // Cosine similarity to canonical 'renk' vector
  simCentroid: number;   // Cosine similarity to Turkish color centroid
  isColor: boolean;      // Whether word is in the color class
  cat: string;           // Semantic category (renk, hayvan, eşya, taşıt, etc.)
  x: number;             // 2D PCA projected coordinate X
  y: number;             // 2D PCA projected coordinate Y
}

export interface Word2VecDatabase {
  metadata: {
    modelName: string;
    sourceArchive: string;
    dimension: number;
    vocabCount: number;
    method: string;
    description: string;
  };
  colorCentroid: number[];
  renkVector: number[];
  pca: {
    means: number[];
    pc1: number[];
    pc2: number[];
  };
  colors: Record<string, { hex: string; isCore: boolean }>;
  vocabulary: Record<string, WordMetadata>;
}

export interface WordEvaluation {
  raw: string;
  normalized: string;
  stem: string;
  isKnownInVocab: boolean;
  isColor: boolean;
  category: string;
  hexColor?: string;
  simToColorCentroid: number;  // -1.0 to 1.0
  simToRenkWord: number;       // -1.0 to 1.0
  simToGroupMean: number;       // Cosine similarity to the 4-word centroid
  colorProbability: number;    // 0 to 100%
  coords: { x: number; y: number };
  vector?: number[];
  explanation: string;
}

export interface AnalysisResult {
  timestamp: string;
  inputs: string[];
  evaluations: WordEvaluation[];
  outlierWord: string;
  outlierIndex: number;
  confidenceScore: number;
  verdict: 'clear_non_color' | 'all_colors' | 'no_colors' | 'subtle_outlier';
  summaryMessage: string;
  technicalDetails: {
    groupCentroidSimilarityRange: { min: number; max: number };
    colorSimilarityRange: { min: number; max: number };
    algorithm: string;
    model: string;
    vectorDimension: number;
  };
}
