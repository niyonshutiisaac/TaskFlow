import { FilterStatus, FilterPriority, SortBy, SortOrder } from '../types';
import { Search, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  status: FilterStatus;
  onStatusChange: (v: FilterStatus) => void;
  priority: FilterPriority;
  onPriorityChange: (v: FilterPriority) => void;
  sortBy: SortBy;
  onSortByChange: (v: SortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (v: SortOrder) => void;
  totalCount: number;
}

export default function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  totalCount,
}: Props) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9B9B9B]" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border border-[#E8E6E1] bg-white text-[14px] font-[450] placeholder:text-[#9B9B9B] focus:outline-none focus:ring-2 focus:ring-[#111111]/10 focus:border-[#111111] transition-all"
        />
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[#6B6B6B]">
          <SlidersHorizontal size={14} />
          <span className="text-[11px] font-[600] tracking-wide uppercase">Filters</span>
        </div>

        <div className="h-4 w-px bg-[#E8E6E1] mx-1 hidden sm:block" />

        {/* Status */}
        <div className="flex items-center rounded-[10px] border border-[#E8E6E1] bg-white p-1">
          {(['all', 'pending', 'completed'] as FilterStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => onStatusChange(s)}
              className={clsx(
                'px-3 py-1 rounded-[7px] text-[12px] font-[550] capitalize transition-all',
                status === s
                  ? 'bg-[#111111] text-white shadow-soft'
                  : 'text-[#6B6B6B] hover:text-[#1A1A18] hover:bg-[#FAFAF8]'
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Priority */}
        <div className="flex items-center rounded-[10px] border border-[#E8E6E1] bg-white p-1">
          {(['all', 'high', 'medium', 'low'] as FilterPriority[]).map((p) => (
            <button
              key={p}
              onClick={() => onPriorityChange(p)}
              className={clsx(
                'px-3 py-1 rounded-[7px] text-[12px] font-[550] capitalize transition-all',
                priority === p
                  ? 'bg-[#111111] text-white shadow-soft'
                  : 'text-[#6B6B6B] hover:text-[#1A1A18] hover:bg-[#FAFAF8]'
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[12px] text-[#6B6B6B] hidden sm:inline">
            {totalCount} {totalCount === 1 ? 'task' : 'tasks'}
          </span>
          
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sb, so] = e.target.value.split('-') as [SortBy, SortOrder];
              onSortByChange(sb);
              onSortOrderChange(so);
            }}
            className="px-3 py-1.5 rounded-[8px] border border-[#E8E6E1] bg-white text-[12px] font-[500] text-[#1A1A18] focus:outline-none focus:ring-2 focus:ring-[#111111]/10"
          >
            <option value="created_at-desc">Newest first</option>
            <option value="created_at-asc">Oldest first</option>
            <option value="priority-desc">Priority: High → Low</option>
            <option value="title-asc">Title: A → Z</option>
            <option value="title-desc">Title: Z → A</option>
          </select>
        </div>
      </div>
    </div>
  );
}
