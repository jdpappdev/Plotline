import React from 'react';
import { Compass, Lock } from 'lucide-react';
import type { TeamMember } from '../domain/types';

interface SignedOutScreenProps {
  currentUser: TeamMember;
  onSignIn: () => void;
}

export const SignedOutScreen: React.FC<SignedOutScreenProps> = ({
  currentUser,
  onSignIn,
}) => {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[28px] border border-[#E6E8EE] shadow-xl p-8 text-center space-y-5">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent)] text-white flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-900">
            Session Locked
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Your Plotline Operations Atlas workspace is preserved locally.
          </p>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-slate-900 text-white text-[12px] font-bold flex items-center justify-center shrink-0">
            {currentUser.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-slate-900 truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-slate-500 truncate">{currentUser.email}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignIn}
          className="w-full py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-[13px] font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Lock className="w-4 h-4" />
          <span>Resume Studio Session</span>
        </button>
      </div>
    </div>
  );
};
