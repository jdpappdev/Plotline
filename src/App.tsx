import React, { useEffect, useRef, useState } from 'react';
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Compass,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings as SettingsIcon,
  Users,
  X,
} from 'lucide-react';
import AnalyticsScreen from './components/AnalyticsScreen';
import CalendarScreen from './components/CalendarScreen';
import CommandPalette from './components/CommandPalette';
import DashboardScreen from './components/DashboardScreen';
import HelpScreen, { TourOverlay } from './components/HelpScreen';
import SettingsScreen from './components/SettingsScreen';
import TasksScreen from './components/TasksScreen';
import TeamScreen from './components/TeamScreen';
import {
  ACCENT_THEMES,
  applyAccentCssVariables,
  getIsoDateOffset,
  RouteId,
  TaskItem,
  usePlotlineStore,
} from './store';
import { ContourGlyph } from './utils/contourGlyph';

interface RouteConfig {
  id: RouteId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROUTES: RouteConfig[] = [
  { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'Tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'Calendar', label: 'Calendar', icon: Calendar },
  { id: 'Analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'Team', label: 'Team', icon: Users },
  { id: 'Settings', label: 'Settings', icon: SettingsIcon },
  { id: 'Help', label: 'Help', icon: HelpCircle },
];

const TASK_CATEGORIES = [
  'Cartography',
  'Telemetry',
  'Interface',
  'Architecture',
  'Visualization',
  'Field Ops',
  'Outreach',
];

function resolveRouteFromLocation(): RouteId {
  if (typeof window === 'undefined') return 'Dashboard';
  const rawHash = window.location.hash;
  const cleanedHash = rawHash.replace(/^#\/?/, '').split('?')[0].trim().toLowerCase();
  if (cleanedHash) {
    const match = ROUTES.find((r) => r.id.toLowerCase() === cleanedHash);
    return match ? match.id : 'NotFound';
  }
  const cleanedPath = window.location.pathname
    .replace(/^\/+|\/+$/g, '')
    .toLowerCase();
  if (!cleanedPath || cleanedPath === 'index.html') {
    return 'Dashboard';
  }
  const pathMatch = ROUTES.find((r) => r.id.toLowerCase() === cleanedPath);
  return pathMatch ? pathMatch.id : 'NotFound';
}

export default function App() {
  const {
    projects,
    tasks,
    team,
    accent,
    activeRoute,
    railCollapsed,
    searchQuery,
    currentUser,
    timerRunning,
    toasts,
    newProjectModalOpen,
    newTaskModalOpen,
    isSignedOut,
    setActiveRoute,
    toggleRail,
    setSearchQuery,
    setNewProjectModalOpen,
    setNewTaskModalOpen,
    setCommandPaletteOpen,
    setSignedOut,
    setAccent,
    addProject,
    addTask,
    tickTimer,
    pushToast,
    dismissToast,
  } = usePlotlineStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

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

  // Sync CSS variable on mount and whenever accent changes
  useEffect(() => {
    applyAccentCssVariables(accent);
  }, [accent]);

  // Global Focus Timer ticker in the App Shell so elapsed time persists across route changes
  useEffect(() => {
    if (!timerRunning) return;
    const intervalId = window.setInterval(() => {
      tickTimer();
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [timerRunning, tickTimer]);

  // Sync route with URL hash/pathname for deep-linking, 404 handling & reload persistence
  useEffect(() => {
    const syncLocation = () => {
      const next = resolveRouteFromLocation();
      setActiveRoute(next);
    };
    syncLocation();
    window.addEventListener('hashchange', syncLocation);
    window.addEventListener('popstate', syncLocation);
    return () => {
      window.removeEventListener('hashchange', syncLocation);
      window.removeEventListener('popstate', syncLocation);
    };
  }, [setActiveRoute]);

  // Keyboard shortcut Cmd/Ctrl + K to toggle Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!usePlotlineStore.getState().commandPaletteOpen);
        return;
      }
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
        setSearchFocused(false);
        setLogoutConfirmOpen(false);
        if (newProjectModalOpen) setNewProjectModalOpen(false);
        if (newTaskModalOpen) setNewTaskModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    newProjectModalOpen,
    newTaskModalOpen,
    setCommandPaletteOpen,
    setNewProjectModalOpen,
    setNewTaskModalOpen,
  ]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavigate = (routeId: RouteId) => {
    setActiveRoute(routeId);
    window.history.replaceState(null, '', `#/${routeId.toLowerCase()}`);
    setMobileMenuOpen(false);
  };

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
    const newId = `prj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    addProject({
      id: newId,
      name: projectName.trim(),
      client: projectClient.trim() || 'Independent Field Commission',
      targetDate: projectDueDate,
    });

    setProjectName('');
    setProjectClient('');
    setProjectDueDate('2026-12-30');
    setNewProjectModalOpen(false);
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
    const newId = `tsk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    addTask({
      id: newId,
      title: taskTitle.trim(),
      category: taskCategory,
      priority: taskPriority,
      assigneeId: taskAssigneeId,
      dueDate: taskDueDate,
    });

    setTaskTitle('');
    setNewTaskModalOpen(false);
    setIsSavingTask(false);
    savingTaskRef.current = false;
  };

  const activeAccentDef = ACCENT_THEMES[accent];

  // Filter seeded entities when user types in top-bar search
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingProjects = normalizedQuery
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(normalizedQuery) ||
          p.client.toLowerCase().includes(normalizedQuery)
      )
    : [];
  const matchingTasks = normalizedQuery
    ? tasks.filter((t) => t.title.toLowerCase().includes(normalizedQuery))
    : [];
  const matchingTeam = normalizedQuery
    ? team.filter(
        (m) =>
          m.name.toLowerCase().includes(normalizedQuery) ||
          m.role.toLowerCase().includes(normalizedQuery)
      )
    : [];

  // Signed-Out Screen ("Sign back in" restores the session without deleting anything)
  if (isSignedOut) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--surface-canvas)] text-[var(--ink-primary)] p-4">
        <div className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-8 text-center space-y-5 shadow-sm plotline-enter">
          <div className="mx-auto w-16 h-16 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
            <ContourGlyph seed={currentUser.id} size={48} />
          </div>

          <div className="space-y-1.5">
            <span
              className="text-xs font-semibold"
              style={{ color: 'var(--accent)' }}
            >
              Session Locked
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--ink-primary)]">
              Signed out of Plotline
            </h1>
            <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
              Your workspace for <span className="font-semibold text-[var(--ink-primary)]">{currentUser.name}</span> ({projects.length} projects, {tasks.length} tasks) is safely preserved in local storage.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSignedOut(false);
              pushToast(`Welcome back, ${currentUser.name}`, 'Session restored with all data intact.');
            }}
            style={{ backgroundColor: 'var(--accent)' }}
            className="w-full py-2.5 px-5 rounded-full text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer shadow-2xs"
          >
            Sign back in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-[var(--surface-canvas)] text-[var(--ink-primary)] selection:bg-[var(--accent-soft)] selection:text-[var(--ink-primary)]">
      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden transition-opacity duration-200 ease-plotline"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Collapsing Icon Rail (Desktop & Tablet persistent, Mobile drawer) */}
      <aside
        aria-label="Primary Navigation"
        data-tour="sidebar"
        style={{
          width: railCollapsed ? '64px' : '216px',
          transitionProperty: 'width, transform',
          transitionDuration: 'var(--duration-normal)',
          transitionTimingFunction: 'var(--ease-plotline)',
        }}
        className={`fixed inset-y-0 left-0 z-40 md:static flex flex-col shrink-0 bg-[var(--surface-elevated)] border-r border-[var(--border-hairline)] select-none ${
          mobileMenuOpen ? 'translate-x-0 !w-[216px]' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header inside Rail */}
        <div className="h-14 px-4 flex items-center justify-between border-b border-[var(--border-hairline)] shrink-0">
          <button
            type="button"
            onClick={() => handleNavigate('Dashboard')}
            className="flex items-center gap-2.5 min-w-0 text-left group focus-visible:outline-2 focus-visible:outline-[var(--accent)] rounded-[var(--radius-sm)] cursor-pointer"
            title="Plotline — Return to Dashboard"
          >
            <span
              className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 text-white transition-colors duration-160 ease-plotline"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              <Compass className="w-4 h-4" />
            </span>
            {(!railCollapsed || mobileMenuOpen) && (
              <span className="block text-base font-semibold tracking-tight text-[var(--ink-primary)] truncate">
                Plotline
              </span>
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-[var(--radius-sm)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]"
            aria-label="Close navigation drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Route Navigation List */}
        <nav className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto" aria-label="Workspace Views">
          {ROUTES.map((route) => {
            const Icon = route.icon;
            const isActive = activeRoute === route.id;
            const showLabels = !railCollapsed || mobileMenuOpen;

            return (
              <button
                key={route.id}
                type="button"
                onClick={() => handleNavigate(route.id)}
                title={railCollapsed && !mobileMenuOpen ? route.label : undefined}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center ${
                  showLabels ? 'justify-start px-3' : 'justify-center px-0'
                } h-10 rounded-[var(--radius-sm)] text-sm font-medium transition-colors duration-160 ease-plotline whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)] ${
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--ink-primary)] font-semibold'
                    : 'text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]'
                }`}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span
                    className="flex items-center justify-center shrink-0"
                    style={{ color: isActive ? 'var(--accent)' : 'currentColor' }}
                  >
                    <Icon className="w-[18px] h-[18px]" />
                  </span>
                  {showLabels && <span className="truncate">{route.label}</span>}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Rail Controls: Logout & Collapse Toggle */}
        <div className="p-2 border-t border-[var(--border-hairline)] space-y-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setLogoutConfirmOpen(true);
            }}
            title={railCollapsed && !mobileMenuOpen ? 'Log out' : undefined}
            className={`w-full flex items-center ${
              !railCollapsed || mobileMenuOpen ? 'justify-start px-3 gap-3' : 'justify-center px-0'
            } h-9 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--ink-secondary)] hover:text-[#C9352B] hover:bg-[#FBECEE]/60 transition-colors cursor-pointer`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {(!railCollapsed || mobileMenuOpen) && <span>Log out</span>}
          </button>

          <button
            type="button"
            onClick={toggleRail}
            aria-label={railCollapsed ? 'Expand navigation rail' : 'Collapse navigation rail'}
            title={railCollapsed ? 'Expand rail' : 'Collapse rail'}
            className={`hidden md:flex w-full items-center ${
              railCollapsed ? 'justify-center px-0' : 'justify-between px-3'
            } h-9 rounded-[var(--radius-sm)] text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors duration-160 ease-plotline whitespace-nowrap cursor-pointer`}
          >
            {!railCollapsed && <span>Collapse rail</span>}
            {railCollapsed ? (
              <ChevronRight className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronLeft className="w-4 h-4 shrink-0" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Column */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-full lg:overflow-hidden">
        {/* Top Bar with Search + Command Palette Trigger and User Chip */}
        <header className="h-14 px-4 sm:px-6 bg-[var(--surface-elevated)] border-b border-[var(--border-hairline)] flex items-center justify-between gap-4 shrink-0 z-30">
          {/* Left Zone: Mobile Drawer Trigger + Search Input + Cmd+K Badge */}
          <div className="flex items-center gap-3 flex-1 max-w-md min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-1 rounded-[var(--radius-sm)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative flex-1 min-w-[140px]" data-tour="search">
              <div
                className={`flex items-center h-9 px-3 rounded-full bg-[var(--surface-sunken)] border transition-colors duration-160 ease-plotline ${
                  searchFocused
                    ? 'border-[var(--accent)] bg-[var(--surface-elevated)]'
                    : 'border-transparent hover:border-[var(--border-strong)]'
                }`}
              >
                <Search
                  className="w-4 h-4 shrink-0 mr-2"
                  style={{ color: searchFocused ? 'var(--accent)' : 'var(--ink-muted)' }}
                />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
                  placeholder="Search task, project, or specialist..."
                  aria-label="Search workspace"
                  className="w-full bg-transparent text-xs sm:text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none min-w-0"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Clear search query"
                    className="ml-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCommandPaletteOpen(true)}
                    aria-label="Open command palette (Command+K)"
                    title="Open command palette (⌘K / Ctrl+K)"
                    className="ml-1.5 px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-elevated)] border border-[var(--border-hairline)] text-[10px] font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] shrink-0 cursor-pointer"
                  >
                    ⌘K
                  </button>
                )}
              </div>

              {/* Live Search Preview Popover */}
              {searchFocused && normalizedQuery.length > 0 && (
                <div className="absolute left-0 right-0 top-11 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-md)] shadow-sm p-3 z-50 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[var(--ink-muted)] border-b border-[var(--border-hairline)] pb-1.5">
                    <span>Matches for "{searchQuery}"</span>
                    <span>
                      {matchingProjects.length + matchingTasks.length + matchingTeam.length} found
                    </span>
                  </div>

                  {matchingProjects.length === 0 &&
                  matchingTasks.length === 0 &&
                  matchingTeam.length === 0 ? (
                    <div className="py-3 flex flex-col items-center gap-1.5 text-center">
                      <ContourGlyph seed={`search-empty-${normalizedQuery}`} size={36} />
                      <p className="text-[var(--ink-secondary)]">
                        No matching projects, tasks, or specialists in store.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1 max-h-56 overflow-y-auto">
                      {matchingProjects.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onMouseDown={() => handleNavigate('Dashboard')}
                          className="w-full text-left px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-sunken)] flex items-center justify-between gap-2"
                        >
                          <span className="font-medium text-[var(--ink-primary)] truncate">
                            {p.name}
                          </span>
                          <span className="text-[var(--ink-muted)] shrink-0">{p.client}</span>
                        </button>
                      ))}
                      {matchingTasks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onMouseDown={() => handleNavigate('Tasks')}
                          className="w-full text-left px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-sunken)] flex items-center justify-between gap-2"
                        >
                          <span className="text-[var(--ink-primary)] truncate">{t.title}</span>
                          <span className="text-[var(--ink-muted)] shrink-0">{t.status}</span>
                        </button>
                      ))}
                      {matchingTeam.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onMouseDown={() => handleNavigate('Team')}
                          className="w-full text-left px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-sunken)] flex items-center justify-between gap-2"
                        >
                          <span className="text-[var(--ink-primary)] truncate">{m.name}</span>
                          <span className="text-[var(--ink-muted)] shrink-0">{m.role}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Zone: User Chip */}
          <div className="flex items-center gap-3 shrink-0" data-tour="accent">
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-[var(--surface-sunken)] hover:bg-[var(--border-hairline)] transition-colors duration-160 ease-plotline shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 transition-colors duration-160 ease-plotline"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {currentUser.initials}
                </span>
                <div className="hidden sm:block text-left leading-tight">
                  <span className="block text-xs font-semibold text-[var(--ink-primary)] whitespace-nowrap">
                    {currentUser.name}
                  </span>
                  <span className="block text-[11px] text-[var(--ink-muted)] whitespace-nowrap">
                    {currentUser.email}
                  </span>
                </div>
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-md)] shadow-sm p-3 z-50 space-y-2.5 text-xs">
                  <div className="border-b border-[var(--border-hairline)] pb-2">
                    <p className="font-semibold text-[var(--ink-primary)]">{currentUser.name}</p>
                    <p className="text-[var(--ink-secondary)] mt-0.5">{currentUser.role}</p>
                    <p className="text-[11px] text-[var(--ink-muted)] mt-0.5">
                      {currentUser.location} · Theme: {activeAccentDef.label}
                    </p>
                  </div>

                  <div className="border-b border-[var(--border-hairline)] pb-2.5">
                    <p className="text-[11px] font-semibold text-[var(--ink-secondary)] mb-1.5">
                      Accent Palette
                    </p>
                    <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Quick accent switch">
                      {(Object.keys(ACCENT_THEMES) as Array<keyof typeof ACCENT_THEMES>).map((key) => {
                        const theme = ACCENT_THEMES[key];
                        const isSelected = accent === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setAccent(key, true)}
                            aria-pressed={isSelected}
                            className={`px-1.5 py-1 rounded-[var(--radius-xs)] border text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer ${
                              isSelected
                                ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--ink-primary)]'
                                : 'bg-[var(--surface-sunken)] border-transparent text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                            }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: theme.hex }}
                            />
                            <span>{theme.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        handleNavigate('Settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-[var(--radius-xs)] font-medium hover:bg-[var(--surface-sunken)] cursor-pointer"
                      style={{ color: 'var(--accent)' }}
                    >
                      Appearance & Settings
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleNavigate('Help');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-[var(--radius-xs)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
                    >
                      Help & Keyboard Shortcuts
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        setLogoutConfirmOpen(true);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-[var(--radius-xs)] text-[#C9352B] hover:bg-[#FBECEE]/60 font-medium cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Route Change 2px Top Accent Sweep Line (400ms) */}
        <div
          key={`sweep-${activeRoute}`}
          className="plotline-route-sweep shrink-0"
          aria-hidden="true"
        />

        {/* Main Viewport Canvas (Clean #f6f6f5 background, no page-wide texture) */}
        <main
          key={`route-${activeRoute}`}
          className="flex-1 contour-surface px-4 sm:px-6 py-3 overflow-x-hidden overflow-y-auto"
        >
          {activeRoute === 'Dashboard' ? (
            <DashboardScreen />
          ) : activeRoute === 'Tasks' ? (
            <TasksScreen />
          ) : activeRoute === 'Calendar' ? (
            <CalendarScreen />
          ) : activeRoute === 'Analytics' ? (
            <AnalyticsScreen />
          ) : activeRoute === 'Team' ? (
            <TeamScreen />
          ) : activeRoute === 'Settings' ? (
            <SettingsScreen />
          ) : activeRoute === 'Help' ? (
            <HelpScreen />
          ) : (
            <div
              data-testid="not-found-screen"
              className="max-w-lg mx-auto my-12 bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-8 text-center space-y-5 plotline-enter"
            >
              <div className="mx-auto w-20 h-20 rounded-full bg-[var(--accent-soft)] flex items-center justify-center">
                <ContourGlyph seed="plotline-404-uncharted-sector" size={56} />
              </div>

              <div className="space-y-1.5">
                <span
                  className="block text-4xl font-display-num font-semibold leading-none"
                  style={{ color: 'var(--accent)' }}
                >
                  404
                </span>
                <h1 className="text-xl font-bold tracking-tight text-[var(--ink-primary)]">
                  Uncharted sector — page not found
                </h1>
                <p className="text-xs sm:text-sm text-[var(--ink-secondary)] leading-relaxed">
                  The requested coordinates ({typeof window !== 'undefined' ? window.location.hash || window.location.pathname : '#/404'}) do not match any active workspace view in Plotline.
                </p>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNavigate('Dashboard')}
                  style={{ backgroundColor: 'var(--accent)' }}
                  className="px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Return to Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => handleNavigate('Tasks')}
                  className="px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold bg-[var(--surface-sunken)] text-[var(--ink-primary)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                >
                  Open Tasks
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Global Command Palette (⌘K / Ctrl+K) */}
      <CommandPalette onNavigate={handleNavigate} />

      {/* 4-Step Replay Guided Tour Overlay */}
      <TourOverlay onNavigate={handleNavigate} />

      {/* Confirm Logout Dialog */}
      {logoutConfirmOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setLogoutConfirmOpen(false);
          }}
        >
          <div className="w-full max-w-sm bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 shadow-xl space-y-4">
            <div className="space-y-1.5">
              <h2
                id="logout-confirm-title"
                className="text-base font-bold text-[var(--ink-primary)]"
              >
                Log out of Plotline?
              </h2>
              <p className="text-xs text-[var(--ink-secondary)] leading-relaxed">
                Your projects, tasks, events, and focus sessions remain saved in local storage and will be restored when you sign back in.
              </p>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-4 py-2 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setLogoutConfirmOpen(false);
                  setSignedOut(true);
                }}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#DC2626] text-white hover:opacity-95 cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global "New project" Modal */}
      {newProjectModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNewProjectModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 shadow-lg space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
              <div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  Charter Stream
                </span>
                <h2
                  id="new-project-modal-title"
                  className="text-lg font-semibold text-[var(--ink-primary)] mt-0.5"
                >
                  New project
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setNewProjectModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4" noValidate>
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
                  className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
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
                  className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-hairline)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
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
                  className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
                />
              </div>

              {projectFormError && (
                <p role="alert" className="text-xs font-medium text-[var(--status-critical)]">
                  {projectFormError}
                </p>
              )}

              <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewProjectModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProject}
                  style={{ backgroundColor: 'var(--accent)' }}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer"
                >
                  {isSavingProject ? 'Creating…' : 'Create project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global "New task" Modal */}
      {newTaskModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-task-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={(e) => {
            if (e.target === e.currentTarget) setNewTaskModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-[var(--surface-elevated)] border border-[var(--border-hairline)] rounded-[var(--radius-lg)] p-6 shadow-lg space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-hairline)] pb-3">
              <div>
                <span
                  className="text-xs font-semibold"
                  style={{ color: 'var(--accent)' }}
                >
                  Task Dispatch
                </span>
                <h2
                  id="new-task-modal-title"
                  className="text-lg font-semibold text-[var(--ink-primary)] mt-0.5"
                >
                  New task
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setNewTaskModalOpen(false)}
                aria-label="Close modal"
                className="p-1.5 rounded-[var(--radius-sm)] text-[var(--ink-muted)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5" noValidate>
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
                  className="w-full h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
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
                    onChange={(e) =>
                      setTaskPriority(e.target.value as TaskItem['priority'])
                    }
                    className="w-full h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
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
                    className="w-full h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
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
                    className="w-full h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
                  />
                </div>
              </div>

              {taskFormError && (
                <p role="alert" className="text-xs font-medium text-[var(--status-critical)]">
                  {taskFormError}
                </p>
              )}

              <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewTaskModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingTask}
                  style={{ backgroundColor: 'var(--accent)' }}
                  className="px-4 py-2 rounded-full text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSavingTask ? 'Creating…' : 'Create task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Toast Notification Stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        >
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="pointer-events-auto surface-accent-fill text-white border border-white/10 rounded-[var(--radius-md)] p-3.5 shadow-md flex items-start justify-between gap-3 plotline-enter"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <CheckCircle2
                  className="w-4 h-4 shrink-0 mt-0.5 text-white"
                />
                <div className="min-w-0 text-xs">
                  <p className="font-semibold text-white truncate">{toast.title}</p>
                  {toast.detail && (
                    <p className="text-white/80 text-[11px] mt-0.5 truncate">{toast.detail}</p>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-white/75 hover:text-white shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
