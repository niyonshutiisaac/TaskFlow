import { ListTodo, SearchX, Plus } from 'lucide-react';

interface Props {
  type: 'empty' | 'no-results' | 'error';
  onCreateTask?: () => void;
  onClearFilters?: () => void;
}

export default function EmptyState({ type, onCreateTask, onClearFilters }: Props) {
  if (type === 'no-results') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-[16px] border border-dashed border-[#E8E6E1]">
        <div className="w-12 h-12 rounded-[12px] bg-[#F5F4F0] flex items-center justify-center mb-4">
          <SearchX size={20} className="text-[#6B6B6B]" />
        </div>
        <h3 className="text-[15px] font-[600] tracking-[-0.01em] text-[#1A1A18]">No matching tasks</h3>
        <p className="mt-1.5 text-[13px] leading-[18px] text-[#6B6B6B] max-w-[280px]">
          We couldn't find any tasks matching your filters. Try adjusting your search or filters.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="mt-4 px-4 py-2 rounded-[10px] text-[13px] font-[550] bg-[#111111] text-white hover:bg-black transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center bg-white rounded-[16px] border border-[#E8E6E1]">
        <div className="w-12 h-12 rounded-[12px] bg-red-50 flex items-center justify-center mb-4">
          <span className="text-[20px]">⚠️</span>
        </div>
        <h3 className="text-[15px] font-[600] tracking-[-0.01em] text-[#1A1A18]">Something went wrong</h3>
        <p className="mt-1.5 text-[13px] leading-[18px] text-[#6B6B6B] max-w-[280px]">
          Failed to load tasks. Please check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-white rounded-[16px] border border-dashed border-[#E8E6E1]">
      <div className="w-16 h-16 rounded-[16px] bg-[#111111] flex items-center justify-center mb-5 shadow-soft">
        <ListTodo size={28} className="text-white" />
      </div>
      <h3 className="text-[18px] font-[650] tracking-[-0.015em] text-[#1A1A18]">No tasks yet</h3>
      <p className="mt-2 text-[14px] leading-[20px] text-[#6B6B6B] max-w-[320px] text-balance">
        Get started by creating your first task. Organize your work, track progress, and stay productive.
      </p>
      {onCreateTask && (
        <button
          onClick={onCreateTask}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] text-[14px] font-[550] bg-[#111111] text-white hover:bg-black transition-all shadow-soft hover:shadow-medium"
        >
          <Plus size={16} />
          Create your first task
        </button>
      )}
      <div className="mt-8 flex items-center gap-2 text-[11px] font-[450] text-[#9B9B9B]">
        <span className="w-1 h-1 rounded-full bg-[#E8E6E1]" />
        <span>Tip: Press</span>
        <kbd className="px-1.5 py-0.5 rounded-[4px] bg-[#F5F4F0] border border-[#E8E6E1] text-[10px] font-mono">N</kbd>
        <span>to quickly create a task</span>
      </div>
    </div>
  );
}
