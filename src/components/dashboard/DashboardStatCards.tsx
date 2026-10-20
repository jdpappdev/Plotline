import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { pluralize } from '../../domain/derivations/analytics';
import { CountUpNumeral } from './CountUpNumeral';

export interface DashboardStatCardsProps {
  totalCount: number;
  endedCount: number;
  runningCount: number;
  pendingCount: number;
  openTasksCount: number;
  onNavigateProjects: (statusFilter?: 'ended' | 'running' | 'pending') => void;
}

export function DashboardStatCards({
  totalCount,
  endedCount,
  runningCount,
  pendingCount,
  openTasksCount,
  onNavigateProjects,
}: DashboardStatCardsProps) {
  return (
    <>
      {/* Card 1: Total */}
      <button
        type="button"
        onClick={() => onNavigateProjects()}
        aria-label={`View ${pluralize(totalCount, 'project')}`}
        style={
          {
            '--stagger-index': 1,
            background: 'var(--surface-accent)',
          } as React.CSSProperties
        }
        className="plotline-enter group text-left col-span-1 sm:col-span-1 xl:col-span-3 sm:order-1 rounded-[var(--radius-lg)] p-3.5 sm:p-4 text-white flex flex-col justify-between shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-white cursor-pointer hover:opacity-98 transition-all"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-white">Total</span>
          <span
            style={{ color: 'var(--accent-deep)' }}
            className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
          >
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
        <CountUpNumeral
          value={totalCount}
          className="text-3xl sm:text-4xl font-semibold leading-none tracking-tight text-white my-1"
        />
        <p className="text-[11px] sm:text-xs text-white/90 max-h-[2.5rem] overflow-hidden leading-snug">
          {pluralize(totalCount, 'project')} · {pluralize(openTasksCount, 'open task')}
        </p>
      </button>

      {/* Card 2: Ended */}
      <button
        type="button"
        onClick={() => onNavigateProjects('ended')}
        aria-label={`View ${pluralize(endedCount, 'ended project')}`}
        style={{ '--stagger-index': 2 } as React.CSSProperties}
        className="plotline-enter group text-left col-span-1 sm:col-span-1 xl:col-span-3 sm:order-2 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer hover:border-[var(--border-strong)] transition-all"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--ink-primary)]">Ended</span>
          <span className="w-7 h-7 rounded-full border border-[var(--border-strong)] text-[var(--ink-primary)] flex items-center justify-center shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
        <CountUpNumeral
          value={endedCount}
          className="text-3xl sm:text-4xl font-semibold leading-none tracking-tight text-[var(--ink-primary)] my-1"
        />
        <p className="text-[11px] sm:text-xs text-[var(--ink-secondary)] max-h-[2.5rem] overflow-hidden leading-snug">
          {pluralize(endedCount, 'project')} · {pluralize(openTasksCount, 'open task')}
        </p>
      </button>

      {/* Card 3: Running */}
      <button
        type="button"
        onClick={() => onNavigateProjects('running')}
        aria-label={`View ${pluralize(runningCount, 'running project')}`}
        style={{ '--stagger-index': 3 } as React.CSSProperties}
        className="plotline-enter group text-left col-span-1 sm:col-span-1 xl:col-span-3 sm:order-3 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer hover:border-[var(--border-strong)] transition-all"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--ink-primary)]">Running</span>
          <span className="w-7 h-7 rounded-full border border-[var(--border-strong)] text-[var(--ink-primary)] flex items-center justify-center shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
        <CountUpNumeral
          value={runningCount}
          className="text-3xl sm:text-4xl font-semibold leading-none tracking-tight text-[var(--ink-primary)] my-1"
        />
        <p className="text-[11px] sm:text-xs text-[var(--ink-secondary)] max-h-[2.5rem] overflow-hidden leading-snug">
          {pluralize(runningCount, 'project')} · {pluralize(openTasksCount, 'open task')}
        </p>
      </button>

      {/* Card 4: Pending */}
      <button
        type="button"
        onClick={() => onNavigateProjects('pending')}
        aria-label={`View ${pluralize(pendingCount, 'pending project')}`}
        style={{ '--stagger-index': 4 } as React.CSSProperties}
        className="plotline-enter group text-left col-span-1 sm:col-span-1 xl:col-span-3 sm:order-4 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-3.5 sm:p-4 flex flex-col justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer hover:border-[var(--border-strong)] transition-all"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-[var(--ink-primary)]">Pending</span>
          <span className="w-7 h-7 rounded-full border border-[var(--border-strong)] text-[var(--ink-primary)] flex items-center justify-center shrink-0 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        </div>
        <CountUpNumeral
          value={pendingCount}
          className="text-3xl sm:text-4xl font-semibold leading-none tracking-tight text-[var(--ink-primary)] my-1"
        />
        <p className="text-[11px] sm:text-xs text-[var(--ink-secondary)] max-h-[2.5rem] overflow-hidden leading-snug">
          {pluralize(pendingCount, 'project')} · {pluralize(openTasksCount, 'open task')}
        </p>
      </button>
    </>
  );
}
