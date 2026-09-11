import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Task } from '../types';
import { useAuth } from '../context/AuthContext';
import { TaskFilters } from '../components/tasks/TaskFilters';
import { TaskModal } from '../components/tasks/TaskModal';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { getTaskCardStyle } from '../utils/taskCardStyle';
import { CheckSquare, Plus, Loader2, AlertTriangle, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';

export const TasksPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const queryString = searchParams.toString();
      const url = `/api/tasks${queryString ? `?${queryString}` : ''}`;
      const data = await api.get<Task[]>(url);
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [searchParams]);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-orange-500/20 text-orange-300 border border-orange-500/30 rounded-full">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30 rounded-full">LOW</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'TODO':
        return <span className="px-2.5 py-1 text-xs bg-slate-800 text-slate-300 rounded font-medium">To Do</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-medium">In Progress</span>;
      case 'IN_REVIEW':
        return <span className="px-2.5 py-1 text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded font-medium">In Review</span>;
      case 'DONE':
        return <span className="px-2.5 py-1 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded font-medium">Done</span>;
    }
  };

  const isDueNear = (dueDateStr: string): boolean => {
    const diffHours = (new Date(dueDateStr).getTime() - new Date().getTime()) / (1000 * 60 * 60);
    return diffHours >= 0 && diffHours <= 24;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-brand-400" /> Task Management
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">Filter, track progress, and update status</p>
        </div>

        {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-500/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Task
          </button>
        )}
      </div>

      {/* Filter Component */}
      <TaskFilters />

      {/* Tasks Table / List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500 mr-2" />
            <span>Fetching tasks...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No tasks found matching current filters.
          </div>
        ) : (
          tasks.map((task) => {
            const cardClass = getTaskCardStyle(task);
            const dueNear = isDueNear(task.dueDate) && task.status !== 'DONE';

            return (
              <div
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cardClass}`}
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-brand-400 font-bold">#{task.taskNumber}</span>
                    <h4 className="font-semibold text-white text-base truncate">{task.title}</h4>
                    {getPriorityBadge(task.priority)}
                    {getStatusBadge(task.status)}
                    {task.isOverdue && task.status !== 'DONE' && (
                      <span className="px-2 py-0.5 text-[11px] font-extrabold bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> OVERDUE
                      </span>
                    )}
                    {dueNear && (
                      <span className="px-2 py-0.5 text-[11px] font-extrabold bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" /> DUE IN &lt; 24H
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1">{task.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-1">
                    <span>Project: <strong className="text-slate-200">{task.project?.name}</strong></span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-brand-400" />
                      {task.assignedTo?.name || 'Unassigned'}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs text-slate-200 font-medium flex items-center gap-1 justify-end">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    {format(new Date(task.dueDate), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={() => {
            fetchTasks();
            setSelectedTask(null);
          }}
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchTasks}
        />
      )}
    </div>
  );
};
