import { Project, TaskItem, TeamMember } from '../../domain/types';

export interface MemberCollaborationRow {
  member: TeamMember;
  task: TaskItem | undefined;
}

export interface WeeklyOutputProjectSegment {
  projectId: string;
  projectName: string;
  tint: string;
  seconds: number;
  hours: number;
}

export interface WeeklyOutputDayColumn {
  dayIndex: number;
  short: string;
  full: string;
  key: string;
  segments: WeeklyOutputProjectSegment[];
  totalHours: number;
  totalSeconds: number;
  formattedTotal: string;
  isToday: boolean;
}

export interface DashboardProjectTintEntry {
  project: Project;
  tint: string;
}
