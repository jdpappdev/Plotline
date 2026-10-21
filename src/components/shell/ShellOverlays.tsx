import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import {
  NewProjectInput,
  NewTaskInput,
  RouteId,
  TaskItem,
  TeamMember,
  ToastNotice,
} from '../../domain/types';
import { getIsoDateOffset, getNowTimestamp } from '../../lib/clock';
import { Dialog } from '../../ui/Dialog';
import CommandPalette from '../CommandPalette';
import { TourOverlay } from '../HelpScreen';
import ImportProjectsModal from '../ImportProjectsModal';
import ProjectDialog from '../ProjectDialog';
import { TASK_CATEGORIES } from './types';

export interface ShellOverlaysProps {
  team: TeamMember[];
  currentUser: TeamMember;
  toasts: ToastNotice[];
  timerRunning: boolean;
  newProjectModalOpen: boolean;
  newTaskModalOpen: boolean;
  logoutConfirmOpen: boolean;
  onNavigate: (routeId: RouteId) => void;
  onSetNewProjectModalOpen: (open: boolean) => void;
  onSetNewTaskModalOpen: (open: boolean) => void;
  onSetLogoutConfirmOpen: (open: boolean) => void;
  onSetSignedOut: (signedOut: boolean) => void;
  onAddProject: (input: NewProjectInput) => void;
  onAddTask: (input: NewTaskInput) => void;
  onDismissToast: (id: string) => void;
}

