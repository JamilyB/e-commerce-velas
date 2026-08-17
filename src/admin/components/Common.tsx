import React from 'react';
import { Search } from 'lucide-react';

export const SearchInput: React.FC<{
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ value, onChange, placeholder = 'Buscar...' }) => (
  <div className="relative">
    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A28776]" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-9 pr-3.5 py-2 rounded-lg border border-[#E4C7B7]/40 bg-white text-sm text-[#56443F] placeholder:text-[#A28776]/50 focus:outline-none focus:border-[#8B645A] focus:ring-2 focus:ring-[#8B645A]/10 transition-all"
    />
  </div>
);

export const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}> = ({ open, title, message, onConfirm, onCancel, confirmLabel = 'Confirmar', danger }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-[#56443F]/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-base font-bold text-[#56443F] mb-2">{title}</h3>
        <p className="text-sm text-[#A28776] mb-5">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2.5 text-sm font-semibold rounded-lg text-[#56443F] hover:bg-[#E4C7B7]/20 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2.5 text-sm font-semibold rounded-lg text-white transition-colors ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#56443F] hover:bg-[#8B645A]'}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}> = ({ icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="text-[#A28776] mb-4">{icon}</div>}
    <h3 className="text-sm font-bold text-[#56443F]">{title}</h3>
    {message && <p className="text-xs text-[#A28776] mt-1 max-w-sm">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const PageHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-[#56443F]">{title}</h1>
      {subtitle && <p className="text-xs text-[#A28776] mt-1">{subtitle}</p>}
    </div>
    {action}
  </div>
);
