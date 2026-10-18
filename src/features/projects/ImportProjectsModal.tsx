import React, { useState } from 'react';
import { FileSpreadsheet, Sparkles } from 'lucide-react';
import type { DerivedProjectStatus } from '../../domain/types';
import { getIsoDateOffset } from '../../lib/dates';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Dialog } from '../../ui/Dialog';

const SAMPLE_CSV = `Aethelgard Glacier Lidar Grid, Nordic Cryosphere Institute, ${getIsoDateOffset(45)}, Running
Vespera Maritime Route Telemetry, Vespera Shipping Ltd, ${getIsoDateOffset(30)}, Pending
Solstice Civic Transit Kiosk, Metro Mobility Authority, ${getIsoDateOffset(52)}, Pending`;

function parseImportLines(raw: string): Array<{
  name: string;
  client: string;
  targetDate: string;
  status: DerivedProjectStatus;
}> {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(',').map((s) => s.trim());
      const statusRaw = (parts[3] || 'Pending').toLowerCase();
      const status: DerivedProjectStatus =
        statusRaw === 'ended' ? 'Ended' : statusRaw === 'running' ? 'Running' : 'Pending';
      return {
        name: parts[0] || '',
        client: parts[1] || 'Imported Partner',
        targetDate: parts[2] || getIsoDateOffset(30),
        status,
      };
    })
    .filter((item) => Boolean(item.name));
}

export const ImportProjectsModal: React.FC = () => {
  const open = useWorkspaceStore((s) => s.importModalOpen);
  const setImportModalOpen = useWorkspaceStore((s) => s.setImportModalOpen);
  const importProjects = useWorkspaceStore((s) => s.importProjects);

  const [csvText, setCsvText] = useState(SAMPLE_CSV);

  const previewRows = parseImportLines(csvText);

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewRows.length === 0) return;
    importProjects(previewRows);
    setImportModalOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={() => setImportModalOpen(false)}
      title="Import Project Portfolio"
      description="Paste CSV rows (Name, Client, Due YYYY-MM-DD, Status) or load sample studio streams."
      maxWidthClass="max-w-[540px]"
      footer={
        <>
          <button
            type="button"
            onClick={() => setCsvText(SAMPLE_CSV)}
            className="mr-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-[var(--accent)] hover:bg-[var(--accent-soft)] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Load Sample Batch</span>
          </button>
          <button
            type="button"
            onClick={() => setImportModalOpen(false)}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="import-projects-form"
            disabled={previewRows.length === 0}
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white text-[12px] font-bold transition-colors cursor-pointer"
          >
            Import ({previewRows.length})
          </button>
        </>
      }
    >
      <form id="import-projects-form" onSubmit={handleImport} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            CSV Payload (Name, Client, Target Date, Status)
          </label>
          <textarea
            rows={4}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Project Name, Client, 2026-12-01, Running"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[12px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
            <span className="inline-flex items-center gap-1.5">
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              Parsed Preview
            </span>
            <span>{previewRows.length} rows ready</span>
          </div>
          <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
            {previewRows.map((row, idx) => (
              <div
                key={`${row.name}-${idx}`}
                className="flex items-center justify-between text-[12px] bg-white px-3 py-1.5 rounded-lg border border-slate-200/60"
              >
                <div className="truncate font-semibold text-slate-800">
                  {row.name}{' '}
                  <span className="text-slate-400 font-normal">· {row.client}</span>
                </div>
                <span className="text-[11px] font-mono-tabular text-slate-500 shrink-0 ml-2">
                  {row.targetDate}
                </span>
              </div>
            ))}
          </div>
        </div>
      </form>
    </Dialog>
  );
};
