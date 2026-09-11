import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DashboardStats } from '../types';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { PMDashboard } from '../components/dashboard/PMDashboard';
import { DevDashboard } from '../components/dashboard/DevDashboard';
import { Loader2 } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await api.get<DashboardStats>('/api/dashboard/stats');
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mr-3" />
        <span>Loading dashboard telemetry...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300">
        {error || 'Error loading dashboard'}
      </div>
    );
  }

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard stats={stats} />;
    case 'PROJECT_MANAGER':
      return <PMDashboard stats={stats} />;
    case 'DEVELOPER':
      return <DevDashboard stats={stats} />;
    default:
      return <div>Invalid Role</div>;
  }
};
