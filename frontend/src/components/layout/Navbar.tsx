import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { NotificationDropdown } from './NotificationDropdown';
import { LogOut, Users, ShieldCheck, UserCheck, Code } from 'lucide-react';
import { Role } from '../../types';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { onlineCount, onlineUsers } = useSocket();
  const [showOnlineModal, setShowOnlineModal] = useState(false);

  const isPMOrAdmin = user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER';

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <ShieldCheck className="w-3 h-3" /> Admin
          </span>
        );
      case 'PROJECT_MANAGER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <UserCheck className="w-3 h-3" /> PM
          </span>
        );
      case 'DEVELOPER':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Code className="w-3 h-3" /> Developer
          </span>
        );
    }
  };

  return (
    <header className="bg-slate-950/80 backdrop-blur border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand-500/20">
            P
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide text-base sm:text-lg">
              ProjectFeed
            </h1>
          </div>
        </div>

        {/* Right: Online Presence (Admin & PM only), Notifications & User */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Online Presence Indicator (Only Admins and PMs can see!) */}
          {isPMOrAdmin && (
            <div className="relative">
              <button
                onClick={() => setShowOnlineModal(!showOnlineModal)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  onlineCount >= 1
                    ? 'bg-slate-900 border-slate-700 text-emerald-400 hover:border-slate-600'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-500'
                }`}
                title="Click to view online users"
              >
                {/* Static Green or Red Dot */}
                <span
                  className={`w-2 h-2 rounded-full ${
                    onlineCount >= 1 ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
                <span className={onlineCount === 0 ? 'text-rose-500 font-bold' : ''}>
                  {onlineCount} Online
                </span>
              </button>

              {showOnlineModal && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 p-3">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-700">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-brand-400" /> Active Online Users
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                      {onlineCount} live
                    </span>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {onlineUsers.length === 0 ? (
                      <div className="text-slate-400 text-xs py-2 text-center">No active users</div>
                    ) : (
                      onlineUsers.map((u) => (
                        <div key={u.userId} className="flex items-center justify-between text-xs py-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                            <span className="text-slate-200 font-medium">{u.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 uppercase">{u.role}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="mt-0.5">{getRoleBadge(user.role)}</div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
