import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnchorBox, AnchoredTooltip } from '../../ui/Popover';
import { AnalyticsRangeKey, ThroughputChartPoint } from './types';

export interface ThroughputChartProps {
  range: AnalyticsRangeKey;
  chartPoints: ThroughputChartPoint[];
  hoveredPointIdx: number | null;
  onHoverPointChange: React.Dispatch<React.SetStateAction<number | null>>;
}

export function ThroughputChart({
  range,
  chartPoints,
  hoveredPointIdx,
  onHoverPointChange,
}: ThroughputChartProps) {
  const [tooltipAnchorRect, setTooltipAnchorRect] = useState<AnchorBox | null>(null);
  const throughputSvgRef = useRef<SVGSVGElement | null>(null);

  // Throughput SVG geometry
  const svgW = 620;
  const svgH = 190;
  const padL = 32;
  const padR = 14;
  const padT = 16;
  const padB = 26;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const maxChartVal = useMemo(() => {
    const vals = chartPoints.flatMap((p) => [p.hours, p.prevHours, p.avg7d]);
    return Math.max(9, ...vals);
  }, [chartPoints]);

  const chartCoords = useMemo(() => {
    const n = chartPoints.length;
    return chartPoints.map((pt, idx) => {
      const x = padL + (n <= 1 ? 0 : (idx / (n - 1)) * plotW);
      const yCurr = padT + plotH - (pt.hours / maxChartVal) * plotH;
      const yPrev = padT + plotH - (pt.prevHours / maxChartVal) * plotH;
      const yAvg = padT + plotH - (pt.avg7d / maxChartVal) * plotH;
      return {
        ...pt,
        x: Number(x.toFixed(1)),
        yCurr: Number(yCurr.toFixed(1)),
        yPrev: Number(yPrev.toFixed(1)),
        yAvg: Number(yAvg.toFixed(1)),
      };
    });
  }, [chartPoints, maxChartVal, plotH, plotW]);

  // Today (Sunday) = 0h, so the dashed segment is omitted when today has 0 hours
  const todayHasHours = (chartCoords.at(-1)?.seconds ?? 0) > 0;
  const solidChartCoords = todayHasHours
    ? chartCoords.slice(0, Math.max(1, chartCoords.length - 1))
    : chartCoords;
  const currentLineSolidPoints = solidChartCoords.map((p) => `${p.x},${p.yCurr}`).join(' ');
  const currentLineTodayDashedPoints =
    todayHasHours && chartCoords.length >= 2
      ? chartCoords
          .slice(-2)
          .map((p) => `${p.x},${p.yCurr}`)
          .join(' ')
      : '';
  const prevLinePoints = chartCoords.map((p) => `${p.x},${p.yPrev}`).join(' ');
  const avgLinePoints = chartCoords.map((p) => `${p.x},${p.yAvg}`).join(' ');
  const currentAreaPath =
    chartCoords.length > 1
      ? `M ${chartCoords[0].x},${padT + plotH} L ${chartCoords
          .map((p) => `${p.x},${p.yCurr}`)
          .join(' L ')} L ${chartCoords[chartCoords.length - 1].x},${padT + plotH} Z`
      : '';

  const hoveredPoint = hoveredPointIdx !== null ? chartCoords[hoveredPointIdx] || null : null;

  const updateThroughputTooltipRect = useCallback(
    (idx: number | null) => {
      if (idx === null || !throughputSvgRef.current) {
        setTooltipAnchorRect(null);
        return;
      }
      const pt = chartCoords[idx];
      if (!pt) {
        setTooltipAnchorRect(null);
        return;
      }
      const svgRect = throughputSvgRef.current.getBoundingClientRect();
      const px = svgRect.left + (pt.x / svgW) * svgRect.width;
      const py = svgRect.top + (pt.yCurr / svgH) * svgRect.height;
      setTooltipAnchorRect({
        top: py - 10,
        bottom: py + 10,
        left: px - 10,
        right: px + 10,
        width: 20,
        height: 20,
      });
    },
    [chartCoords, svgH, svgW]
  );

  useEffect(() => {
    updateThroughputTooltipRect(hoveredPointIdx);
  }, [hoveredPointIdx, updateThroughputTooltipRect]);

  return (
    <section
      aria-labelledby="throughput-chart-heading"
      style={{ '--stagger-index': 5 } as React.CSSProperties}
      className="plotline-enter lg:col-span-7 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between gap-3 relative min-w-0"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2
            id="throughput-chart-heading"
            className="text-base font-semibold text-[var(--ink-primary)]"
          >
            Throughput ({range})
          </h2>
          <p className="text-xs text-[var(--ink-secondary)]">
            Daily focus hours vs. previous {range} and 7-day moving average
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[var(--ink-secondary)] flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent)' }}
            />
            <span>Current</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-b border-dashed border-[var(--ink-muted)]" />
            <span>Previous</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="w-2.5 h-0.5 rounded-full"
              style={{ backgroundColor: 'var(--accent-tint-2)' }}
            />
            <span>7d Avg</span>
          </span>
        </div>
      </div>

      <div className="relative w-full">
        {/* Hover / Tap Tooltip rendered via Portal to document.body */}
        <AnchoredTooltip
          isOpen={Boolean(hoveredPoint && tooltipAnchorRect)}
          anchorRect={tooltipAnchorRect}
          dataTestId="throughput-tooltip"
          className="px-3 py-1.5 text-[11px] flex items-center flex-wrap gap-x-3 gap-y-1 font-ui-tabular max-w-[calc(100vw-16px)]"
        >
          {hoveredPoint && (
            <>
              <span className="font-semibold text-[var(--ink-primary)]">
                {hoveredPoint.label}
                {hoveredPoint.daysAgo === 0 ? ' (today)' : ''}
              </span>
              <span style={{ color: 'var(--accent)' }} className="font-semibold">
                Current: {hoveredPoint.formattedDuration}
              </span>
              <span className="text-[var(--ink-secondary)]">Prev: {hoveredPoint.prevHours}h</span>
              <span className="text-[var(--ink-muted)]">7d Avg: {hoveredPoint.avg7d}h</span>
            </>
          )}
        </AnchoredTooltip>

        <svg
          ref={throughputSvgRef}
          viewBox={`0 0 ${svgW} ${svgH}`}
          className="w-full h-auto overflow-visible select-none touch-manipulation"
          onMouseLeave={() => onHoverPointChange(null)}
        >
          <defs>
            <linearGradient id="throughput-area-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid Lines */}
          {[0, 0.5, 1].map((frac) => {
            const y = padT + frac * plotH;
            const val = Math.round(maxChartVal * (1 - frac));
            return (
              <g key={frac}>
                <line
                  x1={padL}
                  y1={y}
                  x2={svgW - padR}
                  y2={y}
                  stroke="var(--border-hairline)"
                  strokeWidth="1"
                />
                <text x={padL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--ink-muted)">
                  {val}h
                </text>
              </g>
            );
          })}

          {/* Area under current line */}
          {currentAreaPath && <path d={currentAreaPath} fill="url(#throughput-area-grad)" />}

          {/* Previous Period Dashed Line */}
          <polyline
            fill="none"
            stroke="var(--ink-muted)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            points={prevLinePoints}
          />

          {/* 7-Day Moving Average Line */}
          <polyline
            fill="none"
            stroke="var(--accent-tint-2)"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={avgLinePoints}
          />

          {/* Current Period Solid Line */}
          <polyline
            data-testid="throughput-current-solid"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={currentLineSolidPoints}
          />

          {/* Incomplete Current Day Dashed Segment (omitted when Today = 0h) */}
          {currentLineTodayDashedPoints && (
            <polyline
              data-testid="throughput-today-dashed"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.25"
              strokeDasharray="4 4"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={currentLineTodayDashedPoints}
            />
          )}

          {/* Crosshair & Active Point */}
          {hoveredPoint && (
            <g>
              <line
                x1={hoveredPoint.x}
                y1={padT}
                x2={hoveredPoint.x}
                y2={padT + plotH}
                stroke="var(--accent)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.yCurr}
                r="4.5"
                fill="var(--accent)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          )}

          {/* Invisible Hover & Tap Columns for Smooth Crosshair Scrubbing */}
          {chartCoords.map((pt, idx) => {
            const colWidth = plotW / Math.max(1, chartCoords.length);
            return (
              <rect
                key={pt.date}
                data-testid={`throughput-hit-${idx}`}
                x={pt.x - colWidth / 2}
                y={padT}
                width={colWidth}
                height={plotH}
                fill="transparent"
                className="cursor-crosshair"
                onMouseEnter={() => onHoverPointChange(idx)}
                onTouchStart={() => onHoverPointChange(idx)}
                onClick={() => onHoverPointChange((prev) => (prev === idx ? null : idx))}
              />
            );
          })}

          {/* X-axis Labels (non-overlapping start/middle/end anchors) */}
          {chartCoords.map((pt, idx) => {
            const isFirst = idx === 0;
            const isMid = idx === Math.floor(chartCoords.length / 2);
            const isLast = idx === chartCoords.length - 1;
            if (!isFirst && !isMid && !isLast) return null;
            return (
              <text
                key={pt.date}
                x={pt.x}
                y={svgH - 6}
                textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                fontSize="10"
                fill="var(--ink-muted)"
              >
                {pt.label}
              </text>
            );
          })}
        </svg>
      </div>
    </section>
  );
}
