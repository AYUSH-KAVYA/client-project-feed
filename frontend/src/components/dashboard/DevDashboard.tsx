import React from 'react';
import { DashboardStats } from '../../types';
import { getTaskCardStyle } from '../../utils/taskCardStyle';
import { CheckSquare, AlertTriangle, Clock, Calendar } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface DevDashboardProps {
  stats: DashboardStats;
}

export const DevDashboard: React.FC<DevDashboardProps> = ({ stats }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded-full">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO':
        return <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded font-medium">To Do</span>;
      case 'IN_PROGRESS':
        return <span className="px-2 py-0.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-medium">In Progress</span>;
      case 'IN_REVIEW':
        return <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-medium">In Review</span>;
      case 'DONE':
        return <span className="px-2 py-0.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-medium">Done</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Developer Workspace</h2>
        <p className="text-slate-400 text-sm mt-0.5">Your assigned task queue sorted by priority and due date</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-slate-400 text-xs font-semibold uppercase">Assigned</div>
          <div className="text-2xl font-extrabold text-white mt-1">{stats.totalAssigned || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-amber-400 text-xs font-semibold uppercase">In Progress</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{stats.inProgressCount || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-purple-400 text-xs font-semibold uppercase">In Review</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">{stats.inReviewCount || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="text-emerald-400 text-xs font-semibold uppercase">Completed</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{stats.doneCount || 0}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl col-span-2 sm:col-span-1">
          <div className="text-rose-400 text-xs font-semibold uppercase flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Overdue
          </div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1">{stats.overdueCount || 0}</div>
        </div>
      </div>

      {/* Assigned Tasks List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-brand-400" /> Prioritized Task Queue
        </h3>

        <div className="space-y-3">
          {!stats.tasks || stats.tasks.length === 0 ? (
            <div className="text-slate-400 text-sm py-6 text-center">No assigned tasks right now</div>
          ) : (
            stats.tasks.map((task) => {
              const cardClass = getTaskCardStyle(task);
              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${cardClass}`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-brand-400">#{task.taskNumber}</span>
                      <h4 className="font-semibold text-white text-base">{task.title}</h4>
                      {getPriorityBadge(task.priority)}
                      {getStatusBadge(task.status)}
                      {task.isOverdue && task.status !== 'DONE' && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">{task.description}</p>
                    <div className="text-[11px] text-slate-400 font-medium pt-1">
                      Project: <span className="text-slate-200">{task.project?.name}</span>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <div className="text-xs text-slate-200 font-medium">
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
