import React, { useMemo } from 'react';
import { WordEvaluation } from '../types/word2vec.ts';

interface VectorSpaceChartProps {
  evaluations: WordEvaluation[];
  outlierIndex: number;
}

export const VectorSpaceChart: React.FC<VectorSpaceChartProps> = ({ evaluations, outlierIndex }) => {
  // Reference background clusters in 2D PCA space
  const referencePoints = useMemo(() => [
    { label: 'kırmızı', x: 2.8, y: 0.9, cat: 'renk', hex: '#EF4444' },
    { label: 'mavi', x: 2.7, y: 0.7, cat: 'renk', hex: '#3B82F6' },
    { label: 'yeşil', x: 2.5, y: 0.8, cat: 'renk', hex: '#10B981' },
    { label: 'sarı', x: 2.6, y: 0.5, cat: 'renk', hex: '#EAB308' },
    { label: 'mor', x: 2.4, y: 0.9, cat: 'renk', hex: '#A855F7' },
    { label: 'siyah', x: 2.9, y: 0.4, cat: 'renk', hex: '#18181B' },
    { label: 'beyaz', x: 2.6, y: 0.3, cat: 'renk', hex: '#E2E8F0' },
    { label: 'araba', x: -2.3, y: -1.2, cat: 'taşıt', hex: '#64748B' },
    { label: 'tren', x: -2.1, y: -1.4, cat: 'taşıt', hex: '#64748B' },
    { label: 'elma', x: -0.8, y: 1.8, cat: 'yiyecek', hex: '#64748B' },
    { label: 'ekmek', x: -0.6, y: 1.5, cat: 'yiyecek', hex: '#64748B' },
    { label: 'masa', x: -1.6, y: -0.3, cat: 'eşya', hex: '#64748B' },
    { label: 'kitap', x: -1.8, y: 0.4, cat: 'eşya', hex: '#64748B' },
    { label: 'kedi', x: -0.4, y: -1.9, cat: 'hayvan', hex: '#64748B' },
    { label: 'köpek', x: -0.2, y: -2.1, cat: 'hayvan', hex: '#64748B' }
  ], []);

  // Compute SVG viewBox bounds based on words
  const allX = [...referencePoints.map(p => p.x), ...evaluations.map(e => e.coords.x)];
  const allY = [...referencePoints.map(p => p.y), ...evaluations.map(e => e.coords.y)];

  const minX = Math.min(-3.5, ...allX) - 0.8;
  const maxX = Math.max(3.5, ...allX) + 0.8;
  const minY = Math.min(-2.8, ...allY) - 0.8;
  const maxY = Math.max(2.8, ...allY) + 0.8;

  const width = 640;
  const height = 400;

  // Scale functions
  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * width;
  const scaleY = (y: number) => height - ((y - minY) / (maxY - minY)) * height;

  // Color cluster center
  const colorClusterCenterX = scaleX(2.65);
  const colorClusterCenterY = scaleY(0.7);

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl overflow-hidden backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            2B Semantik Vektör Uzayı Görselleştirmesi (PCA)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            100 boyutlu Word2Vec vektörlerinin Temel Bileşen Analizi (PCA) ile 2 boyuta izdüşümü
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-400 inline-block"></span>
            <span className="text-slate-300">Renk Kümesi</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500 border border-rose-300 inline-block animate-ping opacity-75"></span>
            <span className="text-rose-400 font-medium">Aykırı Kelime</span>
          </div>
        </div>
      </div>

      <div className="relative w-full aspect-[16/10] bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden flex items-center justify-center">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
          <defs>
            <radialGradient id="colorClusterGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="outlierLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          <line x1="0" y1={scaleY(0)} x2={width} y2={scaleY(0)} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <line x1={scaleX(0)} y1="0" x2={scaleX(0)} y2={height} stroke="#334155" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />

          {/* Color subspace zone */}
          <circle
            cx={colorClusterCenterX}
            cy={colorClusterCenterY}
            r="85"
            fill="url(#colorClusterGrad)"
            stroke="#10B981"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
          <text
            x={colorClusterCenterX}
            y={colorClusterCenterY - 60}
            textAnchor="middle"
            fill="#34D399"
            fontSize="10"
            fontWeight="600"
            letterSpacing="0.05em"
          >
            RENK VEKTÖR UZAYI KÜMESİ
          </text>

          {/* Semantic guide reference nodes */}
          {referencePoints.map((p, idx) => (
            <g key={idx} opacity={0.35}>
              <circle
                cx={scaleX(p.x)}
                cy={scaleY(p.y)}
                r="3"
                fill={p.hex}
              />
              <text
                x={scaleX(p.x) + 5}
                y={scaleY(p.y) + 3}
                fill="#94A3B8"
                fontSize="9"
                fontFamily="monospace"
              >
                {p.label}
              </text>
            </g>
          ))}

          {/* Distance line from outlier to color centroid */}
          {evaluations[outlierIndex] && (
            <line
              x1={scaleX(evaluations[outlierIndex].coords.x)}
              y1={scaleY(evaluations[outlierIndex].coords.y)}
              x2={colorClusterCenterX}
              y2={colorClusterCenterY}
              stroke="url(#outlierLineGrad)"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
          )}

          {/* User entered words nodes */}
          {evaluations.map((e, idx) => {
            const isOutlier = idx === outlierIndex;
            const cx = scaleX(e.coords.x);
            const cy = scaleY(e.coords.y);
            const color = isOutlier ? '#F43F5E' : (e.hexColor || '#38BDF8');

            return (
              <g key={idx} className="transition-all duration-300">
                {isOutlier && (
                  <>
                    <circle cx={cx} cy={cy} r="18" fill="#F43F5E" opacity="0.2" className="animate-ping" />
                    <circle cx={cx} cy={cy} r="12" fill="#F43F5E" opacity="0.3" />
                  </>
                )}

                <circle
                  cx={cx}
                  cy={cy}
                  r={isOutlier ? 8 : 6}
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth={isOutlier ? 2.5 : 1.5}
                  filter={isOutlier ? 'url(#glow)' : undefined}
                />

                {/* Word label badge */}
                <g transform={`translate(${cx}, ${cy - (isOutlier ? 18 : 12)})`}>
                  <rect
                    x={-(e.raw.length * 4.5 + 8)}
                    y="-12"
                    width={e.raw.length * 9 + 16}
                    height="18"
                    rx="4"
                    fill={isOutlier ? '#881337' : '#0F172A'}
                    stroke={isOutlier ? '#F43F5E' : '#334155'}
                    strokeWidth="1"
                    opacity="0.95"
                  />
                  <text
                    x="0"
                    y="1"
                    textAnchor="middle"
                    fill={isOutlier ? '#FFE4E6' : '#F1F5F9'}
                    fontSize="11"
                    fontWeight={isOutlier ? 'bold' : '500'}
                  >
                    {e.raw} {isOutlier ? '✕' : '✓'}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-mono">
          Eksenler: PC1 (Semantik Renk Ayrımı) × PC2 (Kavramsal Varyans)
        </div>
      </div>
    </div>
  );
};
