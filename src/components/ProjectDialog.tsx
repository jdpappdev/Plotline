import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import {
  getProjectStatus,
  pluralize,
  TaskItem,
  usePlotlineStore,
} from '../store';
import { ContourGlyph } from '../utils/contourGlyph';

export default function ProjectDialog() {
  const {
    projects,
    tasks,
    selectedProjectIdForDialog,
    openProjectDialog,
    updateProject,
    deleteProject,
    moveTask,
    setNewTaskModalOpen,
  } = usePlotlineStore();

  const project = projects.find((p) => p.id === selectedProjectIdForDialog) || null;
  const projectTasks = tasks.filter((t) => t.projectId === selectedProjectIdForDialog);

  const derivedStatus = project ? getProjectStatus(project, tasks) : 'Running';

  const [status, setStatus] = useState<'Pending' | 'Running' | 'Ended'>(derivedStatus);
  const [targetDate, setTargetDate] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [client, setClient] = useState<string>('');

  useEffect(() => {
    if (project) {
      setStatus(getProjectStatus(project, tasks));
      setTargetDate(project.targetDate || '');
      setProgress(project.progress || 0);
      setName(project.name || '');
      setClient(project.client || '');
    }
  }, [project, selectedProjectIdForDialog, tasks]);

  if (!project) return null;

  const handleStatusChange = (newStatus: 'Pending' | 'Running' | 'Ended') => {
    setStatus(newStatus);
    let nextProgress = progress;
    if (newStatus === 'Ended' && progress < 100) {
      nextProgress = 100;
      setProgress(100);
    } else if (newStatus !== 'Ended' && progress === 100) {
      nextProgress = 75;
      setProgress(75);
    }
    updateProject(project.id, {
      statusOverride: newStatus,
      status: newStatus,
      progress: nextProgress,
    });
  };

  const handleProgressChange = (newProgress: number) => {
    const p = Math.max(0, Math.min(100, newProgress));
    setProgress(p);
    let nextStatus = status;
    if (p === 100) {
      nextStatus = 'Ended';
      setStatus('Ended');
    }
    updateProject(project.id, {
      progress: p,
      statusOverride: nextStatus,
      status: nextStatus,
    });
  };

  const handleDateChange = (newDate: string) => {
    setTargetDate(newDate);
    updateProject(project.id, { targetDate: newDate });
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    updateProject(project.id, { name: newName });
  };

  const handleClientChange = (newClient: string) => {
    setClient(newClient);
    updateProject(project.id, { client: newClient });
  };

  const handleDelete = () => {
    deleteProject(project.id);
    openProjectDialog(null);
  };

  return (
    <Dialog
      isOpen={Boolean(selectedProjectIdForDialog)}
      onClose={() => openProjectDialog(null)}
      eyebrow={`Project · ${project.code}`}
      title={project.name}
      subtitle={project.client}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-3.5 py-2 rounded-full text-xs font-semibold text-[#C9352B] bg-[#FBECEE]/70 hover:bg-[#FBECEE] transition-colors cursor-pointer shrink-0"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>

          <button
            type="button"
            onClick={() => openProjectDialog(null)}
            style={{ backgroundColor: 'var(--accent)' }}
            className="min-h-[44px] px-5 py-2 rounded-full text-xs font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer"
          >
            Done
          </button>
        </div>
      }
    >
      <div className="p-5 sm:p-6 space-y-5">
        {/* Editable Identity Section */}
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <ContourGlyph
              seed={project.name}
              className="w-10 h-10 rounded-lg border border-[var(--border-subtle)] shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--ink-secondary)]">
                  {project.code}
                </span>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    status === 'Ended'
                      ? 'bg-[#E8F4EC] text-[#216E3E]'
                      : status === 'Running'
                      ? 'bg-[#FEF5E6] text-[#9B5B0B]'
                      : 'bg-[#EEEBF9] text-[#5B43B8]'
                  }`}
                >
                  {status}
                </span>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                aria-label="Project name"
                className="text-base sm:text-lg font-bold text-[var(--ink-primary)] bg-transparent hover:bg-[var(--surface-sunken)] focus:bg-[var(--surface-sunken)] focus:outline-none rounded px-1.5 py-1 -ml-1.5 transition-colors w-full min-h-[40px]"
                placeholder="Project name"
              />
              <input
                type="text"
                value={client}
                onChange={(e) => handleClientChange(e.target.value)}
                aria-label="Client name"
                className="text-xs text-[var(--ink-secondary)] bg-transparent hover:bg-[var(--surface-sunken)] focus:bg-[var(--surface-sunken)] focus:outline-none rounded px-1.5 py-1 -ml-1.5 transition-colors w-full min-h-[36px]"
                placeholder="Client name"
              />
            </div>
          </div>
        </div>

        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[var(--surface-sunken)] p-3.5 rounded-[var(--radius-md)] border border-[var(--border-hairline)]">
          {/* Status Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--ink-secondary)]">Status</label>
            <select
              value={status}
              onChange={(e) =>
                handleStatusChange(e.target.value as 'Pending' | 'Running' | 'Ended')
              }
              className="w-full min-h-[44px] sm:min-h-[38px] text-xs font-medium bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-md px-2.5 py-1.5 text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
            >
              <option value="Running">Running</option>
              <option value="Pending">Pending</option>
              <option value="Ended">Ended</option>
            </select>
          </div>

          {/* Target Date */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--ink-secondary)]">
              Target Due Date
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-full min-h-[44px] sm:min-h-[38px] text-xs font-medium bg-[var(--surface-elevated)] border border-[var(--border-strong)] rounded-md px-2.5 py-1.5 text-[var(--ink-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
            />
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[var(--ink-secondary)]">
              <span>Progress</span>
              <span className="tabular-nums">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleProgressChange(Number(e.target.value))}
              className="w-full h-6 accent-[var(--accent)] cursor-pointer"
            />
          </div>
        </div>

        {/* Tasks Section */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-[var(--ink-primary)]">
                Project Deliverables
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[var(--surface-sunken)] text-[var(--ink-secondary)]">
                {pluralize(projectTasks.length, 'task')}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setNewTaskModalOpen(true);
              }}
              style={{ backgroundColor: 'var(--accent)' }}
              className="inline-flex items-center gap-1.5 min-h-[44px] sm:min-h-[34px] px-3.5 py-1.5 rounded-full text-xs font-semibold text-white hover:opacity-90 cursor-pointer transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add task</span>
            </button>
          </div>

          {projectTasks.length === 0 ? (
            <div className="text-center py-6 px-4 border border-dashed border-[var(--border-strong)] rounded-lg text-xs text-[var(--ink-secondary)] space-y-2">
              <p className="font-semibold text-[var(--ink-primary)]">No tasks yet</p>
              <p className="text-[11px] text-[var(--ink-secondary)]">
                This project has no deliverables assigned. Progress is 0% and status is Pending.
              </p>
              <button
                type="button"
                onClick={() => setNewTaskModalOpen(true)}
                style={{ backgroundColor: 'var(--accent)' }}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-full text-xs font-semibold text-white cursor-pointer hover:opacity-95 shadow-2xs mt-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add task</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {projectTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--surface-elevated)] hover:bg-[var(--surface-sunken)] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[var(--surface-sunken)] text-[var(--ink-secondary)] shrink-0">
                        {task.code}
                      </span>
                      <span className="text-xs font-medium text-[var(--ink-primary)] truncate">
                        {task.title}
                      </span>
                    </div>
                  </div>

                  <select
                    value={task.status}
                    onChange={(e) => moveTask(task.id, e.target.value as TaskItem['status'])}
                    className="min-h-[40px] sm:min-h-[32px] text-xs font-medium bg-[var(--surface-sunken)] border border-[var(--border-hairline)] rounded px-2 py-1 text-[var(--ink-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] cursor-pointer shrink-0"
                  >
                    <option value="Backlog">Backlog</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
