import React from 'react';

type Variant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

const variants: Record<Variant, string> = {
  default: 'bg-[#8B645A]/10 text-[#8B645A] border-[#8B645A]/20',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  error: 'bg-red-50 text-red-700 border-red-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  neutral: 'bg-gray-100 text-gray-600 border-gray-200',
};

export const Badge: React.FC<{
  variant?: Variant;
  children: React.ReactNode;
  className?: string;
}> = ({ variant = 'default', children, className = '' }) => (
  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${variants[variant]} ${className}`}>
    {children}
  </span>
);
