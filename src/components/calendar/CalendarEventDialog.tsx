import React from 'react';
import { EventCategory, TeamMember } from '../../domain/types';
import { Dialog } from '../../ui/Dialog';
import { DeleteButton } from '../DeleteButton';
import { EVENT_CATEGORIES } from './types';

export interface CalendarEventDialogProps {
  isOpen: boolean;
  editingEventId: string | null;
  evtTitle: string;
  evtCategory: EventCategory;
  evtDate: string;
  evtStart: string;
  evtEnd: string;
  evtLocation: string;
  evtAttendees: string[];
  formError: string;
  isSavingEvent: boolean;
  team: TeamMember[];
  titleInputRef: React.RefObject<HTMLInputElement | null>;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onCategoryChange: (value: EventCategory) => void;
  onDateChange: (value: string) => void;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onToggleAttendee: (memberId: string) => void;
  onSaveEvent: (e: React.FormEvent) => void;
  onDeleteCurrentEvent: () => void;
}

export function CalendarEventDialog({
  isOpen,
  editingEventId,
  evtTitle,
  evtCategory,
  evtDate,
  evtStart,
  evtEnd,
  evtLocation,
  evtAttendees,
  formError,
  isSavingEvent,
  team,
  titleInputRef,
  onClose,
  onTitleChange,
  onCategoryChange,
  onDateChange,
  onStartChange,
  onEndChange,
  onLocationChange,
  onToggleAttendee,
  onSaveEvent,
  onDeleteCurrentEvent,
}: CalendarEventDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      eyebrow={editingEventId ? 'Modify Schedule' : 'Schedule Dispatch'}
      title={editingEventId ? 'Edit event' : 'New event'}
      maxWidthClass="max-w-md"
      footer={
        <div className="flex items-center justify-between w-full">
          {editingEventId ? (
            <DeleteButton name={evtTitle} onDelete={onDeleteCurrentEvent} />
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs font-medium text-[var(--ink-secondary)] hover:text-[var(--ink-primary)] hover:bg-[var(--surface-sunken)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="calendar-event-form"
              disabled={isSavingEvent}
              style={{ backgroundColor: 'var(--accent)' }}
              className="px-4 py-2 min-h-[44px] sm:min-h-0 rounded-full text-xs font-semibold text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSavingEvent ? 'Saving…' : editingEventId ? 'Save changes' : 'Create event'}
            </button>
          </div>
        </div>
      }
    >
      <form
        id="calendar-event-form"
        onSubmit={onSaveEvent}
        className="p-4 sm:p-6 space-y-3.5"
        noValidate
      >
        <div>
          <label
            htmlFor="calendar-event-title"
            className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
          >
            Event title <span style={{ color: 'var(--accent)' }}>*</span>
          </label>
          <input
            ref={titleInputRef}
            id="calendar-event-title"
            type="text"
            required
            value={evtTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Sub-bottom Sonar Calibration Review"
            className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)] focus:bg-[var(--surface-elevated)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="calendar-event-category"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
            >
              Category
            </label>
            <select
              id="calendar-event-category"
              value={evtCategory}
              onChange={(e) => onCategoryChange(e.target.value as EventCategory)}
              className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
            >
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="calendar-event-date"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
            >
              Date <span style={{ color: 'var(--accent)' }}>*</span>
            </label>
            <input
              id="calendar-event-date"
              type="date"
              required
              value={evtDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="calendar-event-start"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
            >
              Start time
            </label>
            <input
              id="calendar-event-start"
              type="time"
              value={evtStart}
              onChange={(e) => onStartChange(e.target.value)}
              className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
            />
          </div>

          <div>
            <label
              htmlFor="calendar-event-end"
              className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
            >
              End time
            </label>
            <input
              id="calendar-event-end"
              type="time"
              value={evtEnd}
              onChange={(e) => onEndChange(e.target.value)}
              className="w-full h-11 sm:h-10 px-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] focus:outline-2 focus:outline-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="calendar-event-location"
            className="block text-xs font-medium text-[var(--ink-primary)] mb-1"
          >
            Location
          </label>
          <input
            id="calendar-event-location"
            type="text"
            value={evtLocation}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder="e.g. Room 04 · Cartography Lab"
            className="w-full h-11 sm:h-10 px-3 rounded-[var(--radius-sm)] bg-[var(--surface-sunken)] border border-[var(--border-strong)] text-xs sm:text-sm text-[var(--ink-primary)] placeholder:text-[var(--ink-muted)] focus:outline-2 focus:outline-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-[var(--ink-primary)] mb-1.5">
            Attendees
          </label>
          <div className="flex flex-wrap gap-1.5">
            {team.map((member) => {
              const selected = evtAttendees.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onToggleAttendee(member.id)}
                  aria-pressed={selected}
                  style={
                    selected
                      ? {
                          backgroundColor: 'var(--accent-soft)',
                          color: 'var(--accent)',
                          borderColor: 'var(--accent-border)',
                        }
                      : undefined
                  }
                  className={`px-3 py-1.5 min-h-[40px] sm:min-h-0 rounded-full border text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                    selected
                      ? 'font-semibold'
                      : 'bg-[var(--surface-sunken)] border-[var(--border-hairline)] text-[var(--ink-secondary)] hover:text-[var(--ink-primary)]'
                  }`}
                >
                  <span>{member.initials}</span>
                  <span>{member.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {formError && (
          <p role="alert" className="text-xs font-medium text-[var(--status-critical)]">
            {formError}
          </p>
        )}
      </form>
    </Dialog>
  );
}
