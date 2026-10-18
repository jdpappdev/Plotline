import React from 'react';
import type {
  DerivedProjectStatus,
  EventCategory,
  TaskPriority,
  TaskStatus,
} from '../domain/types';
import {
  categoryChipClasses,
  priorityChipClass,
  projectStatusChipClass,
  taskStatusBadge,
} from '../lib/theme';

export const TaskStatusChip: React.FC<{ status: TaskStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const badge = taskStatusBadge(status);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badge.className} ${className}`}
    >
      {badge.label}
    </span>
  );
};

export const PriorityChip: React.FC<{ priority: TaskPriority; className?: string }> = ({
  priority,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${priorityChipClass(priority)} ${className}`}
    >
      {priority}
    </span>
  );
};

export const ProjectStatusChip: React.FC<{
  status: DerivedProjectStatus;
  className?: string;
}> = ({ status, className = '' }) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${projectStatusChipClass(status)} ${className}`}
    >
      {status}
    </span>
  );
};

export const EventCategoryChip: React.FC<{
  category: EventCategory | undefined;
  showDot?: boolean;
  className?: string;
}> = ({ category = 'Meeting', showDot = true, className = '' }) => {
  const { chipClass, dotClass } = categoryChipClasses(category);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${chipClass} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />}
      {category}
    </span>
  );
};
