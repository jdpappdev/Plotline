import React, { useState } from 'react';
import {
  Bell,
  Calendar,
  CheckCheck,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  UserCheck,
} from 'lucide-react';
import { NotificationCategory, NotificationRecord } from '../../domain/notifications';
import { AnchoredPopover } from '../../ui/Popover';
import { ContourGlyph } from '../../utils/contourGlyph';

export interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  notifications: NotificationRecord[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NOTIFICATION_CATEGORY_FILTERS: Array<{
  id: 'all' | NotificationCategory;
  label: string;
  shortLabel: string;
}> = [
  { id: 'all', label: 'All', shortLabel: 'All' },
  { id: 'TaskAssigned', label: 'Task assigned', shortLabel: 'Task assigned' },
  { id: 'TaskMoved', label: 'Task moved', shortLabel: 'Task moved' },
  {
    id: 'TaskDueSoon',
    label: 'Task due within 48 hours',
    shortLabel: 'Task due within 48 hours',
  },
  { id: 'TaskOverdue', label: 'Overdue task', shortLabel: 'Overdue task' },
  {
    id: 'UpcomingEvent',
    label: 'Calendar event starting within 60 minutes',
    shortLabel: 'Calendar event starting within 60 minutes',
  },
];

function getCategoryMeta(category: NotificationCategory) {
  switch (category) {
    case 'TaskAssigned':
      return {
        label: 'Task assigned',
        icon: UserCheck,
        bg: 'var(--accent-soft)',
        text: 'var(--accent)',
      };
    case 'TaskMoved':
      return {
        label: 'Task moved',
        icon: ArrowRightLeft,
        bg: '#FEF5E6',
        text: '#9B5B0B',
      };
    case 'TaskDueSoon':
      return {
        label: 'Task due within 48 hours',
        icon: Clock,
        bg: '#FEF5E6',
        text: '#9B5B0B',
      };
    case 'TaskOverdue':
      return {
        label: 'Overdue task',
        icon: AlertTriangle,
        bg: '#FBECEE',
        text: '#C9352B',
      };
    case 'UpcomingEvent':
      return {
        label: 'Calendar event starting within 60 minutes',
        icon: Calendar,
        bg: 'var(--accent-soft)',
        text: 'var(--accent)',
      };
  }
}

export function NotificationPopover({
  isOpen,
  onClose,
  triggerRef,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationPopoverProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | NotificationCategory>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    selectedCategory === 'all'
      ? notifications
      : notifications.filter((n) => n.category === selectedCategory);

  const handleToggleCategory = (categoryId: 'all' | NotificationCategory) => {
    if (categoryId === 'all') {
      setSelectedCategory('all');
      return;
    }
    setSelectedCategory((prev) => (prev === categoryId ? 'all' : categoryId));
  };

  return (
    <AnchoredPopover
      isOpen={isOpen}
      onClose={onClose}
      triggerRef={triggerRef}
      title="Activity notifications"
      eyebrow="Notifications"
      role="dialog"
      align="end"
      placement="bottom"
      widthClass="w-[380px] max-w-[calc(100vw-1.5rem)]"
      className="p-3.5 space-y-3 text-xs"
      dataTestId="notifications-popover"
    >
      {/* Header Row */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--border-hairline)] pb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          <Bell className="w-4 h-4 text-[var(--accent)] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[var(--ink-primary)] leading-tight">
              Notifications
            </h2>
            <p className="text-[11px] text-[var(--ink-secondary)]">
              {unreadCount === 0 ? '0 unread · All caught up' : `${unreadCount} unread`}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onMarkAllAsRead}
          disabled={unreadCount === 0}
          data-testid="mark-all-read-button"
          className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[32px] rounded-full text-[11px] font-semibold bg-[var(--surface-sunken)] text-[var(--ink-primary)] border border-[var(--border-hairline)] hover:border-[var(--border-strong)] transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shrink-0"
        >
          <CheckCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Category Filter Toggles */}
      <div
        role="group"
        aria-label="Filter notifications by category"
        className="flex flex-wrap items-center gap-1"
      >
        {NOTIFICATION_CATEGORY_FILTERS.map((cat) => {
          const active = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              aria-pressed={active}
              onClick={() => handleToggleCategory(cat.id)}
              data-testid={`notification-filter-${cat.id}`}
              style={active ? { backgroundColor: 'var(--accent)', color: '#ffffff' } : undefined}
              className={`px-2 py-1 rounded-full text-[10px] font-semibold transition-colors cursor-pointer border ${
                active
                  ? 'border-transparent'
                  : 'bg-[var(--surface-sunken)] border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
              }`}
            >
              {cat.shortLabel}
            </button>
          );
        })}
      </div>

      {/* Notification List */}
      {filteredNotifications.length === 0 ? (
        <div
          data-testid="notifications-empty-state"
          className="py-6 flex flex-col items-center justify-center text-center gap-2"
        >
          <ContourGlyph seed={`notif-empty-${selectedCategory}`} size={36} />
          <p className="text-xs font-medium text-[var(--ink-primary)]">No notifications in view</p>
          <p className="text-[11px] text-[var(--ink-secondary)]">
            {selectedCategory === 'all'
              ? 'Tasks, deadlines, and upcoming events will appear here.'
              : 'No notifications match the selected category filter.'}
          </p>
        </div>
      ) : (
        <div
          role="list"
          aria-label="Notification items"
          className="divide-y divide-[var(--border-hairline)] max-h-72 overflow-y-auto -mx-1 px-1"
        >
          {filteredNotifications.map((item) => {
            const meta = getCategoryMeta(item.category);
            const Icon = meta.icon;
            return (
              <div
                key={item.id}
                role="listitem"
                data-testid={`notification-item-${item.id}`}
                data-category={item.category}
                data-read={item.read ? 'true' : 'false'}
                onClick={() => {
                  if (!item.read) {
                    onMarkAsRead(item.id);
                  }
                }}
                className={`py-2.5 px-2 rounded-[var(--radius-sm)] transition-colors flex items-start justify-between gap-2.5 ${
                  item.read
                    ? 'opacity-70 hover:bg-[var(--surface-sunken)]/60'
                    : 'bg-[var(--surface-sunken)]/50 hover:bg-[var(--surface-sunken)] cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span
                    style={{ backgroundColor: meta.bg, color: meta.text }}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[var(--ink-muted)]">
                        {meta.label}
                      </span>
                      {!item.read && (
                        <span
                          aria-label="Unread"
                          className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0"
                        />
                      )}
                    </div>
                    <p
                      className={`text-xs leading-snug break-words ${
                        item.read
                          ? 'font-medium text-[var(--ink-secondary)]'
                          : 'font-semibold text-[var(--ink-primary)]'
                      }`}
                    >
                      {item.detail || item.title}
                    </p>
                  </div>
                </div>

                {!item.read && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(item.id);
                    }}
                    aria-label={`Mark "${item.detail || item.title}" as read`}
                    className="text-[10px] font-semibold text-[var(--accent)] hover:underline shrink-0 mt-0.5 cursor-pointer"
                  >
                    Mark read
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AnchoredPopover>
  );
}
