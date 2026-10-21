/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnalysisResult } from './types/word2vec.ts';
import { analyzeFourWords, loadWord2VecDatabase } from './utils/word2vecEngine.ts';
import { WordScoreCard } from './components/WordScoreCard.tsx';
import { VectorSpaceChart } from './components/VectorSpaceChart.tsx';
import { JsonExportModal } from './components/JsonExportModal.tsx';
import {
  Sparkles,
  Search,
  RotateCcw,
  AlertTriangle,
  Code2,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Sliders,
  Check
} from 'lucide-react';

export default function App() {
  // CRITICAL REQUIREMENT: Inputs must be blank initially, user writes their own words.
  const [words, setWords] = useState<[string, string, string, string]>(['', '', '', '']);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [modelReady, setModelReady] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [showTechDetails, setShowTechDetails] = useState<boolean>(false);

  // Initialize Word2Vec database in the background
  useEffect(() => {
    loadWord2VecDatabase()
      .then(() => setModelReady(true))
      .catch((err) => {
        console.warn('Word2Vec initialization note:', err);
        setModelReady(true);
      });
  }, []);

  const handleInputChange = (index: number, val: string) => {
    const next: [string, string, string, string] = [...words];
    next[index] = val;
    setWords(next);
    if (errorMessage) setErrorMessage(null);
  };

  const handleClear = () => {
    setWords(['', '', '', '']);
    setResult(null);
    setErrorMessage(null);
  };

  const handleAnalyze = async () => {
    // Validate inputs
    const trimmed = words.map((w) => w.trim());
    if (trimmed.some((w) => w.length === 0)) {
      setErrorMessage('Lütfen 4 kutunun tümüne birer kelime giriniz.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const evaluationResult = await analyzeFourWords(trimmed);
      setResult(evaluationResult);
    } catch (err) {
      console.error('Analiz hatası:', err);
      setErrorMessage('Analiz sırasında bir sorun oluştu. Lütfen tekrar deneyiniz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Background radial glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col">
        {/* Header */}
        <header className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4 shadow-sm backdrop-blur-md">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span>Word2Vec TR-100 Doğal Dil Modeli</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 font-mono text-[11px]">
              {modelReady ? 'Model Hazır' : 'Yükleniyor...'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 tracking-tight">
            Renk Olmayan Kelimeyi Bul
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Girdiğiniz 4 Türkçe kelimeyi 100 boyutlu Word2Vec vektör uzayı ve kosinüs benzerliği
            ile analiz ederek <strong className="text-slate-200">hangisinin bir renk ismi olmadığını</strong> tespit eder.
          </p>
        </header>

        {/* Word Input Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl mb-8">
          <div className="flex items-center justify-between gap-3 mb-5">
            <h2 className="text-sm sm:text-base font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Karşılaştırılacak 4 Kelime
            </h2>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-slate-800/60"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Temizle
            </button>
          </div>

          {/* 4 Input Boxes - strictly empty on start */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 flex items-center justify-between">
                  <span>{index + 1}. Kelime</span>
                  <span className="text-[10px] text-slate-500 font-mono">w_{index + 1}</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={words[index]}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`${index + 1}. kelimeyi yazın...`}
                    className="w-full bg-slate-950/90 border border-slate-700/80 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-slate-100 placeholder-slate-500 text-sm rounded-xl px-4 py-3 outline-none transition-all duration-200"
                  />
                  {words[index].trim() && (
                    <span className="absolute right-3 top-3.5 w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Error message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs mb-5 animate-shake">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.99] transition-all shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Vektör Uzayında Hesaplanıyor...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Renk Olmayanı Tespit Et</span>
                </>
              )}
            </button>

            {result && (
              <button
                onClick={() => setShowJsonModal(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                title="JSON formatında görüntüle ve dışa aktar"
              >
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span>JSON &amp; Statik Format</span>
              </button>
            )}
          </div>
        </div>

        {/* Results View */}
        {result && (
          <div className="space-y-6 animate-fade-in mb-8">
            {/* Primary Verdict Card */}
            <div
              className={`rounded-3xl p-6 sm:p-7 border backdrop-blur-xl shadow-2xl transition-all ${
                result.verdict === 'clear_non_color'
                  ? 'bg-gradient-to-br from-rose-950/40 via-slate-900 to-slate-900 border-rose-500/40 shadow-rose-950/20'
                  : 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/40 shadow-amber-950/20'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 mb-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                    <span>Word2Vec Tespit Sonucu</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    Renk İsmi Olmayan:{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400 uppercase underline decoration-rose-500/40 underline-offset-4">
                      {result.outlierWord}
                    </span>
                  </h3>

                  <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-3xl">
                    {result.summaryMessage}
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">
                      %{result.confidenceScore}
                    </div>
                    <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Güven Skoru
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Score Cards */}
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Kelime Bazlı Vektör ve Benzerlik Değerlendirmesi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {result.evaluations.map((item, idx) => (
                  <WordScoreCard
                    key={idx}
                    evaluation={item}
                    index={idx}
                    isOutlier={idx === result.outlierIndex}
                  />
                ))}
              </div>
            </div>

            {/* 2D Vector Space PCA Visualization */}
            <VectorSpaceChart
              evaluations={result.evaluations}
              outlierIndex={result.outlierIndex}
            />

            {/* Technical NLP Details Collapsible */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowTechDetails(!showTechDetails)}
                className="w-full flex items-center justify-between px-6 py-4 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-indigo-400" />
                  Teknik NLP ve Vektör Matematik Detayları (Gensim doesnt_match)
                </span>
                {showTechDetails ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showTechDetails && (
                <div className="px-6 pb-5 pt-2 border-t border-slate-800/80 text-xs text-slate-400 space-y-3 font-mono">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                      <div className="text-slate-300 font-bold mb-1">Algoritma Modeli:</div>
                      <div>{result.technicalDetails.algorithm}</div>
                    </div>
                    <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                      <div className="text-slate-300 font-bold mb-1">Vektör Uzayı:</div>
                      <div>{result.technicalDetails.vectorDimension} Boyutlu Türkçe Word2Vec</div>
                    </div>
                  </div>

                  <p className="leading-relaxed">
                    Kosinüs benzerliği formülü: <code className="text-indigo-400 font-mono">sim(u, v) = (u · v) / (||u|| ||v||)</code>.
                    Centroid (Ağırlık Merkezi): <code className="text-indigo-400 font-mono">μ = Σ v_i / 4</code>.
                    En düşük kosinüs benzerliğine sahip kelime renk kümesinden sapan aykırı değer olarak sınıflandırılmıştır.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* JSON Export Modal */}
        <JsonExportModal
          isOpen={showJsonModal}
          onClose={() => setShowJsonModal(false)}
          result={result}
        />

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-4 text-center text-xs text-slate-500 border-t border-slate-900">
          <p>
            Türkçe Doğal Dil İşleme &bull; Word2Vec Türkçe Model 100 &bull; Statik Web Mimarisi
          </p>
        </footer>
      </div>
    </div>
  );
}
