import React, { useState } from 'react';
import { ChevronDown, Compass, HelpCircle, Keyboard, Search } from 'lucide-react';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { MotionCard } from '../../ui/Motion';

const SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Open Command Palette' },
  { keys: ['N'], label: 'Create New Project' },
  { keys: ['T'], label: 'Create New Task' },
  { keys: ['Esc'], label: 'Dismiss active dialog or overlay' },
];

const FAQ_ITEMS = [
  {
    q: 'How are Project Statuses (Pending, Running, Ended) calculated?',
    a: 'Unless manually overridden in the project dialog, a project is Ended when all its tasks are Done, Pending when no task has started yet (all in To do), and Running when at least one task is In Progress, In Review, or Done.',
  },
  {
    q: 'How does the Time Tracker connect to Dashboard and Analytics?',
    a: 'When you start the timer on a task and click Stop & Log, a FocusSession is recorded for today and added to the task logged time. Both Weekly Output on the Dashboard and the 7D/30D/90D charts in Analytics read from the same focusSessions store.',
  },
  {
    q: 'How is specialist workload percentage calculated?',
    a: 'Workload is the sum of estimated hours on all open (non-Done) tasks assigned or co-assigned to a team member, divided by their 60-hour sprint capacity window.',
  },
  {
    q: 'Can I undo accidental deletions of projects, tasks, events, or specialists?',
    a: 'Yes. Every delete button requires a second confirmation click and displays an Undo toast notification that restores the full workspace snapshot.',
  },
];

export const HelpScreen: React.FC = () => {
  const setTourStep = useWorkspaceStore((s) => s.setTourStep);
  const setCommandPaletteOpen = useWorkspaceStore((s) => s.setCommandPaletteOpen);

  const [query, setQuery] = useState('');
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) =>
      !query.trim() ||
      item.q.toLowerCase().includes(query.toLowerCase()) ||
      item.a.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-tight">
            Help & Documentation
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Guided tour, keyboard navigation shortcuts, and studio calculation reference.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setTourStep(0)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Compass className="w-4 h-4" />
          <span>Start Interactive Tour</span>
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <MotionCard index={0} hoverLift={false} className="col-span-12 lg:col-span-5 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <Keyboard className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">Keyboard Shortcuts</h2>
                <p className="text-[11px] text-slate-500">Speed up studio navigation</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-bold text-slate-700 cursor-pointer"
            >
              Open ⌘K
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {SHORTCUTS.map((sc) => (
              <div key={sc.label} className="py-3 flex items-center justify-between text-[12px]">
                <span className="font-medium text-slate-700">{sc.label}</span>
                <div className="flex items-center gap-1">
                  {sc.keys.map((k) => (
                    <kbd
                      key={k}
                      className="px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 font-mono-tabular text-[11px] font-bold text-slate-800"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </MotionCard>

        <MotionCard index={1} hoverLift={false} className="col-span-12 lg:col-span-7 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <HelpCircle className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">
                  Studio Reference & FAQ
                </h2>
                <p className="text-[11px] text-slate-500">
                  How metrics, derivations, and persistence work
                </p>
              </div>
            </div>

            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics..."
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[12px] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredFaqs.map((item, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={item.q}
                  className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/50"
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span className="text-[13px] font-bold text-slate-900">{item.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-[12px] text-slate-600 leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </MotionCard>
      </div>
    </div>
  );
};
