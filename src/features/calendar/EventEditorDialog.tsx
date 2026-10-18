import React, { useEffect, useState } from 'react';
import type { CalendarEvent, EventCategory, TeamMember } from '../../domain/types';
import { Dialog } from '../../ui/Dialog';

interface EventEditorDialogProps {
  open: boolean;
  editingEvent: CalendarEvent | null;
  defaultDate: string;
  team: TeamMember[];
  currentUserId: string;
  onClose: () => void;
  onSaveNew: (input: {
    title: string;
    category: EventCategory;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    attendeeIds: string[];
  }) => void;
  onSaveUpdate: (
    eventId: string,
    input: {
      title: string;
      category: EventCategory;
      date: string;
      startTime: string;
      endTime: string;
      location: string;
      attendeeIds: string[];
    }
  ) => void;
}

const EVENT_CATEGORIES: EventCategory[] = [
  'Meeting',
  'Team',
  'Review',
  'Deadline',
  'Social',
];

export const EventEditorDialog: React.FC<EventEditorDialogProps> = ({
  open,
  editingEvent,
  defaultDate,
  team,
  currentUserId,
  onClose,
  onSaveNew,
  onSaveUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<EventCategory>('Review');
  const [date, setDate] = useState(defaultDate);
  const [startTime, setStartTime] = useState('14:00');
  const [endTime, setEndTime] = useState('15:00');
  const [location, setLocation] = useState('Design Studio B');
  const [attendeeIds, setAttendeeIds] = useState<string[]>([currentUserId]);

  useEffect(() => {
    if (!open) return;
    if (editingEvent) {
      setTitle(editingEvent.title);
      setCategory(editingEvent.category);
      setDate(editingEvent.date);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setLocation(editingEvent.location);
      setAttendeeIds(editingEvent.attendeeIds);
    } else {
      setTitle('');
      setCategory('Review');
      setDate(defaultDate);
      setStartTime('14:00');
      setEndTime('15:00');
      setLocation('Design Studio B');
      setAttendeeIds([currentUserId]);
    }
  }, [open, editingEvent, defaultDate, currentUserId]);

  const toggleAttendee = (memberId: string) => {
    setAttendeeIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const payload = {
      title: title.trim(),
      category,
      date,
      startTime,
      endTime,
      location: location.trim() || 'Studio Commons',
      attendeeIds: attendeeIds.length > 0 ? attendeeIds : [currentUserId],
    };
    if (editingEvent) {
      onSaveUpdate(editingEvent.id, payload);
    } else {
      onSaveNew(payload);
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={editingEvent ? 'Edit Calendar Event' : 'Schedule Calendar Event'}
      description="Coordinate critiques, client reviews, and studio milestones."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[12px] font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="calendar-event-form"
            className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold transition-colors cursor-pointer"
          >
            {editingEvent ? 'Save Changes' : 'Schedule Event'}
          </button>
        </>
      }
    >
      <form id="calendar-event-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Event Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g., Harbor architecture review"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EventCategory)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium bg-white focus:outline-none focus:border-[var(--accent)]"
            >
              {EVENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              End Time
            </label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Location / Room
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
            Attendees
          </label>
          <div className="flex flex-wrap gap-1.5">
            {team.map((member) => {
              const selected = attendeeIds.includes(member.id);
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => toggleAttendee(member.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer ${
                    selected
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {member.name}
                </button>
              );
            })}
          </div>
        </div>
      </form>
    </Dialog>
  );
};
