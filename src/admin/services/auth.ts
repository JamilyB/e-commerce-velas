import { supabase } from '../../lib/supabase';
import type { AdminUser } from '../types';

const STORAGE_KEY = 'suru_admin_session';

export async function loginAdmin(email: string, password: string): Promise<AdminUser | null> {
  const { data, error } = await supabase
    .from('admin_admins')
    .select('*')
    .eq('email', email)
    .eq('password', password)
    .eq('is_active', true)
    .maybeSingle();

  if (error || !data) return null;

  await supabase
    .from('admin_admins')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', data.id);

  const user = data as unknown as AdminUser;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export function getStoredAdmin(): AdminUser | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function logoutAdmin(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function hasPermission(user: AdminUser | null, perm: string): boolean {
  if (!user) return false;
  if (user.role === 'owner') return true;
  return user.permissions.includes(perm as never);
}
