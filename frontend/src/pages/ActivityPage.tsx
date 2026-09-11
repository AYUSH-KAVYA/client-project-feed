import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Activity, Radio, RefreshCw, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const ActivityPage: React.FC = () => {
  const { activities, isConnected, refetchActivities } = useSocket();
  const { user } = useAuth();

  const getRoleFeedTitle = () => {
    switch (user?.role) {
      case 'ADMIN':
        return 'Global Agency Activity Stream (All Projects)';
      case 'PROJECT_MANAGER':
        return 'Managed Projects Activity Stream';
      case 'DEVELOPER':
        return 'My Assigned Tasks Activity Feed';
      default:
        return 'Activity Stream';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-400" />
            Live Activity Feed
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">{getRoleFeedTitle()}</p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400'
                : 'bg-rose-950/40 border-rose-800/60 text-rose-400'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'animate-pulse' : ''}`} />
            {isConnected ? 'Socket.io Live Connected' : 'Reconnecting...'}
          </div>

          <button
            onClick={refetchActivities}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
            title="Fetch Missed Catchup Events from DB"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Activity Timeline Stream */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No activity log events found. Status changes will appear here in real time.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {activities.map((act) => (
              <div key={act.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-brand-500 ring-4 ring-slate-900 group-hover:scale-125 transition-transform" />

                <div className="bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl p-4 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">{act.userName}</span>
                      <span className="text-xs text-slate-400">on</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-brand-300 text-xs font-mono rounded">
                        {act.projectName}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-200 mt-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    {act.message}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
                    <span>Task #{act.taskNumber}: {act.taskTitle}</span>
                    <span className="font-mono text-[10px] text-slate-400">{new Date(act.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
