import { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';
import clsx from 'clsx';

export type ToastType = 'success' | 'error';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface Props {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export default function ToastContainer({ toasts, onRemove }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }: { toast: ToastItem; onRemove: (id: string) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div
      className={clsx(
        'pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-[12px] border shadow-large backdrop-blur-xl animate-slide-up min-w-[320px]',
        toast.type === 'success'
          ? 'bg-white border-[#E8E6E1] text-[#1A1A18]'
          : 'bg-[#1A1A18] border-[#2A2A28] text-white'
      )}
    >
      <div className={clsx(
        'w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0',
        toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-500/20 text-red-400'
      )}>
        {toast.type === 'success' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
      </div>
      <p className="flex-1 text-[13px] font-[500] leading-[18px]">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className={clsx(
          'w-6 h-6 rounded-[6px] flex items-center justify-center transition-colors flex-shrink-0',
          toast.type === 'success' ? 'hover:bg-[#F5F4F0] text-[#6B6B6B]' : 'hover:bg-white/10 text-white/60'
        )}
      >
        <X size={14} />
      </button>
    </div>
  );
}
