import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, FolderKanban, CheckSquare, Users, Activity, FileCheck, GitPullRequest } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Projects', path: '/projects', icon: FolderKanban },
    ...(user?.role === 'ADMIN'
      ? [{ label: 'Project Requests', path: '/project-requests', icon: FileCheck }]
      : []),
    { label: 'Tasks', path: '/tasks', icon: CheckSquare },
    ...(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER'
      ? [{ label: 'Clients', path: '/clients', icon: Users }]
      : []),
    { label: 'Dev Modifications', path: '/modifications', icon: GitPullRequest },
    { label: 'Activity Feed', path: '/activity', icon: Activity },
  ];

  return (
    <aside className="w-64 bg-slate-950/50 border-r border-slate-800 p-4 min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-brand-600/20 text-brand-400 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
        <div className="text-xs font-semibold text-slate-300">Signed in as</div>
        <div className="text-sm font-medium text-brand-400 truncate mt-0.5">{user?.email}</div>
        <div className="text-[11px] text-slate-400 mt-1 capitalize font-mono">Role: {user?.role.replace('_', ' ')}</div>
      </div>
    </aside>
  );
};
