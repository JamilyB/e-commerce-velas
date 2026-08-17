import React from 'react';

export const Card: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-[#E4C7B7]/30 shadow-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<{
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}> = ({ title, subtitle, action }) => (
  <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4C7B7]/20">
    <div>
      <h3 className="text-sm font-bold text-[#56443F]">{title}</h3>
      {subtitle && <p className="text-xs text-[#A28776] mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);
