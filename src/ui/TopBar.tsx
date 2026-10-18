import React, { useState } from 'react';
import { Bell, Mail, Search } from 'lucide-react';
import type { RouteId, TeamMember } from '../domain/types';

interface TopBarProps {
  searchQuery: string;
  currentUser: TeamMember;
  onSearchChange: (q: string) => void;
  onOpenCommandPalette: () => void;
  onNavigateRoute: (route: RouteId) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  currentUser,
  onSearchChange,
  onOpenCommandPalette,
  onNavigateRoute,
}) => {
  const [openMenu, setOpenMenu] = useState<'mail' | 'bell' | null>(null);

  return (
    <header className="h-[68px] shrink-0 bg-white/85 backdrop-blur-md border-b border-[#E6E8EE] px-6 flex items-center justify-between gap-4 z-20">
      <div className="relative flex-1 max-w-[380px]">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search task, project, or specialist..."
          className="w-full pl-10 pr-16 py-2 rounded-full bg-[#F7F8FA] border border-slate-200/80 text-[13px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[var(--accent)] transition-all"
        />
        <button
          type="button"
          onClick={onOpenCommandPalette}
          title="Open Command Palette (⌘K)"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono-tabular font-bold text-slate-500 hover:text-slate-800 cursor-pointer shadow-2xs"
        >
          ⌘F
        </button>
      </div>

      <div className="flex items-center gap-3 relative">
        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === 'mail' ? null : 'mail')}
          aria-label="Studio messages"
          className="w-9 h-9 rounded-full bg-[#F7F8FA] hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
        >
          <Mail className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setOpenMenu(openMenu === 'bell' ? null : 'bell')}
          aria-label="Studio notifications"
          className="w-9 h-9 rounded-full bg-[#F7F8FA] hover:bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 transition-colors cursor-pointer relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
        </button>

        {openMenu && (
          <div
            onMouseLeave={() => setOpenMenu(null)}
            className="absolute right-0 top-12 w-72 bg-white rounded-2xl border border-[#E6E8EE] shadow-xl p-4 z-50 space-y-2.5"
          >
            <div className="text-[12px] font-bold text-slate-900">
              {openMenu === 'mail' ? 'Studio Dispatches' : 'Recent Activity'}
            </div>
            <div className="text-[11px] text-slate-600 space-y-2">
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="font-bold text-slate-800">Mireia Vance</span> posted a critique
                note on <span className="font-semibold">Harbor Mobile Redesign</span>.
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <span className="font-bold text-slate-800">Tarek Al-Mansoor</span> advanced{' '}
                <span className="font-mono-tabular">PLT-104-C</span> to Done.
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => onNavigateRoute('Settings')}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-[12px] font-bold flex items-center justify-center shrink-0">
            {currentUser.initials}
          </div>
          <div className="hidden sm:block min-w-0">
            <div className="text-[13px] font-bold text-slate-900 leading-tight truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-400 font-mono-tabular truncate">
              {currentUser.email}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};
