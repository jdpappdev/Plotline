import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, FolderKanban, Layers, Plus, RotateCcw, Search, Sparkles } from 'lucide-react';
import type { RouteId } from '../../domain/types';
import { useWorkspaceStore } from '../../store/useWorkspaceStore';
import { Dialog } from '../../ui/Dialog';

interface CommandItem {
  id: string;
  label: string;
  category: string;
  icon: React.ReactNode;
  action: () => void;
}

const ROUTES: RouteId[] = [
  'Dashboard',
  'Projects',
  'Tasks',
  'Calendar',
  'Analytics',
  'Team',
  'Settings',
  'Help',
];

export const CommandPalette: React.FC = () => {
  const open = useWorkspaceStore((s) => s.commandPaletteOpen);
  const setOpen = useWorkspaceStore((s) => s.setCommandPaletteOpen);
  const setActiveRoute = useWorkspaceStore((s) => s.setActiveRoute);
  const setNewProjectModalOpen = useWorkspaceStore((s) => s.setNewProjectModalOpen);
  const setNewTaskModalOpen = useWorkspaceStore((s) => s.setNewTaskModalOpen);
  const openProjectDialog = useWorkspaceStore((s) => s.openProjectDialog);
  const projects = useWorkspaceStore((s) => s.projects);
  const setAccent = useWorkspaceStore((s) => s.setAccent);
  const resetDemoData = useWorkspaceStore((s) => s.resetDemoData);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const commands = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = ROUTES.map((route) => ({
      id: `nav-${route}`,
      label: `Go to ${route}`,
      category: 'Navigation',
      icon: <Layers className="w-3.5 h-3.5" />,
      action: () => {
        setActiveRoute(route);
        setOpen(false);
      },
    }));

    const actionItems: CommandItem[] = [
      {
        id: 'act-new-project',
        label: 'Create New Project',
        category: 'Actions',
        icon: <Plus className="w-3.5 h-3.5" />,
        action: () => {
          setOpen(false);
          setNewProjectModalOpen(true);
        },
      },
      {
        id: 'act-new-task',
        label: 'Create New Task',
        category: 'Actions',
        icon: <Plus className="w-3.5 h-3.5" />,
        action: () => {
          setOpen(false);
          setNewTaskModalOpen(true);
        },
      },
      {
        id: 'act-reset-demo',
        label: 'Reset Demo Workspace Data',
        category: 'Actions',
        icon: <RotateCcw className="w-3.5 h-3.5" />,
        action: () => {
          resetDemoData();
          setOpen(false);
        },
      },
      {
        id: 'theme-tide',
        label: 'Theme: Set Accent to Tide (Blue)',
        category: 'Appearance',
        icon: <Sparkles className="w-3.5 h-3.5" />,
        action: () => {
          setAccent('tide', true);
          setOpen(false);
        },
      },
      {
        id: 'theme-moss',
        label: 'Theme: Set Accent to Moss (Green)',
        category: 'Appearance',
        icon: <Sparkles className="w-3.5 h-3.5" />,
        action: () => {
          setAccent('moss', true);
          setOpen(false);
        },
      },
    ];

    const projectItems: CommandItem[] = projects.map((p) => ({
      id: `prj-${p.id}`,
      label: `Open Project: ${p.name} (${p.code})`,
      category: 'Projects',
      icon: <FolderKanban className="w-3.5 h-3.5" />,
      action: () => {
        setOpen(false);
        openProjectDialog(p.id);
      },
    }));

    return [...navItems, ...actionItems, ...projectItems];
  }, [
    projects,
    setActiveRoute,
    setOpen,
    setNewProjectModalOpen,
    setNewTaskModalOpen,
    openProjectDialog,
    setAccent,
    resetDemoData,
  ]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length)
      );
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      filtered[selectedIndex].action();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      title="Command Palette"
      description="Jump to any screen, project, or studio action."
      maxWidthClass="max-w-[520px]"
    >
      <div className="space-y-3" onKeyDown={handleKeyDown}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search projects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 border border-slate-200/80 rounded-2xl">
          {filtered.map((item, idx) => {
            const active = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={item.action}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  active ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-slate-400 shrink-0">{item.icon}</span>
                  <span className="text-[12px] font-semibold truncate">{item.label}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {item.category}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-6 text-center text-[12px] text-slate-400">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
