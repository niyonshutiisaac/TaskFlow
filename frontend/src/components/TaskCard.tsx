import { useState } from 'react';
import { Task } from '../types';
import { Calendar, MoreHorizontal, Trash2, Edit3 } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  task: Task;
  onToggleStatus: (id: string, status: 'pending' | 'completed') => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const priorityConfig = {
  low: { label: 'Low', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  medium: { label: 'Med', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  high: { label: 'High', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export default function TaskCard({ task, onToggleStatus, onEdit, onDelete }: Props) {
  const [showMenu, setShowMenu] = useState(false);
  const isCompleted = task.status === 'completed';
  const priority = priorityConfig[task.priority];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    }).format(date);
  };

  return (
    <div
      className={clsx(
        'group relative bg-white rounded-[12px] border border-[#E8E6E1] p-4 transition-all duration-200',
        'hover:border-[#D1CFC9] hover:shadow-soft',
        isCompleted && 'bg-[#FCFCFB] opacity-[0.85]'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggleStatus(task.id, isCompleted ? 'pending' : 'completed')}
          className={clsx(
            'mt-0.5 flex-shrink-0 w-[20px] h-[20px] rounded-[6px] border-[1.5px] flex items-center justify-center transition-all duration-150',
            isCompleted
              ? 'bg-[#111111] border-[#111111] text-white'
              : 'bg-white border-[#E8E6E1] hover:border-[#111111] hover:bg-[#FAFAF8]'
          )}
          aria-label={isCompleted ? 'Mark as pending' : 'Mark as completed'}
        >
          {isCompleted && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L4.5 8L9.5 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={clsx(
              'text-[14px] font-[500] leading-[20px] tracking-[-0.01em] text-[#1A1A18] line-clamp-2',
              isCompleted && 'line-through text-[#6B6B6B]'
            )}>
              {task.title}
            </h3>
            
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[#6B6B6B] hover:bg-[#F5F4F0] hover:text-[#1A1A18] transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <MoreHorizontal size={14} />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 w-[160px] bg-white rounded-[10px] border border-[#E8E6E1] shadow-medium py-1 animate-scale-in">
                    <button
                      onClick={() => { onEdit(task); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-[13px] font-[450] text-[#1A1A18] hover:bg-[#FAFAF8] flex items-center gap-2"
                    >
                      <Edit3 size={14} /> Edit task
                    </button>
                    <button
                      onClick={() => { onDelete(task.id); setShowMenu(false); }}
                      className="w-full px-3 py-2 text-left text-[13px] font-[450] text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {task.description && (
            <p className={clsx(
              'mt-1.5 text-[13px] leading-[18px] text-[#6B6B6B] line-clamp-2',
              isCompleted && 'line-through'
            )}>
              {task.description}
            </p>
          )}

          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {/* Priority */}
            <div className={clsx('inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] border text-[11px] font-[550] tracking-wide uppercase', priority.bg, priority.text, priority.border)}>
              <span className={clsx('w-1.5 h-1.5 rounded-full', priority.dot)} />
              {priority.label}
            </div>

            {/* Status */}
            <span className={clsx(
              'inline-flex items-center gap-1 px-2 py-1 rounded-[6px] text-[11px] font-[500] border',
              isCompleted 
                ? 'bg-[#111111] text-white border-[#111111]' 
                : 'bg-white text-[#6B6B6B] border-[#E8E6E1]'
            )}>
              <span className={clsx('w-1 h-1 rounded-full', isCompleted ? 'bg-white' : 'bg-amber-500')} />
              {isCompleted ? 'Completed' : 'Pending'}
            </span>

            {/* Date */}
            <span className="inline-flex items-center gap-1 text-[11px] text-[#9B9B9B] font-[450]">
              <Calendar size={11} />
              {formatDate(task.created_at)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
