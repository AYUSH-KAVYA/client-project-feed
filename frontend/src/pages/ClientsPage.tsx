import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Client } from '../types';
import { Building, Plus, Mail, Phone, FolderKanban, Loader2 } from 'lucide-react';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    setLoading(true);
    try {
      const data = await api.get<Client[]>('/api/clients');
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) return;

    setSubmitting(true);
    setError('');
    try {
      await api.post('/api/clients', { name, company, email, phone });
      setName('');
      setCompany('');
      setEmail('');
      setPhone('');
      setShowCreateModal(false);
      fetchClients();
    } catch (err: any) {
      setError(err.message || 'Failed to create client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Building className="w-6 h-6 text-brand-400" /> Agency Clients
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage agency clients and associated projects</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Client
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-500 mr-2" />
          <span>Loading clients...</span>
        </div>
      ) : clients.length === 0 ? (
        <div className="p-12 text-center text-slate-400 text-sm bg-slate-900 border border-slate-800 rounded-2xl">
          No clients registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((c) => (
            <div
              key={c.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-2xl shadow-xl space-y-4 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-lg">
                  {c.company.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-xs px-2.5 py-1 bg-slate-950 text-slate-300 border border-slate-800 rounded-full flex items-center gap-1 font-medium">
                  <FolderKanban className="w-3.5 h-3.5 text-brand-400" />
                  {c._count?.projects || 0} projects
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{c.name}</h3>
                <p className="text-xs font-semibold text-slate-400">{c.company}</p>
              </div>

              <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.email}</span>
                </div>
                {c.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{c.phone}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Client Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-white">Add New Client</h3>
            {error && <div className="p-3 bg-rose-950/60 border border-rose-800 rounded text-xs text-rose-300">{error}</div>}

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Company / Enterprise *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client Email *</label>
                <input
                  type="email"
                  required
                  placeholder="contact@acme.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+1 555-0192"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
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
                  {submitting ? 'Adding...' : 'Save Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
