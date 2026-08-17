import React, { useEffect, useState, useCallback } from 'react';
import { Eye, Check, X } from 'lucide-react';
import { returnsService, activityLogService } from '../services';
import type { AdminReturn } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Textarea, Select } from '../components/Form';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { SearchInput, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' }> = {
  requested: { label: 'Solicitada', variant: 'warning' },
  approved: { label: 'Aprovada', variant: 'info' },
  rejected: { label: 'Rejeitada', variant: 'error' },
  processing: { label: 'Processando', variant: 'default' },
  completed: { label: 'Concluída', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
};

export const ReturnsPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [returns, setReturns] = useState<AdminReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editReturn, setEditReturn] = useState<AdminReturn | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setReturns(await returnsService.list());
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = (r: AdminReturn) => {
    setEditReturn(r);
    setAdminNotes(r.admin_notes ?? '');
    setNewStatus(r.status);
  };

  const save = async () => {
    if (!editReturn) return;
    await returnsService.update(editReturn.id, { status: newStatus as AdminReturn['status'], admin_notes: adminNotes });
    await activityLogService.log(user, `Atualizou devolução ${editReturn.return_code}`, 'return', editReturn.id, { status: newStatus });
    showToast('Devolução atualizada!');
    setEditReturn(null);
    load();
  };

  const quickAction = async (r: AdminReturn, status: string) => {
    await returnsService.update(r.id, { status: status as AdminReturn['status'] });
    await activityLogService.log(user, `${status === 'approved' ? 'Aprovou' : 'Rejeitou'} devolução ${r.return_code}`, 'return', r.id);
    showToast(`Devolução ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`);
    load();
  };

  const filtered = returns.filter((r) => {
    const matchSearch = !search ||
      r.return_code.toLowerCase().includes(search.toLowerCase()) ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.order_number ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || r.status === statusFilter;
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
      <PageHeader title="Devoluções e Reembolsos" subtitle={`${returns.length} solicitações`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por código, cliente ou pedido..." /></div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Todos os status' },
            ...Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label })),
          ]}
        />
      </div>

      <Card>
        <DataTable
          columns={[
            { key: 'return_code', label: 'Código', render: (r) => <span className="text-sm font-mono font-semibold text-[#56443F]">{(r as unknown as AdminReturn).return_code}</span> },
            { key: 'customer_name', label: 'Cliente', render: (r) => { const ret = r as unknown as AdminReturn; return <div><p className="text-sm font-semibold">{ret.customer_name}</p><p className="text-xs text-[#A28776]">{ret.customer_email}</p></div>; } },
            { key: 'order_number', label: 'Pedido', render: (r) => <span className="text-xs text-[#A28776]">{(r as unknown as AdminReturn).order_number ?? '—'}</span> },
            { key: 'refund_amount', label: 'Reembolso', render: (r) => <span className="font-bold">{fmtBRL((r as unknown as AdminReturn).refund_amount)}</span> },
            { key: 'refund_method', label: 'Método', render: (r) => <span className="text-xs capitalize">{(r as unknown as AdminReturn).refund_method ?? '—'}</span> },
            { key: 'status', label: 'Status', render: (r) => { const c = statusConfig[(r as unknown as AdminReturn).status] ?? { label: r.status, variant: 'neutral' }; return <Badge variant={c.variant}>{c.label}</Badge>; } },
            {
              key: 'actions', label: 'Ações', width: '100px',
              render: (r) => {
                const ret = r as unknown as AdminReturn;
                return (
                  <div className="flex items-center gap-1">
                    {ret.status === 'requested' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); quickAction(ret, 'approved'); }} className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors" title="Aprovar"><Check size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); quickAction(ret, 'rejected'); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Rejeitar"><X size={14} /></button>
                      </>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); openEdit(ret); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F] transition-colors"><Eye size={15} /></button>
                  </div>
                );
              },
            },
          ]}
          data={filtered as unknown as Record<string, unknown>[]}
          onRowClick={(r) => openEdit(r as unknown as AdminReturn)}
          emptyMessage="Nenhuma devolução encontrada."
        />
      </Card>

      <Modal
        open={!!editReturn}
        onClose={() => setEditReturn(null)}
        title={editReturn ? `Devolução ${editReturn.return_code}` : ''}
        subtitle={editReturn ? `Pedido ${editReturn.order_number ?? '—'} • ${fmtDate(editReturn.created_at)}` : ''}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditReturn(null)}>Cancelar</Button>
            <Button onClick={save}>Salvar Alterações</Button>
          </>
        }
      >
        {editReturn && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAF9F5] rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-1">Cliente</p>
                <p className="text-sm font-semibold text-[#56443F]">{editReturn.customer_name}</p>
                <p className="text-xs text-[#A28776]">{editReturn.customer_email}</p>
              </div>
              <div className="bg-[#FAF9F5] rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-1">Reembolso</p>
                <p className="text-lg font-bold text-[#56443F]">{fmtBRL(editReturn.refund_amount)}</p>
                <p className="text-xs text-[#A28776] capitalize">{editReturn.refund_method ?? '—'}</p>
              </div>
            </div>

            {editReturn.reason && (
              <div className="bg-[#FAF9F5] rounded-lg p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-1">Motivo</p>
                <p className="text-sm text-[#56443F]">{editReturn.reason}</p>
              </div>
            )}

            {editReturn.items && editReturn.items.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-2">Itens Devolvidos</p>
                <div className="space-y-2">
                  {editReturn.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white border border-[#E4C7B7]/30 rounded-lg p-3">
                      <div>
                        <p className="text-sm font-semibold text-[#56443F]">{item.productName}</p>
                        <p className="text-xs text-[#A28776]">Qtd: {item.quantity} • {item.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Select
              label="Status da Devolução"
              value={newStatus}
              onChange={setNewStatus}
              options={Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label }))}
            />

            <Textarea label="Notas Internas" value={adminNotes} onChange={setAdminNotes} rows={3} placeholder="Observações sobre o processamento da devolução..." />
          </div>
        )}
      </Modal>
    </div>
  );
};
