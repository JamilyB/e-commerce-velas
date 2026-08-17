import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { AdminUser, AdminPage, AdminPermission } from '../types';
import { getStoredAdmin, loginAdmin, logoutAdmin, hasPermission } from '../services/auth';

interface AdminContextType {
  user: AdminUser | null;
  currentPage: AdminPage;
  setCurrentPage: (page: AdminPage) => void;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  canAccess: (perm: AdminPermission) => boolean;
  toast: string | null;
  showToast: (msg: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = (): AdminContextType => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider');
  return ctx;
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [currentPage, setCurrentPage] = useState<AdminPage>('dashboard');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredAdmin();
    if (stored) setUser(stored);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const admin = await loginAdmin(email, password);
    if (admin) {
      setUser(admin);
      setCurrentPage('dashboard');
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    logoutAdmin();
    setUser(null);
    setCurrentPage('dashboard');
  }, []);

  const canAccess = useCallback(
    (perm: AdminPermission) => hasPermission(user, perm),
    [user],
  );

  return (
    <AdminContext.Provider value={{ user, currentPage, setCurrentPage, login, logout, canAccess, toast, showToast }}>
      {children}
    </AdminContext.Provider>
  );
};
