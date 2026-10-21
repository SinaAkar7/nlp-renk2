import React from 'react';
import { WordEvaluation } from '../types/word2vec.ts';
import { CheckCircle2, XCircle, Tag } from 'lucide-react';

interface WordScoreCardProps {
  evaluation: WordEvaluation;
  index: number;
  isOutlier: boolean;
}

export const WordScoreCard: React.FC<WordScoreCardProps> = ({ evaluation, index, isOutlier }) => {
  const percentColor = Math.round(evaluation.colorProbability);
  const simCentroidPercent = Math.max(0, Math.round(evaluation.simToColorCentroid * 100));
  const simGroupPercent = Math.max(0, Math.round(evaluation.simToGroupMean * 100));

  return (
    <div
      className={`relative rounded-2xl p-4 transition-all duration-300 border ${
        isOutlier
          ? 'bg-rose-950/20 border-rose-500/50 shadow-lg shadow-rose-950/30 ring-1 ring-rose-500/30'
          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-md'
      }`}
    >
      {/* Header index + status */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-slate-800 text-slate-400 text-xs font-mono font-medium">
            #{index + 1}
          </span>
          <h4 className="text-lg font-bold text-slate-100 tracking-wide capitalize">
            {evaluation.raw}
          </h4>
        </div>

        {isOutlier ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            Renk Değil
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Renk İsmi
          </span>
        )}
      </div>

      {/* Visual swatch or Category */}
      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 mb-3">
        {evaluation.hexColor ? (
          <div className="flex items-center gap-2">
            <span
              className="w-6 h-6 rounded-lg border border-white/20 shadow-sm flex-shrink-0"
              style={{ backgroundColor: evaluation.hexColor }}
              title={`HEX: ${evaluation.hexColor}`}
            />
            <span className="text-xs font-mono text-slate-300 uppercase">
              {evaluation.hexColor}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>Kategori: <strong className="text-slate-300 capitalize">{evaluation.category}</strong></span>
          </div>
        )}

        <div className="ml-auto text-xs font-mono text-slate-400">
          Kök: <span className="text-indigo-400 font-medium">{evaluation.stem || evaluation.normalized}</span>
        </div>
      </div>

      {/* Metric 1: Color Space Similarity */}
      <div className="space-y-1.5 mb-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Renk Uzayı Benzerliği (Centroid)</span>
          <span className={`font-mono font-medium ${isOutlier ? 'text-rose-400' : 'text-emerald-400'}`}>
            {simCentroidPercent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOutlier ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, simCentroidPercent))}%` }}
          />
        </div>
      </div>

      {/* Metric 2: Group Coherence Similarity */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Grup İçi Semantik Uyum</span>
          <span className="font-mono text-slate-300">
            {simGroupPercent}%
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, simGroupPercent))}%` }}
          />
        </div>
      </div>

      {/* Summary explanation */}
      <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-800/80">
        {evaluation.explanation}
      </p>
    </div>
  );
};
