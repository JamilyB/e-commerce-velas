import React, { useEffect, useState, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { ordersService, activityLogService } from '../services';
import type { AdminOrder, AdminOrderItem } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Select } from '../components/Form';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { SearchInput, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  confirmed: { label: 'Confirmado', variant: 'info' },
  processing: { label: 'Processando', variant: 'default' },
  shipped: { label: 'Enviado', variant: 'info' },
  delivered: { label: 'Entregue', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'error' },
};

const payConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  paid: { label: 'Pago', variant: 'success' },
  refunded: { label: 'Reembolsado', variant: 'info' },
  failed: { label: 'Falhou', variant: 'error' },
};

export const OrdersPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);
  const [items, setItems] = useState<AdminOrderItem[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await ordersService.list());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetail = async (o: AdminOrder) => {
    setDetailOrder(o);
    try { setItems(await ordersService.getItems(o.id)); } catch { setItems([]); }
  };

  const updateStatus = async (o: AdminOrder, status: string) => {
    await ordersService.update(o.id, { status } as Partial<AdminOrder>);
    await activityLogService.log(user, `Atualizou pedido ${o.order_number} para ${status}`, 'order', o.id);
    showToast('Status do pedido atualizado.');
    load();
    setDetailOrder((prev) => prev ? { ...prev, status: status as AdminOrder['status'] } : null);
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search ||
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#8B645A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Pedidos" subtitle={`${orders.length} pedidos`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por número, cliente ou email..." /></div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Todos os status' },
            { value: 'pending', label: 'Pendente' },
            { value: 'confirmed', label: 'Confirmado' },
            { value: 'processing', label: 'Processando' },
            { value: 'shipped', label: 'Enviado' },
            { value: 'delivered', label: 'Entregue' },
            { value: 'cancelled', label: 'Cancelado' },
          ]}
        />
      </div>

      <Card>
        <DataTable
          columns={[
            { key: 'order_number', label: 'Pedido', render: (r) => <span className="font-semibold text-[#56443F]">{(r as unknown as AdminOrder).order_number}</span> },
            { key: 'customer_name', label: 'Cliente', render: (r) => { const o = r as unknown as AdminOrder; return <div><p className="text-sm font-semibold">{o.customer_name}</p><p className="text-xs text-[#A28776]">{o.customer_email}</p></div>; } },
            { key: 'created_at', label: 'Data', render: (r) => <span className="text-xs text-[#A28776]">{fmtDate((r as unknown as AdminOrder).created_at)}</span> },
            { key: 'total', label: 'Total', render: (r) => <span className="font-bold">{fmtBRL((r as unknown as AdminOrder).total)}</span> },
            { key: 'payment_status', label: 'Pagamento', render: (r) => { const c = payConfig[(r as unknown as AdminOrder).payment_status] ?? { label: r.payment_status, variant: 'neutral' }; return <Badge variant={c.variant}>{c.label}</Badge>; } },
            { key: 'status', label: 'Status', render: (r) => { const c = statusConfig[(r as unknown as AdminOrder).status] ?? { label: r.status, variant: 'neutral' }; return <Badge variant={c.variant}>{c.label}</Badge>; } },
            { key: 'actions', label: '', width: '50px', render: (r) => <button onClick={(e) => { e.stopPropagation(); openDetail(r as unknown as AdminOrder); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F]"><Eye size={15} /></button> },
          ]}
          data={filtered as unknown as Record<string, unknown>[]}
          onRowClick={(r) => openDetail(r as unknown as AdminOrder)}
          emptyMessage="Nenhum pedido encontrado."
        />
      </Card>

      <Modal
        open={!!detailOrder}
        onClose={() => setDetailOrder(null)}
        title={detailOrder ? `Pedido ${detailOrder.order_number}` : ''}
        subtitle={detailOrder ? fmtDate(detailOrder.created_at) : ''}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setDetailOrder(null)}>Fechar</Button>}
      >
        {detailOrder && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAF9F5] rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-2">Cliente</p>
                <p className="text-sm font-semibold text-[#56443F]">{detailOrder.customer_name}</p>
                <p className="text-xs text-[#A28776]">{detailOrder.customer_email}</p>
              </div>
              <div className="bg-[#FAF9F5] rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-2">Pagamento</p>
                <p className="text-sm font-semibold text-[#56443F] capitalize">{detailOrder.payment_method ?? '—'}</p>
                <Badge variant={payConfig[detailOrder.payment_status]?.variant ?? 'neutral'}>{payConfig[detailOrder.payment_status]?.label ?? detailOrder.payment_status}</Badge>
              </div>
            </div>

            {detailOrder.shipping_address && (
              <div className="bg-[#FAF9F5] rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-2">Endereço de Entrega</p>
                <p className="text-sm text-[#56443F]">{detailOrder.shipping_address.street}</p>
                <p className="text-xs text-[#A28776]">{detailOrder.shipping_address.city} - {detailOrder.shipping_address.state} • CEP: {detailOrder.shipping_address.cep}</p>
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-2">Itens do Pedido</p>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white border border-[#E4C7B7]/30 rounded-lg p-3">
                    {item.product_image && <img src={item.product_image} alt={item.product_name} className="w-10 h-10 object-cover rounded-lg" />}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[#56443F]">{item.product_name}</p>
                      <p className="text-xs text-[#A28776]">{item.volume ?? ''} • Qtd: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-bold">{fmtBRL(item.unit_price * item.quantity)}</span>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-[#A28776]">Carregando itens...</p>}
              </div>
            </div>

            <div className="bg-[#FAF9F5] rounded-lg p-4 space-y-1.5">
              <div className="flex justify-between text-xs text-[#A28776]"><span>Subtotal</span><span>{fmtBRL(detailOrder.subtotal)}</span></div>
              <div className="flex justify-between text-xs text-[#A28776]"><span>Frete</span><span>{fmtBRL(detailOrder.shipping_cost)}</span></div>
              {detailOrder.discount > 0 && <div className="flex justify-between text-xs text-emerald-600"><span>Desconto</span><span>-{fmtBRL(detailOrder.discount)}</span></div>}
              <div className="flex justify-between text-sm font-bold text-[#56443F] pt-1.5 border-t border-[#E4C7B7]/20"><span>Total</span><span>{fmtBRL(detailOrder.total)}</span></div>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-2">Atualizar Status</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([value, cfg]) => (
                  <button
                    key={value}
                    onClick={() => updateStatus(detailOrder, value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${detailOrder.status === value ? 'bg-[#56443F] text-white border-[#56443F]' : 'bg-white text-[#56443F] border-[#E4C7B7]/40 hover:bg-[#E4C7B7]/20'}`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
