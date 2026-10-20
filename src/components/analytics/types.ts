import { Project, TeamMember } from '../../domain/types';
import { AnalyticsRangeKey } from '../../domain/derivations/analytics';

export type { AnalyticsRangeKey };

export interface AnalyticsDailyPoint {
  daysAgo: number;
  date: string;
  label: string;
  seconds: number;
  hours: number;
  formattedDuration: string;
  tasks: number;
  onTimePct: number;
  cycleDays: number;
}

export interface ThroughputChartPoint extends AnalyticsDailyPoint {
  prevHours: number;
  avg7d: number;
}

export interface ProjectShareItem {
  project: Project;
  seconds: number;
  hours: number;
  formattedDuration: string;
  tint: string;
  pct: number;
  exactFraction: number;
}

export interface ContributorMetricItem {
  member: TeamMember;
  seconds: number;
  hours: number;
  formattedDuration: string;
  tasksCompleted: number;
}
