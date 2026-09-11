import React from 'react';
import { DashboardStats } from '../../types';
import { FolderKanban, Users, AlertTriangle, CheckCircle, Clock, FileSearch } from 'lucide-react';

interface AdminDashboardProps {
  stats: DashboardStats;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Admin Intelligence Dashboard</h2>
          <p className="text-slate-400 text-sm mt-0.5">Agency-wide project telemetry & system metrics</p>
        </div>
      </div>

      {/* Metrics Grid (Online user count removed as requested!) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <div className="p-2 bg-brand-500/10 text-brand-400 rounded-xl">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats.totalProjects || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Clients Managed</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white mt-3">{stats.totalClients || 0}</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Overdue Tasks</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-400 mt-3">{stats.overdueCount || 0}</div>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-4">Total Tasks by Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
              <Clock className="w-4 h-4 text-slate-400" /> To Do
            </div>
            <div className="text-2xl font-bold text-white mt-2">{stats.tasksByStatus?.TODO || 0}</div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-medium">
              <Clock className="w-4 h-4 text-amber-400" /> In Progress
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-2">{stats.tasksByStatus?.IN_PROGRESS || 0}</div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-medium">
              <FileSearch className="w-4 h-4 text-purple-400" /> In Review
            </div>
            <div className="text-2xl font-bold text-purple-400 mt-2">{stats.tasksByStatus?.IN_REVIEW || 0}</div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> Done
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2">{stats.tasksByStatus?.DONE || 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
