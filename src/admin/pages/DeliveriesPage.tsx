import React, { useEffect, useState, useCallback } from 'react';
import { Eye } from 'lucide-react';
import { deliveriesService, activityLogService } from '../services';
import type { AdminDelivery } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Input, Select } from '../components/Form';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { SearchInput, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  in_transit: { label: 'Em Trânsito', variant: 'info' },
  out_for_delivery: { label: 'Saiu p/ Entrega', variant: 'default' },
  delivered: { label: 'Entregue', variant: 'success' },
  returned: { label: 'Retornado', variant: 'error' },
  failed: { label: 'Falhou', variant: 'error' },
};

const carriers = ['Correios', 'Jadlog', 'Total Express', 'Loggi', 'Azul Cargo', 'Outro'];

export const DeliveriesPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editDelivery, setEditDelivery] = useState<AdminDelivery | null>(null);
  const [form, setForm] = useState<Partial<AdminDelivery>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setDeliveries(await deliveriesService.list());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (d: AdminDelivery) => {
    setEditDelivery(d);
    setForm({ ...d });
  };

  const save = async () => {
    if (!editDelivery) return;
    const updates = {
      tracking_code: form.tracking_code ?? null,
      carrier: form.carrier ?? null,
      status: form.status ?? 'pending',
      shipping_method: form.shipping_method ?? null,
      estimated_delivery: form.estimated_delivery ?? null,
      shipped_at: form.shipped_at ?? null,
      delivered_at: form.delivered_at ?? null,
      notes: form.notes ?? null,
    };
    await deliveriesService.update(editDelivery.id, updates);
    await activityLogService.log(user, 'Atualizou entrega', 'delivery', editDelivery.id, updates);
    showToast('Entrega atualizada!');
    setEditDelivery(null);
    load();
  };

  const filtered = deliveries.filter((d) => {
    const orderInfo = (d as unknown as { admin_orders?: { order_number: string; customer_name: string } }).admin_orders;
    const matchSearch = !search ||
      (d.tracking_code ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (orderInfo?.order_number ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (orderInfo?.customer_name ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
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
      <PageHeader title="Entregas" subtitle={`${deliveries.length} entregas`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por rastreio, pedido ou cliente..." /></div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Todos os status' },
            { value: 'pending', label: 'Pendente' },
            { value: 'in_transit', label: 'Em Trânsito' },
            { value: 'out_for_delivery', label: 'Saiu p/ Entrega' },
            { value: 'delivered', label: 'Entregue' },
            { value: 'returned', label: 'Retornado' },
            { value: 'failed', label: 'Falhou' },
          ]}
        />
      </div>

      <Card>
        <DataTable
          columns={[
            {
              key: 'order', label: 'Pedido',
              render: (r) => {
                const d = r as unknown as AdminDelivery & { admin_orders?: { order_number: string; customer_name: string } };
                return (
                  <div>
                    <p className="text-sm font-semibold text-[#56443F]">{d.admin_orders?.order_number ?? '—'}</p>
                    <p className="text-xs text-[#A28776]">{d.admin_orders?.customer_name ?? '—'}</p>
                  </div>
                );
              },
            },
            { key: 'tracking_code', label: 'Rastreio', render: (r) => <span className="text-xs font-mono">{(r as unknown as AdminDelivery).tracking_code ?? '—'}</span> },
            { key: 'carrier', label: 'Transportadora', render: (r) => <span className="text-sm">{(r as unknown as AdminDelivery).carrier ?? '—'}</span> },
            { key: 'estimated_delivery', label: 'Previsão', render: (r) => <span className="text-xs text-[#A28776]">{fmtDate((r as unknown as AdminDelivery).estimated_delivery)}</span> },
            {
              key: 'status', label: 'Status',
              render: (r) => {
                const c = statusConfig[(r as unknown as AdminDelivery).status] ?? { label: r.status, variant: 'neutral' };
                return <Badge variant={c.variant}>{c.label}</Badge>;
              },
            },
            { key: 'actions', label: '', width: '50px', render: (r) => <button onClick={(e) => { e.stopPropagation(); openEdit(r as unknown as AdminDelivery); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F]"><Eye size={15} /></button> },
          ]}
          data={filtered as unknown as Record<string, unknown>[]}
          onRowClick={(r) => openEdit(r as unknown as AdminDelivery)}
          emptyMessage="Nenhuma entrega encontrada."
        />
      </Card>

      <Modal
        open={!!editDelivery}
        onClose={() => setEditDelivery(null)}
        title="Gerenciar Entrega"
        subtitle={editDelivery ? `Pedido ${(editDelivery as unknown as { admin_orders?: { order_number: string } }).admin_orders?.order_number ?? ''}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditDelivery(null)}>Cancelar</Button>
            <Button onClick={save}>Salvar Alterações</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Código de Rastreio" value={form.tracking_code ?? ''} onChange={(v) => setForm((p) => ({ ...p, tracking_code: v }))} placeholder="SR000000000BR" />
            <Select
              label="Transportadora"
              value={form.carrier ?? ''}
              onChange={(v) => setForm((p) => ({ ...p, carrier: v }))}
              placeholder="Selecionar..."
              options={carriers.map((c) => ({ value: c, label: c }))}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={form.status ?? 'pending'}
              onChange={(v) => setForm((p) => ({ ...p, status: v as AdminDelivery['status'] }))}
              options={Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))}
            />
            <Select
              label="Método de Envio"
              value={form.shipping_method ?? ''}
              onChange={(v) => setForm((p) => ({ ...p, shipping_method: v }))}
              placeholder="Selecionar..."
              options={[{ value: 'standard', label: 'Padrão' }, { value: 'express', label: 'Expresso' }]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Previsão de Entrega" type="date" value={form.estimated_delivery ?? ''} onChange={(v) => setForm((p) => ({ ...p, estimated_delivery: v }))} />
            <Input label="Enviado em" type="date" value={form.shipped_at?.slice(0, 10) ?? ''} onChange={(v) => setForm((p) => ({ ...p, shipped_at: v }))} />
            <Input label="Entregue em" type="date" value={form.delivered_at?.slice(0, 10) ?? ''} onChange={(v) => setForm((p) => ({ ...p, delivered_at: v }))} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#56443F] mb-1.5">Observações</label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4C7B7]/40 bg-white text-sm text-[#56443F] focus:outline-none focus:border-[#8B645A] focus:ring-2 focus:ring-[#8B645A]/10 transition-all resize-none"
              placeholder="Notas internas sobre a entrega..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
