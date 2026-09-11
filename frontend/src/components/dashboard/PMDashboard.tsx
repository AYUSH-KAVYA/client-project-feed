import React from 'react';
import { DashboardStats } from '../../types';
import { FolderKanban, Calendar, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface PMDashboardProps {
  stats: DashboardStats;
}

export const PMDashboard: React.FC<PMDashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Project Manager Dashboard</h2>
        <p className="text-slate-400 text-sm mt-0.5">Overview of your managed client projects & team task priorities</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">My Managed Projects</span>
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats.totalProjects || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Overdue Tasks</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-3">{stats.overdueCount || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Due This Week</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 mt-3">{stats.upcomingTasks?.length || 0}</div>
        </div>
      </div>

      {/* Priority Breakdown & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks by Priority */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Tasks by Priority</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-rose-400 font-semibold text-xs uppercase">Critical</span>
              <div className="text-2xl font-bold text-rose-400 mt-1">{stats.tasksByPriority?.CRITICAL || 0}</div>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-orange-400 font-semibold text-xs uppercase">High</span>
              <div className="text-2xl font-bold text-orange-400 mt-1">{stats.tasksByPriority?.HIGH || 0}</div>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-blue-400 font-semibold text-xs uppercase">Medium</span>
              <div className="text-2xl font-bold text-blue-400 mt-1">{stats.tasksByPriority?.MEDIUM || 0}</div>
            </div>
            <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl">
              <span className="text-slate-400 font-semibold text-xs uppercase">Low</span>
              <div className="text-2xl font-bold text-slate-300 mt-1">{stats.tasksByPriority?.LOW || 0}</div>
            </div>
          </div>
        </div>

        {/* Upcoming Tasks Due This Week */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4">Upcoming Due Dates This Week</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {!stats.upcomingTasks || stats.upcomingTasks.length === 0 ? (
              <div className="text-slate-400 text-sm py-4 text-center">No upcoming tasks due this week</div>
            ) : (
              stats.upcomingTasks.map((t) => (
                <div key={t.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white truncate max-w-xs">{t.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {t.project?.name} • Assigned: {t.assignedTo?.name || 'Unassigned'}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-amber-400">
                      {format(new Date(t.dueDate), 'MMM d')}
                    </span>
                    <div className="text-[10px] text-slate-400">
                      {formatDistanceToNow(new Date(t.dueDate), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
