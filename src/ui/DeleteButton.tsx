import React, { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteButtonProps {
  onConfirm: () => void;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

const ARM_TIMEOUT_MS = 2800;

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onConfirm,
  label = 'Delete record',
  size = 'sm',
  className = '',
}) => {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), ARM_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    onConfirm();
  };

  if (armed) {
    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseLeave={() => setArmed(false)}
        title="Click again to confirm deletion"
        aria-label={`Confirm ${label}`}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold shadow-xs hover:bg-rose-700 transition-colors cursor-pointer shrink-0 ${className}`}
      >
        <Trash2 className="w-3 h-3" />
        <span>Confirm?</span>
      </button>
    );
  }

  const dimensions = size === 'sm' ? 'w-7 h-7' : 'w-8 h-8';

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label}
      className={`${dimensions} rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200/70 transition-all cursor-pointer shrink-0 ${className}`}
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
};
