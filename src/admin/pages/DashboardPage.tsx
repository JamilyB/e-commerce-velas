import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  Clock,
  Eye,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboardService } from '../services';
import type { DashboardStats, AdminOrder, AdminProduct } from '../types';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { useAdmin } from '../context/AdminContext';

const fmtBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const orderStatusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'info' },
  processing: { label: 'Processando', variant: 'default' },
  shipped: { label: 'Enviado', variant: 'info' },
  delivered: { label: 'Entregue', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'error' },
};

const BarChart: React.FC<{ data: Array<{ date: string; revenue: number }> }> = ({ data }) => {
  const max = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div className="flex items-end gap-2 h-24">
      {data.map((d) => {
        const pct = (d.revenue / max) * 100;
        const day = new Date(d.date).toLocaleDateString('pt-BR', { weekday: 'short' });
        return (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="w-full rounded-t-md bg-[#8B645A]/20 relative overflow-hidden" style={{ height: 80 }}>
              <div
                className="absolute bottom-0 left-0 right-0 bg-[#8B645A] rounded-t-md transition-all"
                style={{ height: `${Math.max(pct, 2)}%` }}
              />
            </div>
            <span className="text-[9px] text-[#A28776] capitalize">{day}</span>
          </div>
        );
      })}
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  accent?: string;
}> = ({ title, value, change, icon: Icon, accent = '#8B645A' }) => {
  const positive = change >= 0;
  return (
    <Card>
      <CardBody className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-[#A28776] mb-1">{title}</p>
          <p className="text-2xl font-bold text-[#56443F] mb-1">{value}</p>
          <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
            {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{Math.abs(change).toFixed(1)}% vs mês anterior</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
          <Icon size={20} />
        </div>
      </CardBody>
    </Card>
  );
};

export const DashboardPage: React.FC = () => {
  const { setCurrentPage } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getStats().then((s) => {
      setStats(s);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#8B645A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return <div className="text-sm text-[#A28776]">Erro ao carregar dados.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#56443F]">Dashboard</h1>
          <p className="text-xs text-[#A28776] mt-0.5">Visão geral do Atelier SURU</p>
        </div>
        <div className="text-xs text-[#A28776] flex items-center gap-1.5 bg-white border border-[#E4C7B7]/30 rounded-lg px-3 py-2">
          <Clock size={13} />
          <span>Atualizado agora</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard title="Receita Total" value={fmtBRL(stats.totalRevenue)} change={stats.revenueChange} icon={TrendingUp} />
        <StatCard title="Total de Pedidos" value={stats.totalOrders.toString()} change={stats.ordersChange} icon={ShoppingCart} />
        <StatCard title="Clientes" value={stats.totalCustomers.toString()} change={stats.customersChange} icon={Users} />
        <StatCard title="Produtos Ativos" value={stats.totalProducts.toString()} change={0} icon={Package} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Receita dos Últimos 7 Dias" />
          <CardBody>
            <BarChart data={stats.salesByDay} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Pedidos por Status" />
          <CardBody className="space-y-3">
            {stats.ordersByStatus.length === 0 && (
              <p className="text-xs text-[#A28776]">Nenhum pedido.</p>
            )}
            {stats.ordersByStatus.map(({ status, count }) => {
              const cfg = orderStatusConfig[status] ?? { label: status, variant: 'neutral' };
              return (
                <div key={status} className="flex items-center justify-between">
                  <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  <span className="text-sm font-bold text-[#56443F]">{count}</span>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader
            title="Pedidos Recentes"
            action={
              <button
                onClick={() => setCurrentPage('orders')}
                className="text-xs font-semibold text-[#8B645A] hover:text-[#56443F] flex items-center gap-1 transition-colors"
              >
                Ver todos <Eye size={12} />
              </button>
            }
          />
          <div className="divide-y divide-[#E4C7B7]/10">
            {stats.recentOrders.map((order: AdminOrder) => {
              const cfg = orderStatusConfig[order.status] ?? { label: order.status, variant: 'neutral' };
              return (
                <div key={order.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-[#56443F]">{order.order_number}</p>
                    <p className="text-xs text-[#A28776]">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#56443F]">{fmtBRL(order.total)}</p>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                </div>
              );
            })}
            {stats.recentOrders.length === 0 && (
              <p className="text-xs text-[#A28776] px-5 py-4">Nenhum pedido recente.</p>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Estoque Crítico"
            subtitle="Produtos com estoque baixo"
            action={
              <button
                onClick={() => setCurrentPage('inventory')}
                className="text-xs font-semibold text-[#8B645A] hover:text-[#56443F] flex items-center gap-1 transition-colors"
              >
                Ver estoque <Eye size={12} />
              </button>
            }
          />
          <div className="divide-y divide-[#E4C7B7]/10">
            {stats.lowStockProducts.map((p: AdminProduct) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5">
                <div className="flex items-center gap-3">
                  {p.image && (
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-[#E4C7B7]/20" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[#56443F] truncate max-w-[160px]">{p.name}</p>
                    <p className="text-xs text-[#A28776]">{p.sku ?? '—'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-red-600">
                  <AlertCircle size={14} />
                  <span className="text-sm font-bold">{p.stock} un.</span>
                </div>
              </div>
            ))}
            {stats.lowStockProducts.length === 0 && (
              <p className="text-xs text-[#A28776] px-5 py-4">Todos os produtos com estoque adequado.</p>
            )}
          </div>
        </Card>
      </div>

      {stats.topProducts.length > 0 && (
        <Card>
          <CardHeader title="Produtos Mais Vendidos" />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E4C7B7]/20">
                  {['Produto', 'Unidades', 'Receita'].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-[#A28776] py-3 px-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((p) => (
                  <tr key={p.name} className="border-b border-[#E4C7B7]/10">
                    <td className="py-3.5 px-5 text-sm font-semibold text-[#56443F]">{p.name}</td>
                    <td className="py-3.5 px-5 text-sm text-[#56443F]">{p.sales}</td>
                    <td className="py-3.5 px-5 text-sm font-bold text-[#56443F]">{fmtBRL(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
