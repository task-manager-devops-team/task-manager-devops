import { TaskPriority, TaskStatus } from './task';

export interface Stats {
  total: number;
  overdue: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
}