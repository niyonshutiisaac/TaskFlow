import { useState, useEffect, useCallback, useMemo } from 'react';
import { Task, FilterStatus, FilterPriority, SortBy, SortOrder, Stats, CreateTaskPayload } from './types';
import { tasksApi } from './api/client';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import FilterBar from './components/FilterBar';
import StatsOverview from './components/StatsOverview';
import EmptyState from './components/EmptyState';
import ToastContainer, { ToastItem } from './components/Toast';
import { Plus, LayoutList, Kanban, Loader2 } from 'lucide-react';
import clsx from 'clsx';

function App() {
  // Data
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<FilterStatus>('all');
  const [priority, setPriority] = useState<FilterPriority>('all');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  // UI
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await tasksApi.getAll({
        status: status !== 'all' ? status : undefined,
        priority: priority !== 'all' ? priority : undefined,
        search: debouncedSearch || undefined,
        sortBy,
        sortOrder,
        limit: 100,
      });
      setTasks(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
      showToast('error', 'Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [status, priority, debouncedSearch, sortBy, sortOrder, showToast]);

  const fetchStats = useCallback(async () => {
    try {
      setIsStatsLoading(true);
      const res = await tasksApi.getStats();
      setStats(res.data);
    } catch {
      // silent
    } finally {
      setIsStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Keyboard shortcut N
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'n' && !isFormOpen && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setEditingTask(null);
        setIsFormOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isFormOpen]);

  const handleCreateOrUpdate = async (payload: CreateTaskPayload) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        await tasksApi.update(editingTask.id, payload);
        showToast('success', 'Task updated');
      } else {
        await tasksApi.create(payload);
        showToast('success', 'Task created');
      }
      await Promise.all([fetchTasks(), fetchStats()]);
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save task');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, newStatus: 'pending' | 'completed') => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    try {
      await tasksApi.updateStatus(id, newStatus);
      await fetchStats();
      showToast('success', newStatus === 'completed' ? 'Task completed' : 'Task marked as pending');
    } catch {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus === 'completed' ? 'pending' : 'completed' } : t));
      showToast('error', 'Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task? This action cannot be undone.')) return;
    try {
      await tasksApi.delete(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      await fetchStats();
      showToast('success', 'Task deleted');
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete task');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('all');
    setPriority('all');
  };

  const hasActiveFilters = search || status !== 'all' || priority !== 'all';

  const groupedTasks = useMemo(() => {
    if (viewMode !== 'board') return null;
    return {
      pending: tasks.filter(t => t.status === 'pending'),
      completed: tasks.filter(t => t.status === 'completed'),
    };
  }, [tasks, viewMode]);

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-[#E8E6E1]">
        <div className="mx-auto max-w-[1200px] px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#111111] flex items-center justify-center">
                <span className="text-white font-[700] text-[14px] tracking-[-0.02em]">T</span>
              </div>
              <div>
                <h1 className="text-[15px] font-[650] tracking-[-0.02em] leading-none text-[#1A1A18]">Taskflow</h1>
                <p className="text-[11px] font-[500] text-[#6B6B6B] leading-none mt-0.5">kLab • Task Management</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1 rounded-[10px] border border-[#E8E6E1] bg-[#FAFAF8] p-1">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-[7px] text-[12px] font-[550] transition-all',
                  viewMode === 'list' ? 'bg-white shadow-soft border border-[#E8E6E1] text-[#1A1A18]' : 'text-[#6B6B6B] hover:text-[#1A1A18]'
                )}
              >
                <LayoutList size={14} /> List
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1 rounded-[7px] text-[12px] font-[550] transition-all',
                  viewMode === 'board' ? 'bg-white shadow-soft border border-[#E8E6E1] text-[#1A1A18]' : 'text-[#6B6B6B] hover:text-[#1A1A18]'
                )}
              >
                <Kanban size={14} /> Board
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[12px] text-[#6B6B6B]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-[450]">API connected</span>
            </div>
            <button
              onClick={() => { setEditingTask(null); setIsFormOpen(true); }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-[10px] bg-[#111111] text-white text-[13px] font-[550] hover:bg-black transition-all shadow-soft hover:shadow-medium"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">New task</span>
              <span className="sm:hidden">New</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-[88px] space-y-6">
            <div>
              <h2 className="text-[12px] font-[600] tracking-wide uppercase text-[#6B6B6B] mb-3">Overview</h2>
              <StatsOverview stats={stats} isLoading={isStatsLoading} />
            </div>

            <div className="rounded-[12px] bg-white border border-[#E8E6E1] p-4">
              <h3 className="text-[12px] font-[600] tracking-wide uppercase text-[#1A1A18] mb-3">Productivity tip</h3>
              <p className="text-[13px] leading-[18px] text-[#6B6B6B]">
                Focus on high-priority tasks first. You have <span className="font-[600] text-[#1A1A18]">{stats?.highPriorityPending || 0} high-priority</span> pending tasks.
              </p>
              <div className="mt-3 pt-3 border-t border-[#E8E6E1] flex items-center justify-between text-[11px]">
                <span className="text-[#9B9B9B]">Completion</span>
                <span className="font-[600] text-[#1A1A18]">
                  {stats && stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="hidden lg:block rounded-[12px] bg-[#111111] p-4 text-white">
              <h3 className="text-[13px] font-[600]">Built for kLab Tech Upskill</h3>
              <p className="mt-1.5 text-[12px] leading-[16px] text-white/70">
                Professional task management with React, Express, and Neon PostgreSQL.
              </p>
              <div className="mt-3 flex gap-1.5">
                <span className="px-2 py-1 rounded-[6px] bg-white/10 text-[10px] font-[500]">React + TS</span>
                <span className="px-2 py-1 rounded-[6px] bg-white/10 text-[10px] font-[500]">Neon PG</span>
                <span className="px-2 py-1 rounded-[6px] bg-white/10 text-[10px] font-[500]">Express</span>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="min-w-0 space-y-6">
            <FilterBar
              search={search}
              onSearchChange={setSearch}
              status={status}
              onStatusChange={setStatus}
              priority={priority}
              onPriorityChange={setPriority}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              totalCount={tasks.length}
            />

            {/* Tasks */}
            {isLoading ? (
              <div className="grid gap-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-[92px] rounded-[12px] bg-white border border-[#E8E6E1] p-4 animate-pulse">
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-[6px] bg-[#F5F4F0]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-[#F5F4F0] rounded" />
                        <div className="h-3 w-1/2 bg-[#F5F4F0] rounded" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <EmptyState type="error" />
            ) : tasks.length === 0 ? (
              hasActiveFilters ? (
                <EmptyState type="no-results" onClearFilters={clearFilters} />
              ) : (
                <EmptyState type="empty" onCreateTask={() => setIsFormOpen(true)} />
              )
            ) : viewMode === 'list' ? (
              <div className="grid gap-3 animate-fade-in">
                {tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleStatus={handleToggleStatus}
                    onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <h3 className="text-[12px] font-[600] tracking-wide uppercase text-[#1A1A18]">
                      Pending — {groupedTasks?.pending.length}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {groupedTasks?.pending.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleStatus={handleToggleStatus}
                        onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
                        onDelete={handleDelete}
                      />
                    ))}
                    {groupedTasks?.pending.length === 0 && (
                      <div className="py-8 text-center rounded-[12px] border border-dashed border-[#E8E6E1] bg-white">
                        <p className="text-[13px] text-[#9B9B9B]">No pending tasks</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-[12px] font-[600] tracking-wide uppercase text-[#1A1A18]">
                      Completed — {groupedTasks?.completed.length}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {groupedTasks?.completed.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onToggleStatus={handleToggleStatus}
                        onEdit={(t) => { setEditingTask(t); setIsFormOpen(true); }}
                        onDelete={handleDelete}
                      />
                    ))}
                    {groupedTasks?.completed.length === 0 && (
                      <div className="py-8 text-center rounded-[12px] border border-dashed border-[#E8E6E1] bg-white">
                        <p className="text-[13px] text-[#9B9B9B]">No completed tasks yet</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Loading more indicator */}
            {isLoading && tasks.length > 0 && (
              <div className="flex justify-center py-4">
                <Loader2 size={18} className="animate-spin text-[#6B6B6B]" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Form Modal */}
      <TaskForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingTask(null); }}
        onSubmit={handleCreateOrUpdate}
        task={editingTask}
        isLoading={isSubmitting}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Footer */}
      <footer className="border-t border-[#E8E6E1] mt-12">
        <div className="mx-auto max-w-[1200px] px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#9B9B9B]">
          <span>© 2026 Taskflow — Built for kLab Tech Upskill Program</span>
          <div className="flex items-center gap-4">
            <span className="font-[450]">React • TypeScript • Express • Neon PostgreSQL</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
