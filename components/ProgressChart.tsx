'use client';

import { useId, useState } from 'react';

export interface ChartPoint {
  value: number;
  /** Tooltip text for this point. */
  label: string;
}

interface ProgressChartProps {
  title: string;
  points: ChartPoint[];
  /** Upper bound of the y axis; defaults to a rounded max of the data. */
  yMax?: number;
  suffix?: string;
  /** Tailwind stroke/fill color classes for the single series. */
  colorClass: string;
}

const W = 320;
const H = 120;
const PAD = { top: 10, right: 10, bottom: 18, left: 32 };

const niceMax = (value: number) => {
  if (value <= 0) return 10;
  const step = value > 100 ? 50 : value > 40 ? 20 : 10;
  return Math.ceil((value * 1.1) / step) * step;
};

/** Single-series line chart in inline SVG with a hover and focus tooltip. */
export default function ProgressChart({ title, points, yMax, suffix = '', colorClass }: ProgressChartProps) {
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();
  const max = yMax ?? niceMax(Math.max(...points.map((p) => p.value), 0));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v: number) => PAD.top + innerH - (Math.min(v, max) / max) * innerH;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ');
  const activePoint = active !== null ? points[active] : null;
  const last = points[points.length - 1];

  return (
    <figure className="min-w-0 rounded-xl border border-gray-200 bg-white p-3">
      <figcaption id={titleId} className="flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-gray-800">{title}</span>
        <span className="truncate text-xs text-gray-600" aria-live="polite">
          {activePoint ? activePoint.label : last ? `${last.value}${suffix}` : ''}
        </span>
      </figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 h-auto w-full overflow-visible"
        role="img"
        aria-labelledby={titleId}
        onMouseLeave={() => setActive(null)}
      >
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y(max * f)}
              y2={y(max * f)}
              className="stroke-gray-200"
              strokeWidth={1}
            />
            <text x={PAD.left - 6} y={y(max * f) + 4} textAnchor="end" className="fill-gray-500 text-[10px]">
              {Math.round(max * f)}
            </text>
          </g>
        ))}
        {points.length > 1 && <path d={path} fill="none" strokeWidth={2} strokeLinejoin="round" className={colorClass} />}
        {active !== null && (
          <line x1={x(active)} x2={x(active)} y1={PAD.top} y2={PAD.top + innerH} className="stroke-gray-400" strokeDasharray="3 3" />
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={active === i ? 5 : 3.5}
              className={`${colorClass} fill-white`}
              strokeWidth={2}
            />
            {/* Larger invisible hit target than the visible mark. */}
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={12}
              fill="transparent"
              tabIndex={0}
              aria-label={p.label}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
              className="cursor-pointer outline-none"
            />
          </g>
        ))}
        <text x={PAD.left} y={H - 4} className="fill-gray-500 text-[10px]">
          1
        </text>
        <text x={W - PAD.right} y={H - 4} textAnchor="end" className="fill-gray-500 text-[10px]">
          {points.length}
        </text>
      </svg>
    </figure>
  );
}
