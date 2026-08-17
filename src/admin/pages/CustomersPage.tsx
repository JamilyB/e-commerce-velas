import React, { useEffect, useState, useCallback } from 'react';
import { Eye, Ban, CheckCircle, Trash2, ShoppingBag } from 'lucide-react';
import { customersService, ordersService, activityLogService } from '../services';
import type { AdminCustomer, AdminOrder } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Input, Textarea } from '../components/Form';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { SearchInput, ConfirmDialog, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' }> = {
  active: { label: 'Ativo', variant: 'success' },
  blocked: { label: 'Bloqueado', variant: 'error' },
  inactive: { label: 'Inativo', variant: 'neutral' },
};

export const CustomersPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editCustomer, setEditCustomer] = useState<AdminCustomer | null>(null);
  const [form, setForm] = useState<Partial<AdminCustomer>>({});
  const [customerOrders, setCustomerOrders] = useState<AdminOrder[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCustomers(await customersService.list()); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openEdit = async (c: AdminCustomer) => {
    setEditCustomer(c);
    setForm({ ...c });
    try {
      const allOrders = await ordersService.list();
      setCustomerOrders(allOrders.filter((o) => o.customer_email === c.email));
    } catch { setCustomerOrders([]); }
  };

  const save = async () => {
    if (!editCustomer) return;
    await customersService.update(editCustomer.id, {
      full_name: form.full_name,
      phone: form.phone,
      cpf: form.cpf,
      notes: form.notes,
    });
    await activityLogService.log(user, 'Atualizou cliente', 'customer', editCustomer.id, { name: form.full_name });
    showToast('Cliente atualizado!');
    setEditCustomer(null);
    load();
  };

  const setStatus = async (c: AdminCustomer, status: 'active' | 'blocked' | 'inactive') => {
    await customersService.setStatus(c.id, status);
    await activityLogService.log(user, `${status === 'blocked' ? 'Bloqueou' : status === 'active' ? 'Ativou' : 'Desativou'} cliente`, 'customer', c.id, { name: c.full_name });
    showToast(`Cliente ${status === 'blocked' ? 'bloqueado' : status === 'active' ? 'ativado' : 'desativado'}.`);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await customersService.remove(deleteId);
    await activityLogService.log(user, 'Excluiu cliente', 'customer', deleteId);
    showToast('Cliente excluído.');
    setDeleteId(null);
    load();
  };

  const filtered = customers.filter((c) => {
    const matchSearch = !search ||
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      (c.cpf ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
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
      <PageHeader title="Clientes" subtitle={`${customers.length} clientes cadastrados`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome, email ou CPF..." /></div>
        <div className="flex gap-2">
          {[
            { v: 'all', l: 'Todos' },
            { v: 'active', l: 'Ativos' },
            { v: 'blocked', l: 'Bloqueados' },
            { v: 'inactive', l: 'Inativos' },
          ].map((opt) => (
            <button key={opt.v} onClick={() => setStatusFilter(opt.v)} className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${statusFilter === opt.v ? 'bg-[#56443F] text-white border-[#56443F]' : 'bg-white text-[#56443F] border-[#E4C7B7]/40 hover:bg-[#E4C7B7]/20'}`}>{opt.l}</button>
          ))}
        </div>
      </div>

      <Card>
        <DataTable
          columns={[
            {
              key: 'full_name', label: 'Cliente',
              render: (r) => {
                const c = r as unknown as AdminCustomer;
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#E4C7B7]/30 flex items-center justify-center text-xs font-bold text-[#8B645A]">{c.avatar_initials ?? c.full_name.slice(0, 2).toUpperCase()}</div>
                    <div><p className="text-sm font-semibold text-[#56443F]">{c.full_name}</p><p className="text-xs text-[#A28776]">{c.email}</p></div>
                  </div>
                );
              },
            },
            { key: 'total_orders', label: 'Pedidos', render: (r) => <span className="text-sm font-semibold">{(r as unknown as AdminCustomer).total_orders}</span> },
            { key: 'total_spent', label: 'Total Gasto', render: (r) => <span className="font-bold">{fmtBRL((r as unknown as AdminCustomer).total_spent)}</span> },
            { key: 'created_at', label: 'Cadastro', render: (r) => <span className="text-xs text-[#A28776]">{fmtDate((r as unknown as AdminCustomer).created_at)}</span> },
            { key: 'status', label: 'Status', render: (r) => { const c = statusConfig[(r as unknown as AdminCustomer).status] ?? { label: r.status, variant: 'neutral' }; return <Badge variant={c.variant}>{c.label}</Badge>; } },
            {
              key: 'actions', label: 'Ações', width: '100px',
              render: (r) => {
                const c = r as unknown as AdminCustomer;
                return (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F]" title="Ver / Editar"><Eye size={14} /></button>
                    {c.status === 'active' ? (
                      <button onClick={(e) => { e.stopPropagation(); setStatus(c, 'blocked'); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500" title="Bloquear"><Ban size={14} /></button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); setStatus(c, 'active'); }} className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600" title="Ativar"><CheckCircle size={14} /></button>
                    )}
                  </div>
                );
              },
            },
          ]}
          data={filtered as unknown as Record<string, unknown>[]}
          onRowClick={(r) => openEdit(r as unknown as AdminCustomer)}
          emptyMessage="Nenhum cliente encontrado."
        />
      </Card>

      <Modal
        open={!!editCustomer}
        onClose={() => setEditCustomer(null)}
        title="Detalhes do Cliente"
        subtitle={editCustomer?.email}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditCustomer(null)}>Fechar</Button>
            <Button onClick={save}>Salvar Alterações</Button>
          </>
        }
      >
        {editCustomer && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-[#E4C7B7]/30 flex items-center justify-center text-lg font-bold text-[#8B645A]">{editCustomer.avatar_initials ?? editCustomer.full_name.slice(0, 2).toUpperCase()}</div>
              <div>
                <p className="text-base font-bold text-[#56443F]">{editCustomer.full_name}</p>
                <Badge variant={statusConfig[editCustomer.status]?.variant ?? 'neutral'}>{statusConfig[editCustomer.status]?.label ?? editCustomer.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FAF9F5] rounded-lg p-4"><div className="flex items-center gap-2 text-[#A28776] mb-1"><ShoppingBag size={14} /><span className="text-[10px] font-bold uppercase tracking-wider">Pedidos</span></div><p className="text-lg font-bold text-[#56443F]">{editCustomer.total_orders}</p></div>
              <div className="bg-[#FAF9F5] rounded-lg p-4"><div className="flex items-center gap-2 text-[#A28776] mb-1"><span className="text-[10px] font-bold uppercase tracking-wider">Total Gasto</span></div><p className="text-lg font-bold text-[#56443F]">{fmtBRL(editCustomer.total_spent)}</p></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Nome" value={form.full_name ?? ''} onChange={(v) => setForm((p) => ({ ...p, full_name: v }))} />
              <Input label="Email" value={form.email ?? ''} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
              <Input label="Telefone" value={form.phone ?? ''} onChange={(v) => setForm((p) => ({ ...p, phone: v }))} />
              <Input label="CPF" value={form.cpf ?? ''} onChange={(v) => setForm((p) => ({ ...p, cpf: v }))} />
            </div>

            <Textarea label="Notas Internas" value={form.notes ?? ''} onChange={(v) => setForm((p) => ({ ...p, notes: v }))} rows={2} placeholder="Observações sobre o cliente..." />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#A28776] mb-2">Pedidos do Cliente</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {customerOrders.map((o) => (
                  <div key={o.id} className="flex items-center justify-between bg-white border border-[#E4C7B7]/30 rounded-lg p-3">
                    <div><p className="text-sm font-semibold text-[#56443F]">{o.order_number}</p><p className="text-xs text-[#A28776]">{fmtDate(o.created_at)}</p></div>
                    <div className="text-right"><p className="text-sm font-bold">{fmtBRL(o.total)}</p><Badge variant={o.status === 'delivered' ? 'success' : 'warning'}>{o.status}</Badge></div>
                  </div>
                ))}
                {customerOrders.length === 0 && <p className="text-xs text-[#A28776]">Nenhum pedido.</p>}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-[#E4C7B7]/20">
              {editCustomer.status === 'active' ? (
                <Button variant="danger" onClick={() => { setStatus(editCustomer, 'blocked'); setEditCustomer(null); }}><Ban size={14} /> Bloquear Cliente</Button>
              ) : (
                <Button onClick={() => { setStatus(editCustomer, 'active'); setEditCustomer(null); }}><CheckCircle size={14} /> Ativar Cliente</Button>
              )}
              <Button variant="ghost" onClick={() => { setDeleteId(editCustomer.id); setEditCustomer(null); }} className="text-red-500"><Trash2 size={14} /> Excluir</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Excluir Cliente" message="Tem certeza? Esta ação não pode ser desfeita." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} confirmLabel="Excluir" danger />
    </div>
  );
};
