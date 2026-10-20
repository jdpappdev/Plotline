import { TaskItem } from '../../domain/types';

export type FilterCriterion = 'my' | 'high' | 'week';

export interface StageColumn {
  id: TaskItem['status'];
  title: string;
}

export const STAGE_COLUMNS: StageColumn[] = [
  { id: 'Backlog', title: 'To do' },
  { id: 'In Progress', title: 'In progress' },
  { id: 'In Review', title: 'In review' },
  { id: 'Done', title: 'Done' },
];

export const STAGE_IDS: TaskItem['status'][] = STAGE_COLUMNS.map((col) => col.id);
