import React from 'react';

const baseInput = 'w-full px-3.5 py-2.5 rounded-lg border border-[#E4C7B7]/40 bg-white text-sm text-[#56443F] placeholder:text-[#A28776]/50 focus:outline-none focus:border-[#8B645A] focus:ring-2 focus:ring-[#8B645A]/10 transition-all';

export const Input: React.FC<{
  label?: string;
  type?: string;
  value: string | number;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  step?: string;
  min?: string;
}> = ({ label, type = 'text', value, onChange, placeholder, required, step, min }) => (
  <label className="block">
    {label && <span className="block text-xs font-semibold text-[#56443F] mb-1.5">{label}{required && <span className="text-[#8B645A]"> *</span>}</span>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      step={step}
      min={min}
      className={baseInput}
    />
  </label>
);

export const Textarea: React.FC<{
  label?: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}> = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <label className="block">
    {label && <span className="block text-xs font-semibold text-[#56443F] mb-1.5">{label}</span>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={baseInput + ' resize-none'}
    />
  </label>
);

export const Select: React.FC<{
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}> = ({ label, value, onChange, options, placeholder }) => (
  <label className="block">
    {label && <span className="block text-xs font-semibold text-[#56443F] mb-1.5">{label}</span>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={baseInput + ' appearance-none cursor-pointer'}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </label>
);

export const Toggle: React.FC<{
  label?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-[#8B645A]' : 'bg-gray-300'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-4' : ''}`} />
    </button>
    {label && <span className="text-xs font-semibold text-[#56443F]">{label}</span>}
  </label>
);

export const Button: React.FC<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}> = ({ variant = 'primary', size = 'md', children, onClick, type = 'button', disabled, className = '' }) => {
  const variants = {
    primary: 'bg-[#56443F] text-white hover:bg-[#8B645A] shadow-sm',
    secondary: 'bg-[#E4C7B7]/30 text-[#56443F] hover:bg-[#E4C7B7]/50 border border-[#E4C7B7]/40',
    danger: 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200',
    ghost: 'text-[#56443F] hover:bg-[#E4C7B7]/20',
  };
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm' };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};
