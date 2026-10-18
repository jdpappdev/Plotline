import React, { useEffect, useState } from 'react';
import { Check, Palette, User } from 'lucide-react';
import type { AccentName, TeamMember, UpdateProfileInput, WeekStart } from '../../domain/types';
import { ACCENT_THEMES } from '../../lib/theme';
import { MotionCard } from '../../ui/Motion';

interface ProfileAndPreferencesProps {
  currentUser: TeamMember;
  accent: AccentName;
  weekStart: WeekStart;
  onUpdateProfile: (input: UpdateProfileInput) => void;
  onSelectAccent: (accent: AccentName) => void;
  onSelectWeekStart: (weekStart: WeekStart) => void;
}

const ACCENT_ORDER: AccentName[] = ['tide', 'moss', 'iris', 'signal'];

export const ProfileAndPreferencesSection: React.FC<ProfileAndPreferencesProps> = ({
  currentUser,
  accent,
  weekStart,
  onUpdateProfile,
  onSelectAccent,
  onSelectWeekStart,
}) => {
  const [name, setName] = useState(currentUser.name);
  const [role, setRole] = useState(currentUser.role);
  const [email, setEmail] = useState(currentUser.email);

  useEffect(() => {
    setName(currentUser.name);
    setRole(currentUser.role);
    setEmail(currentUser.email);
  }, [currentUser]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, role, email });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <MotionCard index={0} hoverLift={false} className="p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <span className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <User className="w-4 h-4" />
          </span>
          <div>
            <h2 className="text-[15px] font-bold text-slate-900">Operator Profile</h2>
            <p className="text-[11px] text-slate-500">
              Updates your identity across the top bar and team roster
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Role Title
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-[13px] font-medium focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Studio Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-[13px] font-mono-tabular focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[12px] font-bold transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </MotionCard>

      <MotionCard index={1} hoverLift={false} className="p-6 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-8 h-8 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">Appearance & Calendar</h2>
              <p className="text-[11px] text-slate-500">
                Customize studio accent tokens and regional week alignment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {ACCENT_ORDER.map((id) => {
              const theme = ACCENT_THEMES[id];
              const isSelected = accent === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectAccent(id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]/60 shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className={`w-5 h-5 rounded-full shrink-0 swatch-${id}`} />
                    <div className="min-w-0">
                      <div className="text-[12px] font-bold text-slate-900">{theme.label}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {theme.description}
                      </div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[var(--accent)] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-bold text-slate-900">First Day of Week</div>
            <div className="text-[11px] text-slate-500">
              Updates Calendar grid and Weekly Output chart order
            </div>
          </div>

          <div className="inline-flex bg-slate-100 p-1 rounded-xl">
            {(['monday', 'sunday'] as WeekStart[]).map((day) => {
              const active = weekStart === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => onSelectWeekStart(day)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold capitalize transition-colors cursor-pointer ${
                    active ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </MotionCard>
    </div>
  );
};
