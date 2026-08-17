import React from 'react';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { InventoryPage } from './pages/InventoryPage';
import { OrdersPage } from './pages/OrdersPage';
import { DeliveriesPage } from './pages/DeliveriesPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { CouponsPage } from './pages/CouponsPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { CustomersPage } from './pages/CustomersPage';
import { AdminsPage } from './pages/AdminsPage';
import { SettingsPage } from './pages/SettingsPage';
import type { AdminPage } from './types';

function AdminContent() {
  const { user, currentPage, canAccess } = useAdmin();

  if (!user) return <LoginPage />;

  const pageMap: Record<AdminPage, React.FC> = {
    dashboard: DashboardPage,
    products: ProductsPage,
    categories: CategoriesPage,
    inventory: InventoryPage,
    orders: OrdersPage,
    deliveries: DeliveriesPage,
    returns: ReturnsPage,
    coupons: CouponsPage,
    reviews: ReviewsPage,
    customers: CustomersPage,
    admins: AdminsPage,
    settings: SettingsPage,
  };

  const Page = pageMap[currentPage] ?? DashboardPage;
  const permMap: Record<AdminPage, string> = {
    dashboard: 'dashboard',
    products: 'products',
    categories: 'categories',
    inventory: 'inventory',
    orders: 'orders',
    deliveries: 'deliveries',
    returns: 'returns',
    coupons: 'coupons',
    reviews: 'reviews',
    customers: 'customers',
    admins: 'admins',
    settings: 'settings',
  };

  if (!canAccess(permMap[currentPage] as never)) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <p className="text-sm font-bold text-[#56443F] mb-1">Acesso Negado</p>
          <p className="text-xs text-[#A28776]">Você não tem permissão para acessar esta página.</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Page />
    </AdminLayout>
  );
}

export const AdminApp: React.FC = () => (
  <AdminProvider>
    <AdminContent />
  </AdminProvider>
);
