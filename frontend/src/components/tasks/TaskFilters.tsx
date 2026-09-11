import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { TaskStatus, TaskPriority } from '../../types';

export const TaskFilters: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const dueDateFrom = searchParams.get('dueDateFrom') || '';
  const dueDateTo = searchParams.get('dueDateTo') || '';
  const search = searchParams.get('search') || '';

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const hasActiveFilters = Boolean(status || priority || dueDateFrom || dueDateTo || search);

  return (
    <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-brand-400" /> Filter Tasks (URL Synced)
        </span>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" /> Reset Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search task title..."
            value={search}
            onChange={(e) => updateParam('search', e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => updateParam('status', e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="DONE">Done</option>
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => updateParam('priority', e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-brand-500"
        >
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {/* Due Date From */}
        <input
          type="date"
          value={dueDateFrom}
          onChange={(e) => updateParam('dueDateFrom', e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-brand-500"
          title="Due Date From"
        />

        {/* Due Date To */}
        <input
          type="date"
          value={dueDateTo}
          onChange={(e) => updateParam('dueDateTo', e.target.value)}
          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-brand-500"
          title="Due Date To"
        />
      </div>
    </div>
  );
};
