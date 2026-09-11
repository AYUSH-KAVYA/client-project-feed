import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Project } from '../types';
import { FileCheck, Check, X, Building, User, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const ProjectRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await api.get<Project[]>('/api/projects/requests');
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch project requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/projects/${id}/approve`);
      fetchRequests();
    } catch (err) {
      console.error('Failed to approve project:', err);
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/projects/${id}/reject`);
      fetchRequests();
    } catch (err) {
      console.error('Failed to reject project:', err);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileCheck className="w-6 h-6 text-brand-400" /> Pending Project Approval Requests
        </h2>
        <p className="text-slate-400 text-sm mt-0.5">
          Projects submitted by Project Managers requiring Admin authorization before publication
        </p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500 mr-2" />
            <span>Fetching pending project requests...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No pending project requests awaiting approval.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((proj) => (
              <div
                key={proj.id}
                className="p-5 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                      PENDING APPROVAL
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Submitted {format(new Date(proj.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{proj.name}</h3>
                  <p className="text-sm text-slate-300">{proj.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Client: <strong className="text-slate-200">{proj.client?.name}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-brand-400" />
                      Submitted by PM: <strong className="text-slate-200">{proj.createdBy?.name}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleReject(proj.id)}
                    disabled={actionId === proj.id}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-300 font-semibold text-xs rounded-xl border border-slate-700 hover:border-rose-700 transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(proj.id)}
                    disabled={actionId === proj.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" /> Approve & Publish
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
