import { Stats } from '../types';
import { CheckCircle2, Clock, AlertTriangle, ListTodo } from 'lucide-react';

interface Props {
  stats: Stats | null;
  isLoading?: boolean;
}

export default function StatsOverview({ stats, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-[88px] rounded-[12px] bg-white border border-[#E8E6E1] animate-pulse" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    {
      label: 'Total tasks',
      value: stats.total,
      icon: ListTodo,
      color: 'text-[#1A1A18]',
      bg: 'bg-[#F5F4F0]',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'High priority',
      value: stats.highPriorityPending,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div
          key={item.label}
          className="relative overflow-hidden rounded-[12px] bg-white border border-[#E8E6E1] p-4 hover:border-[#D1CFC9] transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-[600] tracking-wide uppercase text-[#6B6B6B]">
                {item.label}
              </p>
              <p className="mt-2 text-[24px] font-[650] tracking-[-0.02em] leading-none text-[#1A1A18]">
                {item.value}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-[8px] ${item.bg} flex items-center justify-center`}>
              <item.icon size={16} className={item.color} />
            </div>
          </div>
          
          {/* Progress bar for pending/completed */}
          {(item.label === 'Pending' || item.label === 'Completed') && stats.total > 0 && (
            <div className="mt-3 h-1 w-full bg-[#F5F4F0] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#111111] rounded-full transition-all duration-500"
                style={{ 
                  width: `${item.label === 'Pending' 
                    ? (stats.pending / stats.total) * 100 
                    : (stats.completed / stats.total) * 100}%` 
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
