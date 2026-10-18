import React from 'react';
import type { RouteId } from '../../domain/types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Dialog } from '../../ui/Dialog';

const TOUR_STEPS: Array<{
  title: string;
  route: RouteId;
  description: string;
}> = [
  {
    title: '1. Executive Bento Dashboard',
    route: 'Dashboard',
    description:
      'Monitor your entire studio portfolio at a glance: live project status counts, weekday focus output, upcoming calendar critiques, and the built-in focus timer.',
  },
  {
    title: '2. Kanban Deliverable Board',
    route: 'Tasks',
    description:
      'Drag tasks across To do, In Progress, In Review, and Done. Advancing tasks automatically updates parent project progress percentages and completion rings.',
  },
  {
    title: '3. Velocity & Focus Analytics',
    route: 'Analytics',
    description:
      'Analyze 7D, 30D, and 90D studio throughput, project focus distribution, on-time delivery rate, and cycle time benchmarks.',
  },
];

export const OnboardingTourModal: React.FC = () => {
  const tourStep = useWorkspaceStore((s) => s.tourStep);
  const setTourStep = useWorkspaceStore((s) => s.setTourStep);
  const setActiveRoute = useWorkspaceStore((s) => s.setActiveRoute);

  if (tourStep === null) return null;
  const current = TOUR_STEPS[tourStep] || TOUR_STEPS[0];
  const isLast = tourStep >= TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      setTourStep(null);
      return;
    }
    const nextIdx = tourStep + 1;
    setTourStep(nextIdx);
    setActiveRoute(TOUR_STEPS[nextIdx].route);
  };

  return (
    <Dialog
      open={tourStep !== null}
      onClose={() => setTourStep(null)}
      title={current.title}
      description={`Guided Studio Tour · Step ${tourStep + 1} of ${TOUR_STEPS.length}`}
      maxWidthClass="max-w-[440px]"
      footer={
        <>
          <button
            type="button"
            onClick={() => setTourStep(null)}
            className="px-3.5 py-2 rounded-xl text-[12px] font-bold text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Skip Tour
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold transition-colors cursor-pointer"
          >
            {isLast ? 'Finish Tour' : 'Next Step'}
          </button>
        </>
      }
    >
      <p className="text-[13px] text-slate-600 leading-relaxed">{current.description}</p>
    </Dialog>
  );
};
