import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ModificationRequest, Project } from '../types';
import { useAuth } from '../context/AuthContext';
import { GitPullRequest, Plus, Check, X, Loader2, User, FolderKanban } from 'lucide-react';
import { format } from 'date-fns';

export const ModificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [modifications, setModifications] = useState<ModificationRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const isDev = user?.role === 'DEVELOPER';

  const fetchModifications = async () => {
    setLoading(true);
    try {
      const endpoint = isDev ? '/api/modifications/dev' : '/api/modifications/pm';
      const data = await api.get<ModificationRequest[]>(endpoint);
      setModifications(data);
    } catch (err) {
      console.error('Failed to fetch modification proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModifications();
    if (isDev) {
      api.get<Project[]>('/api/projects').then((projs) => {
        setProjects(projs);
        if (projs.length > 0) setProjectId(projs[0].id);
      }).catch(console.error);
    }
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !projectId) return;

    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/modifications', { title, description, projectId });
      setTitle('');
      setDescription('');
      setShowCreateModal(false);
      fetchModifications();
    } catch (err: any) {
      setError(err.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/modifications/${id}/approve`);
      fetchModifications();
    } catch (err) {
      console.error('Failed to approve modification:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/modifications/${id}/reject`);
      fetchModifications();
    } catch (err) {
      console.error('Failed to reject modification:', err);
    } finally {
      setActionId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">PENDING REVIEW</span>;
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
            <GitPullRequest className="w-6 h-6 text-brand-400" /> Developer Modifications & Proposals
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {isDev
              ? 'Propose additional features or technical modifications to Project Managers'
              : 'Review and approve technical feature requests submitted by developers'}
          </p>
        </div>

        {isDev && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Propose Modification
          </button>
        )}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500 mr-2" />
            <span>Fetching modification proposals...</span>
          </div>
        ) : modifications.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No modification proposals found.
          </div>
        ) : (
          <div className="space-y-4">
            {modifications.map((mod) => (
              <div
                key={mod.id}
                className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(mod.status)}
                    <span className="text-xs text-slate-400 font-mono">
                      Submitted {format(new Date(mod.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{mod.title}</h3>
                  <p className="text-sm text-slate-300">{mod.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="w-3.5 h-3.5 text-brand-400" />
                      Project: <strong className="text-slate-200">{mod.project?.name}</strong>
                    </span>
                    {!isDev && mod.dev && (
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        Developer: <strong className="text-slate-200">{mod.dev.name}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {!isDev && mod.status === 'PENDING' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleReject(mod.id)}
                      disabled={actionId === mod.id}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 font-semibold text-xs rounded-xl border border-slate-700 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleApprove(mod.id)}
                      disabled={actionId === mod.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" /> Approve Feature
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Proposal Modal for Devs */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Propose Feature / Modification</h3>
            {error && <div className="p-3 bg-rose-950/60 border border-rose-800 rounded text-xs text-rose-300">{error}</div>}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Project *</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feature Proposal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Add GraphQL Caching Layer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proposal Details & Rationale *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain why this feature or modification will improve performance or architecture..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
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
                  {submitting ? 'Submitting...' : 'Submit Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
