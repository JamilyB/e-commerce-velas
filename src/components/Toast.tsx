import { Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Toast: React.FC = () => {
  const { toast } = useStore();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-[#56443F] text-white px-5 py-3 rounded-xl shadow-lg border border-[#E4C7B7]/20 flex items-center gap-2 animate-fade-in text-xs font-semibold">
      <Sparkles size={14} className="text-[#E4C7B7]" />
      <span>{toast}</span>
    </div>
  );
};
