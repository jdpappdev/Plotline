import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  CornerDownLeft,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  Palette,
  Play,
  Plus,
  Search,
  Settings as SettingsIcon,
  Square,
  User,
  Users,
  X,
} from 'lucide-react';
import { ACCENT_THEMES, AccentName, RouteId, usePlotlineStore } from '../store';
import { ContourGlyph } from '../utils/contourGlyph';

export interface CommandPaletteItem {
  id: string;
  group: 'Actions' | 'Pages' | 'Projects' | 'Tasks' | 'People';
  label: string;
  subtitle?: string;
  keywords: string;
  seed?: string;
  accentHex?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

interface CommandPaletteProps {
  onNavigate: (route: RouteId) => void;
}

export default function CommandPalette({ onNavigate }: CommandPaletteProps) {
  const {
    commandPaletteOpen,
    projects,
    tasks,
    team,
    accent,
    timerRunning,
    timerTaskId,
    setCommandPaletteOpen,
    setNewProjectModalOpen,
    setNewTaskModalOpen,
    setSelectedProfileMemberId,
    setAccent,
    toggleTimer,
    resetTimer,
    setTimerTask,
    pushToast,
  } = usePlotlineStore();

  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      if (document.activeElement instanceof HTMLElement) {
        previousFocusRef.current = document.activeElement;
      }
      setQuery('');
      setActiveIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    } else if (previousFocusRef.current) {
      const el = previousFocusRef.current;
      previousFocusRef.current = null;
      if (document.body.contains(el)) {
        el.focus();
      }
    }
  }, [commandPaletteOpen]);

  const activeFocusTask = useMemo(
    () => tasks.find((t) => t.id === timerTaskId) || tasks[0],
    [tasks, timerTaskId]
  );

  const allItems = useMemo<CommandPaletteItem[]>(() => {
    const actions: CommandPaletteItem[] = [
      {
        id: 'cmd-action-new-project',
        group: 'Actions',
        label: 'New project',
        subtitle: 'Create a new delivery stream in the portfolio',
        keywords: 'new project create add stream charter',
        icon: <Plus className="w-4 h-4" style={{ color: 'var(--accent)' }} />,
        onSelect: () => {
          setCommandPaletteOpen(false);
          setNewProjectModalOpen(true);
        },
      },
      {
        id: 'cmd-action-new-task',
        group: 'Actions',
        label: 'New task',
        subtitle: 'Dispatch a new engineering or design deliverable',
        keywords: 'new task create add deliverable card',
        icon: <Plus className="w-4 h-4" style={{ color: 'var(--accent)' }} />,
        onSelect: () => {
          setCommandPaletteOpen(false);
          setNewTaskModalOpen(true);
        },
      },
      {
        id: 'cmd-action-toggle-focus',
        group: 'Actions',
        label: timerRunning ? 'Stop focus (Start/stop focus)' : 'Start focus (Start/stop focus)',
        subtitle: timerRunning
          ? `Stop and log session on ${activeFocusTask?.code || 'active task'}`
          : `Begin focus timer on ${activeFocusTask?.code || 'active task'}`,
        keywords: 'start/stop focus start focus stop focus timer play pause log session',
        icon: timerRunning ? (
          <Square className="w-4 h-4 text-[#DC2626] fill-current" />
        ) : (
          <Play className="w-4 h-4" style={{ color: 'var(--accent)' }} />
        ),
        onSelect: () => {
          setCommandPaletteOpen(false);
          if (timerRunning) {
            resetTimer();
          } else {
            toggleTimer();
            pushToast(
              `Focus timer started`,
              activeFocusTask ? `Focusing on ${activeFocusTask.title}` : undefined
            );
          }
        },
      },
      ...(['tide', 'moss', 'iris', 'signal'] as AccentName[]).map((key) => {
        const theme = ACCENT_THEMES[key];
        const isCurrent = accent === key;
        return {
          id: `cmd-action-accent-${key}`,
          group: 'Actions' as const,
          label: `Switch accent: ${theme.label}`,
          subtitle: isCurrent ? `${theme.description} · Active` : theme.description,
          keywords: `switch accent theme color palette ${theme.label.toLowerCase()} ${key}`,
          accentHex: theme.hex,
          icon: <Palette className="w-4 h-4" style={{ color: theme.hex }} />,
          onSelect: () => {
            setAccent(key, true);
            setCommandPaletteOpen(false);
          },
        };
      }),
    ];

    const pageConfigs: Array<{ id: RouteId; subtitle: string; icon: React.ReactNode }> = [
      {
        id: 'Dashboard',
        subtitle: 'Portfolio overview, weekly output, project rings, and focus timer',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        id: 'Projects',
        subtitle: 'Portfolio streams, status filters, and deliverable progress',
        icon: <FolderKanban className="w-4 h-4" />,
      },
      {
        id: 'Tasks',
        subtitle: 'Four-stage Kanban board with drag-and-drop and filters',
        icon: <CheckSquare className="w-4 h-4" />,
      },
      {
        id: 'Calendar',
        subtitle: 'Milestone schedule and client review synchronization',
        icon: <Calendar className="w-4 h-4" />,
      },
      {
        id: 'Analytics',
        subtitle: 'Throughput distribution and budget telemetry',
        icon: <BarChart3 className="w-4 h-4" />,
      },
      {
        id: 'Team',
        subtitle: 'Studio specialists, department filters, and workload drawers',
        icon: <Users className="w-4 h-4" />,
      },
      {
        id: 'Settings',
        subtitle: 'Accent palette theme and calendar week-start configuration',
        icon: <SettingsIcon className="w-4 h-4" />,
      },
      {
        id: 'Help',
        subtitle: 'Keyboard shortcuts, FAQ accordion, and 4-step guided tour',
        icon: <HelpCircle className="w-4 h-4" />,
      },
    ];

    const pages: CommandPaletteItem[] = pageConfigs.map((p) => ({
      id: `cmd-page-${p.id.toLowerCase()}`,
      group: 'Pages',
      label: p.id,
      subtitle: p.subtitle,
      keywords: `page route navigate ${p.id.toLowerCase()} ${p.subtitle.toLowerCase()}`,
      icon: p.icon,
      onSelect: () => {
        setCommandPaletteOpen(false);
        onNavigate(p.id);
      },
    }));

    const uniqueProjectsMap = new Map<string, (typeof projects)[number]>();
    for (const prj of projects) {
      if (!uniqueProjectsMap.has(prj.id)) uniqueProjectsMap.set(prj.id, prj);
    }

    const projectItems: CommandPaletteItem[] = Array.from(uniqueProjectsMap.values()).map(
      (prj) => ({
        id: `cmd-project-${prj.id}`,
        group: 'Projects',
        label: prj.name,
        subtitle: `${prj.code} · ${prj.client} · ${prj.progress}%`,
        keywords: `project ${prj.name.toLowerCase()} ${prj.code.toLowerCase()} ${prj.client.toLowerCase()}`,
        seed: prj.id,
        onSelect: () => {
          setCommandPaletteOpen(false);
          onNavigate('Dashboard');
          pushToast(`Selected ${prj.name}`, `${prj.code} · ${prj.progress}% complete`);
        },
      })
    );

    const taskItems: CommandPaletteItem[] = tasks.map((t) => ({
      id: `cmd-task-${t.id}`,
      group: 'Tasks',
      label: t.title,
      subtitle: `${t.code} · ${t.status} · Focus or view on board`,
      keywords: `task ${t.title.toLowerCase()} ${t.code.toLowerCase()} ${t.category.toLowerCase()} ${t.status.toLowerCase()}`,
      seed: t.id,
      onSelect: () => {
        setTimerTask(t.id);
        setCommandPaletteOpen(false);
        onNavigate('Tasks');
        pushToast(`Focusing on ${t.code}`, t.title);
      },
    }));

    const uniquePeopleMap = new Map<string, (typeof team)[number]>();
    for (const m of team) {
      if (!uniquePeopleMap.has(m.id)) uniquePeopleMap.set(m.id, m);
    }

    const peopleItems: CommandPaletteItem[] = Array.from(uniquePeopleMap.values()).map(
      (member) => ({
        id: `cmd-person-${member.id}`,
        group: 'People',
        label: member.name,
        subtitle: `${member.role} · ${member.department} · ${member.location}`,
        keywords: `person people team member ${member.name.toLowerCase()} ${member.role.toLowerCase()} ${member.department.toLowerCase()}`,
        icon: <User className="w-4 h-4" />,
        onSelect: () => {
          setSelectedProfileMemberId(member.id);
          setCommandPaletteOpen(false);
          onNavigate('Team');
        },
      })
    );

    return [...actions, ...pages, ...projectItems, ...taskItems, ...peopleItems];
  }, [
    projects,
    tasks,
    team,
    accent,
    timerRunning,
    activeFocusTask,
    onNavigate,
    setCommandPaletteOpen,
    setNewProjectModalOpen,
    setNewTaskModalOpen,
    setSelectedProfileMemberId,
    setAccent,
    toggleTimer,
    resetTimer,
    setTimerTask,
    pushToast,
  ]);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
        item.keywords.includes(q)
    );
  }, [allItems, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Keep active option scrolled into view
  useEffect(() => {
    if (!commandPaletteOpen || filteredItems.length === 0) return;
    const activeItem = filteredItems[activeIndex];
    if (!activeItem || !listRef.current) return;
    const el = listRef.current.querySelector(`[id="${activeItem.id}"]`);
    if (el && typeof (el as HTMLElement).scrollIntoView === 'function') {
      (el as HTMLElement).scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, commandPaletteOpen, filteredItems]);

  // Focus trap and keyboard navigation inside dialog
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      setCommandPaletteOpen(false);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        setActiveIndex((prev) => (prev + 1) % filteredItems.length);
      }
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (filteredItems.length > 0) {
        setActiveIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
      }
      return;
    }

    if (e.key === 'Enter') {
      const target = filteredItems[activeIndex];
      if (target) {
        e.preventDefault();
        target.onSelect();
      }
      return;
    }

    // Focus trap on Tab
    if (e.key === 'Tab' && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'input, button, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  if (!commandPaletteOpen || typeof document === 'undefined') return null;

  const activeItem = filteredItems[activeIndex];
  const groupsOrder: Array<CommandPaletteItem['group']> = [
    'Actions',
    'Pages',
    'Projects',
    'Tasks',
    'People',
  ];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      style={{ zIndex: 'var(--z-popover)' }}
      className="fixed inset-0 flex items-stretch sm:items-start justify-center p-0 sm:pt-[10vh] sm:p-4 bg-black/45"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCommandPaletteOpen(false);
      }}
    >
      <div className="w-full h-[100dvh] sm:h-auto sm:max-w-xl bg-[var(--surface-elevated)] sm:border border-[var(--border-strong)] rounded-none sm:rounded-[var(--radius-lg)] shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] sm:max-h-[76vh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
        {/* Search Input Header */}
        <div className="flex items-center px-4 h-14 sm:h-13 border-b border-[var(--border-hairline)] gap-3 shrink-0">
          <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="command-palette-listbox"
            aria-activedescendant={activeItem?.id}
            aria-autocomplete="list"
            aria-label="Search commands, pages, projects, tasks, and people"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search commands, projects, tasks, people..."
            className="flex-1 bg-transparent text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none min-w-0"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear command search"
              className="w-11 h-11 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-[var(--radius-xs)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            aria-label="Close command palette"
            className="min-h-[44px] min-w-[44px] px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-hairline)] text-xs font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] cursor-pointer flex items-center justify-center shrink-0"
          >
            <span className="sm:hidden">Close</span>
            <span className="hidden sm:inline">Esc</span>
          </button>
        </div>

        {/* Grouped Options List */}
        <div
          id="command-palette-listbox"
          role="listbox"
          aria-label="Command palette results"
          ref={listRef}
          className="flex-1 overflow-y-auto min-h-0 [-webkit-overflow-scrolling:touch] p-2 space-y-3"
        >
          {filteredItems.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center text-center gap-2">
              <ContourGlyph seed={`empty-cmd-${query || 'none'}`} size={48} />
              <p className="text-xs font-semibold text-[var(--ink-primary)]">
                No matching commands or records
              </p>
              <p className="text-xs text-[var(--ink-muted)]">
                Try searching for "New project", "New task", "Focus", or an accent name.
              </p>
            </div>
          ) : (
            groupsOrder.map((groupName) => {
              const groupEntries = filteredItems
                .map((item, idx) => ({ item, idx }))
                .filter((entry) => entry.item.group === groupName);

              if (groupEntries.length === 0) return null;

              return (
                <div key={groupName} className="space-y-1">
                  <div className="px-2.5 py-1 text-[11px] font-semibold text-[var(--ink-muted)]">
                    {groupName}
                  </div>
                  {groupEntries.map(({ item, idx }) => {
                    const isSelected = idx === activeIndex;
                    return (
                      <div
                        key={item.id}
                        id={item.id}
                        role="option"
                        aria-selected={isSelected}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => item.onSelect()}
                        className={`px-3 py-2.5 min-h-[44px] rounded-[var(--radius-md)] flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[var(--accent-soft)] text-[var(--ink-primary)]'
                            : 'text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {item.seed ? (
                            <span className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--border-hairline)] flex items-center justify-center shrink-0">
                              <ContourGlyph seed={item.seed} size={22} />
                            </span>
                          ) : item.accentHex ? (
                            <span className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--border-hairline)] flex items-center justify-center shrink-0">
                              <span
                                className="w-3.5 h-3.5 rounded-full"
                                style={{ backgroundColor: item.accentHex }}
                              />
                            </span>
                          ) : (
                            <span
                              className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--surface-elevated)] border border-[var(--border-hairline)] flex items-center justify-center shrink-0"
                              style={{
                                color: isSelected ? 'var(--accent)' : 'var(--ink-secondary)',
                              }}
                            >
                              {item.icon}
                            </span>
                          )}

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-[var(--ink-primary)] truncate">
                              {item.label}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-[var(--ink-secondary)] truncate">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <span
                          className="flex items-center gap-1 text-[11px] font-medium shrink-0"
                          style={{ color: isSelected ? 'var(--accent)' : 'var(--ink-muted)' }}
                        >
                          <CornerDownLeft className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Keyboard Hints */}
        <div className="px-4 py-2 bg-[var(--surface-sunken)] border-t border-[var(--border-hairline)] flex items-center justify-between text-[11px] text-[var(--ink-muted)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
          <span>{filteredItems.length} commands & items</span>
        </div>
      </div>
    </div>,
    document.body
  );
}
