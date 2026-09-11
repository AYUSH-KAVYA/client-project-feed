import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types';
import { api } from '../../services/api';
import { X, Calendar, UserCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface TaskModalProps {
  task: Task | null;
  onClose: () => void;
  onTaskUpdated: () => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onTaskUpdated }) => {
  if (!task) return null;

  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus);
    setUpdating(true);
    setError('');
    try {
      await api.patch(`/api/tasks/${task.id}/status`, { status: newStatus });
      onTaskUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      setStatus(task.status); // revert
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-brand-400">#{task.taskNumber}</span>
          <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-medium">
            {task.project?.name}
          </span>
          {task.isOverdue && task.status !== 'DONE' && (
            <span className="text-xs px-2.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full font-bold animate-pulse flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> OVERDUE
            </span>
          )}
        </div>

        <h3 className="text-xl font-bold text-white">{task.title}</h3>
        <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          {task.description}
        </p>

        {error && (
          <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-lg text-rose-300 text-xs">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Status Transition</label>
            <select
              value={status}
              disabled={updating}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-medium focus:outline-none focus:border-brand-500 transition-colors"
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Assigned Developer</label>
            <div className="flex items-center gap-2 p-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200">
              <UserCheck className="w-4 h-4 text-brand-400" />
              <span>{task.assignedTo?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Due Date: <strong className="text-slate-200">{format(new Date(task.dueDate), 'MMMM d, yyyy')}</strong></span>
          </div>
          <span className="uppercase font-mono text-[10px] text-slate-500">Priority: {task.priority}</span>
        </div>
      </div>
    </div>
  );
};
