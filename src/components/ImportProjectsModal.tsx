import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Download, Upload } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { usePlotlineStore } from '../store';
import { pluralize } from '../utils/string';

interface ParsedRow {
  name: string;
  client: string;
  targetDate: string;
  status: 'Pending' | 'Running' | 'Ended';
  isValid: boolean;
  error?: string;
}

export default function ImportProjectsModal() {
  const { importModalOpen, setImportModalOpen, importProjects } = usePlotlineStore();

  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [parseError, setParseError] = useState<string>('');

  const handleDownloadTemplate = () => {
    const csvContent = [
      'name,client,due_date,status',
      'Aurora Field Guide App,Aurora Outdoors,2027-02-15,pending',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plotline_projects_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const parseStatus = (val: string): 'Pending' | 'Running' | 'Ended' | null => {
    if (!val) return 'Running';
    const clean = val.trim().toLowerCase();
    if (clean === 'running' || clean === 'on track' || clean === 'at risk') return 'Running';
    if (clean === 'pending' || clean === 'planning') return 'Pending';
    if (clean === 'ended' || clean === 'completed') return 'Ended';
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) {
        setParseError('File is empty.');
        return;
      }

      try {
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(content);
          if (!Array.isArray(json)) {
            setParseError('JSON file must contain an array of project objects.');
            return;
          }
          const parsed = json.map((item: Record<string, unknown>) => {
            const name = String(item.name || item.title || '').trim();
            const client = String(item.client || '').trim();
            const rawDate = String(item.due_date || item.targetDate || item.dueDate || '').trim();
            const rawStatus = String(item.status || '').trim();

            const parsedStat = parseStatus(rawStatus);
            let isValid = true;
            let error = '';

            if (!name) {
              isValid = false;
              error = 'Missing project name';
            } else if (!rawDate || Number.isNaN(Date.parse(rawDate))) {
              isValid = false;
              error = 'Invalid due_date format (expect YYYY-MM-DD)';
            } else if (!parsedStat) {
              isValid = false;
              error = 'Invalid status (expect Running, Pending, or Ended)';
            }

            return {
              name,
              client: client || 'Imported Partner',
              targetDate: rawDate,
              status: parsedStat || 'Running',
              isValid,
              error,
            };
          });

          setRows(parsed);
        } else {
          // CSV Parsing
          const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
          if (lines.length < 2) {
            setParseError('CSV must include a header row and at least one data row.');
            return;
          }

          const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
          const nameIdx = header.findIndex((h) => h === 'name' || h === 'title');
          const clientIdx = header.findIndex((h) => h === 'client');
          const dateIdx = header.findIndex(
            (h) => h === 'due_date' || h === 'targetdate' || h === 'duedate'
          );
          const statusIdx = header.findIndex((h) => h === 'status');

          if (nameIdx === -1) {
            setParseError('CSV header missing required "name" column.');
            return;
          }

          const parsed: ParsedRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
            const name = cols[nameIdx] || '';
            const client = clientIdx !== -1 ? cols[clientIdx] || '' : '';
            const rawDate = dateIdx !== -1 ? cols[dateIdx] || '' : '';
            const rawStatus = statusIdx !== -1 ? cols[statusIdx] || '' : '';

            const parsedStat = parseStatus(rawStatus);
            let isValid = true;
            let error = '';

            if (!name) {
              isValid = false;
              error = 'Missing project name';
            } else if (!rawDate || Number.isNaN(Date.parse(rawDate))) {
              isValid = false;
              error = 'Invalid due_date format (expect YYYY-MM-DD)';
            } else if (!parsedStat) {
              isValid = false;
              error = 'Invalid status (expect Running, Pending, or Ended)';
            }

            parsed.push({
              name,
              client: client || 'Imported Partner',
              targetDate: rawDate,
              status: parsedStat || 'Running',
              isValid,
              error,
            });
          }

          setRows(parsed);
        }
      } catch {
        setParseError('Failed to parse file. Please check file format.');
      }
    };

    reader.readAsText(file);
  };

  const handleImport = () => {
    const validRows = rows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    importProjects(
      validRows.map((r) => ({
        name: r.name,
        client: r.client,
        targetDate: r.targetDate,
        status: r.status,
      }))
    );

    setImportModalOpen(false);
    setRows([]);
    setFileName('');
  };

  const validCount = rows.filter((r) => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return (
    <Dialog
      isOpen={importModalOpen}
      onClose={() => setImportModalOpen(false)}
      eyebrow="Portfolio Batch"
      title="Import Projects"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <button
            type="button"
            onClick={() => setImportModalOpen(false)}
            className="min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold bg-[var(--surface-sunken)] text-[var(--ink-primary)] hover:bg-[var(--border-subtle)] transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {rows.length > 0 && (
            <button
              type="button"
              disabled={validCount === 0}
              onClick={handleImport}
              style={{ backgroundColor: 'var(--accent)' }}
              className="min-h-[44px] px-5 py-2 rounded-full text-xs font-semibold text-white hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer"
            >
              Import {pluralize(validCount, 'valid row')}
            </button>
          )}
        </div>
      }
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Top Controls: Template & File Input */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface-sunken)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border-hairline)]">
          <div>
            <h3 className="text-xs font-semibold text-[var(--ink-primary)]">CSV or JSON Import</h3>
            <p className="text-[11px] text-[var(--ink-secondary)]">
              Required columns: <code className="font-mono">name, client, due_date, status</code>
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] sm:min-h-[36px] px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[var(--surface-elevated)] border border-[var(--border-strong)] text-[var(--ink-primary)] hover:bg-[var(--border-hairline)] cursor-pointer transition-colors shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>Download template</span>
          </button>
        </div>

        {/* Upload Drop Area */}
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--accent)] rounded-[var(--radius-lg)] bg-[var(--surface-elevated)] cursor-pointer transition-colors group">
          <Upload className="w-8 h-8 text-[var(--ink-muted)] group-hover:text-[var(--accent)] transition-colors mb-2" />
          <span className="text-xs font-semibold text-[var(--ink-primary)] text-center">
            {fileName ? `Selected: ${fileName}` : 'Click to select CSV or JSON file'}
          </span>
          <span className="text-[11px] text-[var(--ink-secondary)] mt-0.5">
            Accepts .csv or .json files
          </span>
          <input
            type="file"
            accept=".csv, .json, text/csv, application/json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {parseError && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{parseError}</span>
          </div>
        )}

        {/* Preview Table */}
        {rows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[var(--ink-primary)]">
              <span>Preview & Validation</span>
              <span className="text-[11px] text-[var(--ink-secondary)] font-mono">
                {validCount} valid · {invalidCount} invalid
              </span>
            </div>

            <div className="max-h-60 overflow-x-auto overflow-y-auto border border-[var(--border-hairline)] rounded-[var(--radius-md)]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[var(--surface-sunken)] border-b border-[var(--border-hairline)] text-[var(--ink-secondary)] sticky top-0">
                  <tr>
                    <th className="p-2 font-medium">#</th>
                    <th className="p-2 font-medium">Name</th>
                    <th className="p-2 font-medium">Client</th>
                    <th className="p-2 font-medium">Due Date</th>
                    <th className="p-2 font-medium">Status</th>
                    <th className="p-2 font-medium">Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-hairline)] bg-[var(--surface-elevated)]">
                  {rows.map((r, idx) => (
                    <tr key={idx} className={r.isValid ? '' : 'bg-red-50/50 dark:bg-red-950/10'}>
                      <td className="p-2 font-mono text-[var(--ink-muted)]">{idx + 1}</td>
                      <td className="p-2 font-semibold text-[var(--ink-primary)]">
                        {r.name || '—'}
                      </td>
                      <td className="p-2 text-[var(--ink-secondary)]">{r.client}</td>
                      <td className="p-2 font-mono text-[var(--ink-secondary)]">
                        {r.targetDate || '—'}
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            r.status === 'Ended'
                              ? 'bg-[#E8F4EC] text-[#216E3E]'
                              : r.status === 'Running'
                                ? 'bg-[#FEF5E6] text-[#9B5B0B]'
                                : 'bg-[#EEEBF9] text-[#5B43B8]'
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {r.isValid ? (
                          <span className="inline-flex items-center gap-1 text-[#216E3E] text-[11px] font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Valid</span>
                          </span>
                        ) : (
                          <span
                            className="inline-flex items-center gap-1 text-red-600 text-[11px] font-medium"
                            title={r.error}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[120px]">{r.error}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
