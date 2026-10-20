import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Compass, Search, X } from 'lucide-react';
import {
  ACCENT_THEMES,
  AccentName,
  Project,
  RouteId,
  TaskItem,
  TeamMember,
} from '../../domain/types';
import { deriveNotifications } from '../../domain/derivations/notifications';
import { usePlotlineStore } from '../../store';
import { AnchoredPopover } from '../../ui/Popover';
import { ContourGlyph } from '../../utils/contourGlyph';
import { NotificationPopover } from './NotificationPopover';

export interface TopBarHeaderProps {
  projects: Project[];
  tasks: TaskItem[];
  team: TeamMember[];
  accent: AccentName;
  searchQuery: string;
  currentUser: TeamMember;
  searchFocused: boolean;
  userMenuOpen: boolean;
  onSetSearchQuery: (query: string) => void;
  onSetSearchFocused: React.Dispatch<React.SetStateAction<boolean>>;
  onSetUserMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSetCommandPaletteOpen: (open: boolean) => void;
  onSetAccent: (accent: AccentName) => void;
  onNavigate: (routeId: RouteId) => void;
  onOpenLogoutConfirm: () => void;
}

export function TopBarHeader({
  projects,
  tasks,
  team,
  accent,
  searchQuery,
  currentUser,
  searchFocused,
  userMenuOpen,
  onSetSearchQuery,
  onSetSearchFocused,
  onSetUserMenuOpen,
  onSetCommandPaletteOpen,
  onSetAccent,
  onNavigate,
  onOpenLogoutConfirm,
}: TopBarHeaderProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const notificationTriggerRef = useRef<HTMLButtonElement>(null);
  const userMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const { events, eventLog, readNotificationIds, markAsRead, markAllAsRead, syncNotifications } =
    usePlotlineStore();

  useEffect(() => {
    syncNotifications();
  }, [tasks, events, eventLog, readNotificationIds, syncNotifications]);

  const notificationsList = useMemo(
    () => deriveNotifications(tasks, events, eventLog, [], readNotificationIds),
    [tasks, events, eventLog, readNotificationIds]
  );

  const unreadCount = useMemo(
    () => notificationsList.filter((n) => !n.read).length,
    [notificationsList]
  );

  const activeAccentDef = ACCENT_THEMES[accent];

  // Filter seeded entities when user types in top-bar search
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const matchingProjects = useMemo(
    () =>
      normalizedQuery
        ? projects.filter(
            (p) =>
              p.name.toLowerCase().includes(normalizedQuery) ||
              p.client.toLowerCase().includes(normalizedQuery)
          )
        : [],
    [normalizedQuery, projects]
  );
  const matchingTasks = useMemo(
    () =>
      normalizedQuery ? tasks.filter((t) => t.title.toLowerCase().includes(normalizedQuery)) : [],
    [normalizedQuery, tasks]
  );
  const matchingTeam = useMemo(
    () =>
      normalizedQuery
        ? team.filter(
            (m) =>
              m.name.toLowerCase().includes(normalizedQuery) ||
              m.role.toLowerCase().includes(normalizedQuery)
          )
        : [],
    [normalizedQuery, team]
  );

  return (
    <header
      style={{ zIndex: 'var(--z-sticky-header)' }}
      className="h-14 pt-[env(safe-area-inset-top)] px-3 sm:px-6 bg-[var(--surface-elevated)] border-b border-[var(--border-hairline)] flex items-center justify-between gap-2 sm:gap-4 shrink-0"
    >
      {/* Left Zone on <640px: Brand Logo */}
      <button
        type="button"
        onClick={() => onNavigate('Dashboard')}
        className="sm:hidden inline-flex items-center gap-2 min-h-[44px] min-w-[44px] px-1 rounded-[var(--radius-sm)] text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
        aria-label="Plotline — Return to Dashboard"
      >
        <span
          className="w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 text-white"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <Compass className="w-4 h-4" />
        </span>
        <span className="text-base font-semibold tracking-tight text-[var(--ink-primary)]">
          Plotline
        </span>
      </button>

      {/* Search + Notification Bell Zone (Notification Bell positioned to the right of search) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 sm:flex-1 min-w-0 ml-auto sm:ml-0">
        <div
          ref={searchContainerRef}
          className="hidden sm:block relative flex-1 max-w-md min-w-[140px]"
          data-tour="search"
        >
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
              onChange={(e) => onSetSearchQuery(e.target.value)}
              onFocus={() => onSetSearchFocused(true)}
              onBlur={() => setTimeout(() => onSetSearchFocused(false), 150)}
              placeholder="Search task, project, or specialist..."
              aria-label="Search workspace"
              className="w-full bg-transparent text-xs sm:text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-none min-w-0"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSetSearchQuery('')}
                aria-label="Clear search query"
                className="ml-1 p-1 text-[var(--ink-muted)] hover:text-[var(--ink-primary)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onSetCommandPaletteOpen(true)}
                aria-label="Open command palette (Command+K)"
                title="Open command palette (⌘K / Ctrl+K)"
                className="ml-1.5 px-1.5 py-0.5 rounded-[var(--radius-xs)] bg-[var(--surface-elevated)] border border-[var(--border-hairline)] text-[10px] font-semibold text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] shrink-0 cursor-pointer"
              >
                ⌘K
              </button>
            )}
          </div>

          {/* Live Search Preview Popover (portaled to document.body) */}
          <AnchoredPopover
            isOpen={searchFocused && normalizedQuery.length > 0}
            onClose={() => onSetSearchFocused(false)}
            triggerRef={searchContainerRef}
            role="listbox"
            title={`Search matches for "${searchQuery}"`}
            align="start"
            placement="bottom"
            matchTriggerWidth={true}
            autoFocusFirst={false}
            enableMobileBottomSheet={false}
            className="p-3 space-y-2 text-xs"
          >
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
                    role="option"
                    onMouseDown={() => {
                      onNavigate('Dashboard');
                      onSetSearchFocused(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-sunken)] flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="font-medium text-[var(--ink-primary)] truncate">{p.name}</span>
                    <span className="text-[var(--ink-muted)] shrink-0">{p.client}</span>
                  </button>
                ))}
                {matchingTasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    role="option"
                    onMouseDown={() => {
                      onNavigate('Tasks');
                      onSetSearchFocused(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-sunken)] flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="text-[var(--ink-primary)] truncate">{t.title}</span>
                    <span className="text-[var(--ink-muted)] shrink-0">{t.status}</span>
                  </button>
                ))}
                {matchingTeam.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    role="option"
                    onMouseDown={() => {
                      onNavigate('Team');
                      onSetSearchFocused(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--surface-sunken)] flex items-center justify-between gap-2 cursor-pointer"
                  >
                    <span className="text-[var(--ink-primary)] truncate">{m.name}</span>
                    <span className="text-[var(--ink-muted)] shrink-0">{m.role}</span>
                  </button>
                ))}
              </div>
            )}
          </AnchoredPopover>
        </div>

        {/* Mobile Search Icon Button (<640px) — opens ⌘K Command Palette full-screen */}
        <button
          type="button"
          onClick={() => onSetCommandPaletteOpen(true)}
          aria-label="Open search and command palette"
          data-testid="mobile-search-trigger"
          className="sm:hidden w-11 h-11 min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] transition-colors cursor-pointer"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Notification Bell Button — positioned to the right of search */}
        <div className="relative shrink-0">
          <button
            ref={notificationTriggerRef}
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            aria-expanded={notificationsOpen}
            aria-haspopup="dialog"
            aria-label={`Notifications (${unreadCount} unread)`}
            data-testid="notification-bell-button"
            className="relative w-11 h-11 sm:w-9 sm:h-9 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] rounded-full flex items-center justify-center bg-transparent sm:bg-[var(--surface-sunken)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] sm:hover:bg-[var(--border-hairline)] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span
                data-testid="notification-unread-badge"
                style={{ backgroundColor: 'var(--accent)' }}
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold font-ui-tabular text-white flex items-center justify-center leading-none shadow-2xs"
              >
                {unreadCount}
              </span>
            )}
          </button>

          <NotificationPopover
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            triggerRef={notificationTriggerRef}
            notifications={notificationsList}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
          />
        </div>
      </div>

      {/* Right Zone: Avatar / User Chip */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0" data-tour="accent">
        <div className="relative">
          <button
            ref={userMenuTriggerRef}
            type="button"
            onClick={() => onSetUserMenuOpen((prev) => !prev)}
            aria-expanded={userMenuOpen}
            aria-haspopup="menu"
            aria-label={`Account menu for ${currentUser.name}`}
            data-testid="user-menu-trigger"
            className="flex items-center justify-center sm:justify-start gap-2.5 min-w-[44px] min-h-[44px] sm:min-h-[36px] p-1.5 sm:pl-1.5 sm:pr-3 sm:py-1 rounded-full bg-transparent sm:bg-[var(--surface-sunken)] hover:bg-[var(--surface-sunken)] sm:hover:bg-[var(--border-hairline)] transition-colors duration-160 ease-plotline shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          >
            <span
              className="w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 transition-colors duration-160 ease-plotline"
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

          <AnchoredPopover
            isOpen={userMenuOpen}
            onClose={() => onSetUserMenuOpen(false)}
            triggerRef={userMenuTriggerRef}
            title={currentUser.name}
            eyebrow={currentUser.role}
            role="menu"
            align="end"
            placement="bottom"
            widthClass="w-64"
            className="p-3 space-y-2.5 text-xs"
            dataTestId="user-account-menu"
          >
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
              <div
                className="grid grid-cols-4 gap-1.5"
                role="group"
                aria-label="Quick accent switch"
              >
                {(Object.keys(ACCENT_THEMES) as AccentName[]).map((key) => {
                  const theme = ACCENT_THEMES[key];
                  const isSelected = accent === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        onSetAccent(key as AccentName);
                        onSetUserMenuOpen(false);
                      }}
                      aria-pressed={isSelected}
                      className={`min-h-[44px] sm:min-h-0 px-1.5 py-1.5 rounded-[var(--radius-xs)] border text-[10px] font-semibold flex flex-col items-center justify-center gap-1 cursor-pointer ${
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
                role="menuitem"
                onClick={() => {
                  onNavigate('Settings');
                  onSetUserMenuOpen(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 text-left px-2.5 py-2 sm:py-1.5 rounded-[var(--radius-xs)] font-medium hover:bg-[var(--surface-sunken)] cursor-pointer flex items-center"
                style={{ color: 'var(--accent)' }}
              >
                Appearance & Settings
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onNavigate('Help');
                  onSetUserMenuOpen(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 text-left px-2.5 py-2 sm:py-1.5 rounded-[var(--radius-xs)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer flex items-center"
              >
                Help & Keyboard Shortcuts
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  onSetUserMenuOpen(false);
                  onOpenLogoutConfirm();
                }}
                className="w-full min-h-[40px] sm:min-h-0 text-left px-2.5 py-2 sm:py-1.5 rounded-[var(--radius-xs)] text-[#C9352B] hover:bg-[#FBECEE]/60 font-medium cursor-pointer flex items-center"
              >
                Log out
              </button>
            </div>
          </AnchoredPopover>
        </div>
      </div>
    </header>
  );
}