export function ShellOverlays({
  team,
  currentUser,
  toasts,
  timerRunning,
  newProjectModalOpen,
  newTaskModalOpen,
  logoutConfirmOpen,
  onNavigate,
  onSetNewProjectModalOpen,
  onSetNewTaskModalOpen,
  onSetLogoutConfirmOpen,
  onSetSignedOut,
  onAddProject,
  onAddTask,
  onDismissToast,
}: ShellOverlaysProps) {
  // Global "New project" modal state
  const [projectName, setProjectName] = useState('');
  const [projectClient, setProjectClient] = useState('');
  const [projectDueDate, setProjectDueDate] = useState('2026-12-30');
  const [projectFormError, setProjectFormError] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);
  const savingProjectRef = useRef(false);
  const projectNameInputRef = useRef<HTMLInputElement>(null);

  // Global "New task" modal state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState(TASK_CATEGORIES[0]);
  const [taskPriority, setTaskPriority] = useState<TaskItem['priority']>('High');
  const [taskAssigneeId, setTaskAssigneeId] = useState(currentUser.id);
  const [taskDueDate, setTaskDueDate] = useState(getIsoDateOffset(3));
  const [taskFormError, setTaskFormError] = useState('');
  const [isSavingTask, setIsSavingTask] = useState(false);
  const savingTaskRef = useRef(false);
  const taskTitleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (newProjectModalOpen) {
      savingProjectRef.current = false;
      setIsSavingProject(false);
      setProjectFormError('');
      setTimeout(() => projectNameInputRef.current?.focus(), 30);
    }
  }, [newProjectModalOpen]);

  useEffect(() => {
    if (newTaskModalOpen) {
      savingTaskRef.current = false;
      setIsSavingTask(false);
      setTaskFormError('');
      setTimeout(() => taskTitleInputRef.current?.focus(), 30);
    }
  }, [newTaskModalOpen]);

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (savingProjectRef.current || isSavingProject) return;
    if (!projectName.trim()) {
      setProjectFormError('Project name is required.');
      return;
    }
    if (!projectDueDate) {
      setProjectFormError('Due date is required.');
      return;
    }

    savingProjectRef.current = true;
    setIsSavingProject(true);
    const newId = `prj-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;

    onAddProject({
      id: newId,
      name: projectName.trim(),
      client: projectClient.trim() || 'Independent Field Commission',
      targetDate: projectDueDate,
    });

    setProjectName('');
    setProjectClient('');
    setProjectDueDate('2026-12-30');
    onSetNewProjectModalOpen(false);
    setIsSavingProject(false);
    savingProjectRef.current = false;
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (savingTaskRef.current || isSavingTask) return;
    if (!taskTitle.trim()) {
      setTaskFormError('Task title is required.');
      return;
    }
    if (!taskDueDate) {
      setTaskFormError('Due date is required.');
      return;
    }

    savingTaskRef.current = true;
    setIsSavingTask(true);
    const newId = `tsk-${getNowTimestamp()}-${Math.random().toString(36).slice(2, 6)}`;

    onAddTask({
      id: newId,
      title: taskTitle.trim(),
      category: taskCategory,
      priority: taskPriority,
      assigneeId: taskAssigneeId,
      dueDate: taskDueDate,
    });

    setTaskTitle('');
    onSetNewTaskModalOpen(false);
    setIsSavingTask(false);
    savingTaskRef.current = false;
  };

  return (
    <>
      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette onNavigate={onNavigate} />

      {/* 4-Step Replay Guided Tour Overlay */}
      <TourOverlay onNavigate={onNavigate} />

      {/* Confirm Logout Dialog */}
      <Dialog
        isOpen={logoutConfirmOpen}
        onClose={() => onSetLogoutConfirmOpen(false)}
        eyebrow="Studio Account"
        title="Log out of Plotline?"
        maxWidthClass="sm:max-w-sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => onSetLogoutConfirmOpen(false)}
              className="min-h-[44px] sm:min-h-[36px] px-4 py-2 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSetLogoutConfirmOpen(false);
                onSetSignedOut(true);
              }}
              className="min-h-[44px] sm:min-h-[36px] px-4 py-2 rounded-full text-xs font-semibold bg-[#DC2626] text-white hover:opacity-95 cursor-pointer"
            >
              Log out
            </button>
          </>
        }
      >
        <div className="p-5 sm:p-6">
          <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
            Your projects, tasks, events, and focus sessions remain saved in local storage and will
            be restored when you sign back in.
          </p>
        </div>
      </Dialog>

      {/* Global "New project" Dialog */}
      <Dialog
        isOpen={newProjectModalOpen}
        onClose={() => onSetNewProjectModalOpen(false)}
        eyebrow="Create a project"
        title="New project"
        maxWidthClass="sm:max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => onSetNewProjectModalOpen(false)}
              className="min-h-[44px] sm:min-h-[36px] px-4 py-2 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-project-form"
              disabled={isSavingProject}
              style={{ backgroundColor: 'var(--accent)' }}
              className="min-h-[44px] sm:min-h-[36px] px-5 py-2 rounded-full text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
            >
              {isSavingProject ? 'Creating…' : 'Create project'}
            </button>
          </>
        }
      >
        <form
          id="new-project-form"
          onSubmit={handleCreateProject}
          className="p-5 sm:p-6 space-y-4"
          noValidate
        >
          <div>
            <label
              htmlFor="new-project-name"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1.5"
            >
              Project name <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              ref={projectNameInputRef}
              id="new-project-name"
              type="text"
              required
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (projectFormError) setProjectFormError('');
              }}
              placeholder="e.g. Borealis Magnetometer Array"
              className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
            />
          </div>

          <div>
            <label
              htmlFor="new-project-client"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1.5"
            >
              Client organization
            </label>
            <input
              id="new-project-client"
              type="text"
              value={projectClient}
              onChange={(e) => setProjectClient(e.target.value)}
              placeholder="e.g. Tromsø Geophysical Observatory"
              className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-hairline)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
            />
          </div>

          <div>
            <label
              htmlFor="new-project-due"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1.5"
            >
              Target due date <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              id="new-project-due"
              type="date"
              required
              value={projectDueDate}
              onChange={(e) => setProjectDueDate(e.target.value)}
              className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
            />
          </div>

          {projectFormError && (
            <p role="alert" className="text-xs font-medium text-[var(--status-critical)]">
              {projectFormError}
            </p>
          )}
        </form>
      </Dialog>

      {/* Global "New task" Dialog */}
      <Dialog
        isOpen={newTaskModalOpen}
        onClose={() => onSetNewTaskModalOpen(false)}
        eyebrow="New Task"
        title="New task"
        maxWidthClass="sm:max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => onSetNewTaskModalOpen(false)}
              className="min-h-[44px] sm:min-h-[36px] px-4 py-2 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="new-task-form"
              disabled={isSavingTask}
              style={{ backgroundColor: 'var(--accent)' }}
              className="min-h-[44px] sm:min-h-[36px] px-5 py-2 rounded-full text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSavingTask ? 'Creating…' : 'Create task'}
            </button>
          </>
        }
      >
        <form
          id="new-task-form"
          onSubmit={handleCreateTask}
          className="p-5 sm:p-6 space-y-3.5"
          noValidate
        >
          <div>
            <label
              htmlFor="new-task-title"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
            >
              Title <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              ref={taskTitleInputRef}
              id="new-task-title"
              type="text"
              required
              value={taskTitle}
              onChange={(e) => {
                setTaskTitle(e.target.value);
                if (taskFormError) setTaskFormError('');
              }}
              placeholder="e.g. Verify sonar transducer calibration curve"
              className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="new-task-category"
                className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
              >
                Category
              </label>
              <select
                id="new-task-category"
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
              >
                {TASK_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="new-task-priority"
                className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
              >
                Priority
              </label>
              <select
                id="new-task-priority"
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskItem['priority'])}
                className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="new-task-assignee"
                className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
              >
                Assignee
              </label>
              <select
                id="new-task-assignee"
                value={taskAssigneeId}
                onChange={(e) => setTaskAssigneeId(e.target.value)}
                className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
              >
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="new-task-due"
                className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
              >
                Due date <span style={{ color: 'var(--accent)' }}>*</span>
              </label>
              <input
                id="new-task-due"
                type="date"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
              />
            </div>
          </div>

          {taskFormError && (
            <p role="alert" className="text-xs font-medium text-[var(--status-critical)]">
              {taskFormError}
            </p>
          )}
        </form>
      </Dialog>

      {/* Global Project Dialog */}
      <ProjectDialog />

      {/* Global Import Projects Modal */}
      <ImportProjectsModal />

      {/* Global Toast Notification Stack portaled to document.body */}
      {toasts.length > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-live="polite"
            data-testid="toast-stack"
            style={{
              position: 'fixed',
              zIndex: 'var(--z-toast)',
            }}
            className={`right-4 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0 ${
              timerRunning
                ? 'bottom-[calc(7.5rem+env(safe-area-inset-bottom))] sm:bottom-4'
                : 'bottom-[calc(4.5rem+env(safe-area-inset-bottom))] sm:bottom-4'
            }`}
          >
            {toasts.map((toast) => (
              <div
                key={toast.id}
                className="pointer-events-auto surface-accent-fill text-white border border-white/10 rounded-[var(--radius-md)] p-3.5 shadow-md flex items-center justify-between gap-3 plotline-enter"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-white" />
                  <div className="min-w-0 text-xs">
                    <p className="font-semibold text-white truncate">{toast.title}</p>
                    {toast.detail && (
                      <p className="text-white/80 text-[11px] mt-0.5 truncate">{toast.detail}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {toast.undoAction && (
                    <button
                      type="button"
                      onClick={() => {
                        toast.undoAction?.();
                        onDismissToast(toast.id);
                      }}
                      className="min-h-[36px] px-3 py-1 rounded-full text-xs font-bold bg-white text-[var(--ink-primary)] hover:bg-white/90 cursor-pointer shadow-xs transition-colors"
                    >
                      Undo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onDismissToast(toast.id)}
                    aria-label="Dismiss notification"
                    className="text-white/75 hover:text-white shrink-0 p-1.5 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}
