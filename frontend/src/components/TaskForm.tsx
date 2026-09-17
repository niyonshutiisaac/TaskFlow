import { useState, useEffect } from 'react';
import { Task, CreateTaskPayload } from '../types';
import { X } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTaskPayload) => Promise<void>;
  task?: Task | null;
  isLoading?: boolean;
}

export default function TaskForm({ isOpen, onClose, onSubmit, task, isLoading }: Props) {
  const [formData, setFormData] = useState<CreateTaskPayload>({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must be less than 255 characters';
    }
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be less than 2000 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        status: formData.status,
        priority: formData.priority,
      });
      onClose();
    } catch (err) {
      // Error handled by parent
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#1A1A18]/20 backdrop-blur-[2px]" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full sm:max-w-[480px] bg-white rounded-t-[16px] sm:rounded-[16px] border border-[#E8E6E1] shadow-large animate-slide-up max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E6E1]">
          <div>
            <h2 className="text-[16px] font-[600] tracking-[-0.01em] text-[#1A1A18]">
              {task ? 'Edit task' : 'Create new task'}
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6B6B6B]">
              {task ? 'Update the details for this task' : 'Add a new task to your workflow'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] flex items-center justify-center text-[#6B6B6B] hover:bg-[#F5F4F0] hover:text-[#1A1A18] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 space-y-5">
            {/* Title */}
            <div>
              <label className="block text-[12px] font-[550] tracking-wide uppercase text-[#1A1A18] mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="What needs to be done?"
                className={clsx(
                  'w-full px-3.5 py-2.5 rounded-[10px] border bg-white text-[14px] font-[450] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all',
                  errors.title ? 'border-red-300 bg-red-50/30' : 'border-[#E8E6E1]'
                )}
                autoFocus
              />
              {errors.title && (
                <p className="mt-1.5 text-[12px] text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-[12px] font-[550] tracking-wide uppercase text-[#1A1A18] mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more context or details..."
                rows={3}
                className={clsx(
                  'w-full px-3.5 py-2.5 rounded-[10px] border bg-white text-[14px] font-[450] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all resize-none',
                  errors.description ? 'border-red-300 bg-red-50/30' : 'border-[#E8E6E1]'
                )}
              />
              <div className="mt-1.5 flex justify-between">
                {errors.description ? (
                  <p className="text-[12px] text-red-600">{errors.description}</p>
                ) : (
                  <span />
                )}
                <span className="text-[11px] text-[#9B9B9B]">
                  {formData.description?.length || 0}/2000
                </span>
              </div>
            </div>

            {/* Row: Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-[550] tracking-wide uppercase text-[#1A1A18] mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E8E6E1] bg-white text-[14px] font-[450] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-[550] tracking-wide uppercase text-[#1A1A18] mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-[10px] border border-[#E8E6E1] bg-white text-[14px] font-[450] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#FAFAF8] border-t border-[#E8E6E1] rounded-b-[16px] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-[10px] text-[14px] font-[500] text-[#1A1A18] hover:bg-white border border-transparent hover:border-[#E8E6E1] transition-all"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-[10px] text-[14px] font-[550] bg-[#111111] text-white hover:bg-[#000000] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-soft"
            >
              {isLoading ? 'Saving...' : task ? 'Update task' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
