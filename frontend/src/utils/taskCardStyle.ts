import { Task } from '../types';

export const getTaskCardStyle = (task: Task): string => {
  const isDone = task.status === 'DONE';
  const dueDateObj = new Date(task.dueDate);
  const now = new Date();
  const diffHours = (dueDateObj.getTime() - now.getTime()) / (1000 * 60 * 60);
  const isNearDueDate = diffHours >= 0 && diffHours <= 24; // Less than 24h away

  // 1. Task is DONE -> Shade of Green
  if (isDone) {
    return 'bg-emerald-950/50 border-emerald-800/80 hover:bg-emerald-900/60 shadow-emerald-950/20';
  }

  // 2. Near Due Date (< 24h) OR Overdue & NOT Done -> Red Shade
  if ((isNearDueDate || task.isOverdue) && !isDone) {
    return 'bg-rose-950/60 border-rose-800/90 hover:bg-rose-900/70 shadow-rose-950/30';
  }

  // 3. Priority CRITICAL & NOT Done -> Red Shade
  if (task.priority === 'CRITICAL' && !isDone) {
    return 'bg-rose-950/40 border-rose-800/70 hover:bg-rose-900/50 shadow-rose-950/20';
  }

  // 4. Status IN_PROGRESS & NOT Done -> Yellow / Amber Shade
  if (task.status === 'IN_PROGRESS' && !isDone) {
    return 'bg-amber-950/40 border-amber-800/70 hover:bg-amber-900/50 shadow-amber-950/20';
  }

  // 5. Default / Other cases
  return 'bg-slate-950/70 border-slate-800 hover:border-slate-700';
};
