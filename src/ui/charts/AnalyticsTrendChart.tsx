import React, { useState } from 'react';
import type { AnalyticsRangeKey } from '../../domain/types';
import { pluralize } from '../../lib/format';
import { MotionCard } from '../Motion';

interface TrendPoint {
  dateIso: string;
  label: string;
  hours: number;
  tasksCount: number;
  isWeekend: boolean;
}

interface AnalyticsTrendChartProps {
  rangeKey: AnalyticsRangeKey;
  rangeDays: number;
  dailyTrend: TrendPoint[];
  maxDailyHours: number;
  totalRangeTaskCompletions: number;
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 200;
const PAD_LEFT = 34;
const PAD_RIGHT = 18;
const PAD_TOP = 18;
const PAD_BOTTOM = 28;

export const AnalyticsTrendChart: React.FC<AnalyticsTrendChartProps> = ({
  rangeKey,
  rangeDays,
  dailyTrend,
  maxDailyHours,
  totalRangeTaskCompletions,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const innerW = CHART_WIDTH - PAD_LEFT - PAD_RIGHT;
  const innerH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM;

  const points = dailyTrend.map((d, idx) => {
    const x =
      PAD_LEFT +
      (dailyTrend.length <= 1 ? innerW / 2 : (idx / (dailyTrend.length - 1)) * innerW);
    const y = PAD_TOP + innerH - (d.hours / maxDailyHours) * innerH;
    return { x, y, data: d, idx };
  });

  const linePath = points
    .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(' ');

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} L ${points[0].x.toFixed(1)} ${(PAD_TOP + innerH).toFixed(1)} Z`
      : '';

  const hoveredPoint = hoveredIdx !== null ? points[hoveredIdx] : null;
  const labelStride = rangeKey === '7D' ? 1 : rangeKey === '30D' ? 5 : 14;

  return (
    <MotionCard index={4} hoverLift={false} className="col-span-12 lg:col-span-7 p-6 flex flex-col justify-between">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-[16px] font-bold text-slate-900 tracking-tight">
            Focus Hours & Task Completions ({rangeKey})
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Daily weekday focus output overlaid with completed deliverable milestones
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
            Focus Hours
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Tasks Completed ({totalRangeTaskCompletions})
          </span>
        </div>
      </div>

      <div className="relative select-none">
        {hoveredPoint && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-[11px] inline-flex items-center gap-3 shadow-md">
            <span className="font-bold">{hoveredPoint.data.label}</span>
            <span className="font-mono-tabular text-slate-200">
              {hoveredPoint.data.hours.toFixed(1)}h focus
            </span>
            <span className="font-mono-tabular text-emerald-300">
              {pluralize(hoveredPoint.data.tasksCount, 'task')} done
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="w-full h-[215px] overflow-visible"
          onMouseLeave={() => setHoveredIdx(null)}
        >
          <defs>
            <linearGradient id="focusAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.24" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map((ratio) => {
            const y = PAD_TOP + innerH * (1 - ratio);
            const val = (maxDailyHours * ratio).toFixed(0);
            return (
              <g key={ratio}>
                <line
                  x1={PAD_LEFT}
                  y1={y}
                  x2={CHART_WIDTH - PAD_RIGHT}
                  y2={y}
                  stroke="#E6E8EE"
                  strokeDasharray="3 3"
                />
                <text
                  x={PAD_LEFT - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 text-[9px] font-mono-tabular"
                >
                  {val}h
                </text>
              </g>
            );
          })}

          {areaPath && <path d={areaPath} fill="url(#focusAreaGrad)" />}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {points.map((p) => (
            <g key={p.data.dateIso}>
              {p.data.tasksCount > 0 && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={rangeDays <= 30 ? 4.2 : 3}
                  className="fill-emerald-500 stroke-white stroke-2"
                />
              )}
              {hoveredIdx === p.idx && (
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={5.5}
                  className="fill-[var(--accent)] stroke-white stroke-2"
                />
              )}
              <rect
                x={p.x - innerW / Math.max(1, points.length) / 2}
                y={PAD_TOP}
                width={innerW / Math.max(1, points.length)}
                height={innerH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(p.idx)}
              />
              {(p.idx % labelStride === 0 || p.idx === points.length - 1) && (
                <text
                  x={p.x}
                  y={CHART_HEIGHT - 6}
                  textAnchor="middle"
                  className="fill-slate-400 text-[9px] font-mono-tabular"
                >
                  {p.data.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </MotionCard>
  );
};
