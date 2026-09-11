import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Project, Client } from '../types';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, Plus, User, Building, Loader2, CheckSquare } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [clientId, setClientId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await api.get<Project[]>('/api/projects');
      setProjects(data);
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') {
      api.get<Client[]>('/api/clients').then((cls) => {
        setClients(cls);
        if (cls.length > 0) setClientId(cls[0].id);
      }).catch(console.error);
    }
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !clientId) return;

    setSubmitting(true);
    setError('');
    setSuccessMsg('');
    try {
      await api.post('/api/projects', { name, description, clientId });
      setName('');
      setDescription('');
      setShowCreateModal(false);
      if (user?.role === 'PROJECT_MANAGER') {
        setSuccessMsg('Project request submitted! Awaiting Admin approval.');
      } else {
        setSuccessMsg('Project created and published successfully!');
      }
      fetchProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const getApprovalBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">PENDING APPROVAL</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full">APPROVED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">REJECTED</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderKanban className="w-6 h-6 text-brand-400" /> Client Projects
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {user?.role === 'ADMIN'
              ? 'All agency projects'
              : user?.role === 'PROJECT_MANAGER'
              ? 'Projects created by you (Pending Admin Approval or Approved)'
              : 'Projects containing your assigned tasks'}
          </p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-xs text-emerald-400 underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500 mr-2" />
          <span>Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-slate-900 border border-slate-800 rounded-2xl">
          No projects found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl shadow-xl flex flex-col justify-between transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs px-2.5 py-1 bg-slate-950 text-brand-400 border border-slate-800 rounded-full font-mono">
                    {proj.client?.company || 'Client Project'}
                  </span>
                  {getApprovalBadge(proj.approvalStatus)}
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-brand-400 transition-colors">
                  {proj.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                  {proj.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[120px]">{proj.client?.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-brand-400" />
                  <span className="truncate max-w-[120px]">{proj.createdBy?.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Create New Project</h3>
            {user?.role === 'PROJECT_MANAGER' && (
              <p className="text-xs text-amber-400 bg-amber-950/40 p-2.5 rounded-lg border border-amber-800/60">
                Note: Project proposals created by Project Managers require Admin approval before reflecting to developers.
              </p>
            )}
            {error && <div className="p-3 bg-rose-950/60 border border-rose-800 rounded text-xs text-rose-300">{error}</div>}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Client *</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.company})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Mobile App Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Project Overview *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe scope, technology stack, and deliverables..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-lg shadow-sm"
                >
                  {submitting ? 'Submitting...' : user?.role === 'PROJECT_MANAGER' ? 'Submit for Approval' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
