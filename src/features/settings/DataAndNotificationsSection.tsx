import React, { useState } from 'react';
import { Bell, CheckCircle2, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import type { NotificationSettings, WorkspaceValidationReport } from '../../domain/types';
import { MotionCard } from '../../ui/Motion';

interface DataAndNotificationsProps {
  notifications: NotificationSettings;
  onToggleNotification: (key: keyof NotificationSettings) => void;
  onRunValidation: () => WorkspaceValidationReport;
  onResetDemoData: () => void;
}

const NOTIFICATION_ITEMS: Array<{
  key: keyof NotificationSettings;
  label: string;
  description: string;
}> = [
  {
    key: 'emailDigests',
    label: 'Daily Studio Digest',
    description: 'Morning summary of scheduled reviews and due deliverables.',
  },
  {
    key: 'milestoneAlerts',
    label: 'Project Milestone Alerts',
    description: 'Notify when project status transitions between Pending, Running, and Ended.',
  },
  {
    key: 'taskMentions',
    label: 'Task Assignment Mentions',
    description: 'Immediate alert when assigned or co-assigned to a deliverable.',
  },
  {
    key: 'focusReminders',
    label: 'Focus Session Reminders',
    description: 'Gentle prompt when timer runs continuously past 90 minutes.',
  },
  {
    key: 'weeklyReport',
    label: 'Weekly Analytics Readout',
    description: 'Friday afternoon velocity, cycle time, and focus hour summary.',
  },
];

export const DataAndNotificationsSection: React.FC<DataAndNotificationsProps> = ({
  notifications,
  onToggleNotification,
  onRunValidation,
  onResetDemoData,
}) => {
  const [report, setReport] = useState<WorkspaceValidationReport | null>(() =>
    onRunValidation()
  );

  const handleVerify = () => {
    setReport(onRunValidation());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <MotionCard index={2} hoverLift={false} className="p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Notifications</h2>
            <p className="text-[11px] text-slate-500">
              Control studio alerts and automated digest delivery
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {NOTIFICATION_ITEMS.map((item) => {
            const enabled = notifications[item.key];
            return (
              <div
                key={item.key}
                className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-[13px] font-bold text-slate-900">{item.label}</div>
                  <div className="text-[11px] text-slate-500">{item.description}</div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() => onToggleNotification(item.key)}
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                    enabled ? 'bg-[var(--accent)]' : 'bg-slate-200'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-2xs transition-transform ${
                      enabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </MotionCard>

      <MotionCard index={3} hoverLift={false} className="p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-[15px] font-bold text-slate-900">
                  Workspace Data Integrity
                </h2>
                <p className="text-[11px] text-slate-500">
                  Verify relational consistency across projects, tasks, and focus logs
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleVerify}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition-colors cursor-pointer"
            >
              Run Check
            </button>
          </div>

          {report && (
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {report.checks.map((chk) => (
                <div
                  key={chk.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-2.5 text-[11px]"
                >
                  {chk.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800">{chk.label}</div>
                    <div className="text-slate-500 font-mono-tabular truncate">
                      {chk.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-[12px] font-bold text-slate-800">Reset Demo Workspace</div>
            <div className="text-[11px] text-slate-500">
              Restore initial benchmark projects, tasks, and focus sessions
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onResetDemoData();
              setTimeout(handleVerify, 30);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] font-bold transition-colors cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </MotionCard>
    </div>
  );
};
