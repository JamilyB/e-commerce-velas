import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Copy } from 'lucide-react';
import { couponsService, activityLogService } from '../services';
import type { AdminCoupon } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Input, Select, Toggle, Textarea } from '../components/Form';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { SearchInput, ConfirmDialog, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR') : '—';

const emptyForm = {
  code: '', description: '', discount_type: 'percentage' as 'percentage' | 'fixed',
  discount_value: 10, min_order_value: 0, max_uses: 100, is_active: true,
  starts_at: '', expires_at: '',
};

export const CouponsPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCoupon | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setCoupons(await couponsService.list()); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: AdminCoupon) => {
    setEditing(c);
    setForm({
      code: c.code, description: c.description ?? '', discount_type: c.discount_type,
      discount_value: c.discount_value, min_order_value: c.min_order_value,
      max_uses: c.max_uses ?? 100, is_active: c.is_active,
      starts_at: c.starts_at?.slice(0, 10) ?? '', expires_at: c.expires_at?.slice(0, 10) ?? '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.code) { showToast('Informe o código do cupom.'); return; }
    const payload = {
      code: form.code.toUpperCase(),
      description: form.description || null,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_value: Number(form.min_order_value),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
    try {
      if (editing) {
        await couponsService.update(editing.id, payload);
        await activityLogService.log(user, 'Atualizou cupom', 'coupon', editing.id, { code: form.code });
        showToast('Cupom atualizado!');
      } else {
        await couponsService.create(payload);
        await activityLogService.log(user, 'Criou cupom', 'coupon', undefined, { code: form.code });
        showToast('Cupom criado!');
      }
      setModalOpen(false);
      load();
    } catch (e) { showToast('Erro ao salvar cupom.'); console.error(e); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await couponsService.remove(deleteId);
    await activityLogService.log(user, 'Excluiu cupom', 'coupon', deleteId);
    showToast('Cupom excluído.');
    setDeleteId(null);
    load();
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast('Código copiado!');
  };

  const filtered = coupons.filter((c) => !search || c.code.toLowerCase().includes(search.toLowerCase()) || (c.description ?? '').toLowerCase().includes(search.toLowerCase()));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#8B645A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Cupons de Desconto" subtitle={`${coupons.length} cupons`} action={<Button onClick={openCreate}><Plus size={16} /> Novo Cupom</Button>} />

      <div className="mb-4"><SearchInput value={search} onChange={setSearch} placeholder="Buscar cupom..." /></div>

      <Card>
        <DataTable
          columns={[
            {
              key: 'code', label: 'Código',
              render: (r) => {
                const c = r as unknown as AdminCoupon;
                return (
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-md bg-[#E4C7B7]/20 text-xs font-mono font-bold text-[#8B645A]">{c.code}</span>
                    <button onClick={(e) => { e.stopPropagation(); copyCode(c.code); }} className="p-1 hover:bg-[#E4C7B7]/20 rounded text-[#A28776]"><Copy size={12} /></button>
                  </div>
                );
              },
            },
            { key: 'description', label: 'Descrição', render: (r) => <span className="text-xs text-[#A28776]">{(r as unknown as AdminCoupon).description ?? '—'}</span> },
            {
              key: 'discount_value', label: 'Desconto',
              render: (r) => {
                const c = r as unknown as AdminCoupon;
                return <span className="font-bold text-[#56443F]">{c.discount_type === 'percentage' ? `${c.discount_value}%` : fmtBRL(c.discount_value)}</span>;
              },
            },
            { key: 'used_count', label: 'Usos', render: (r) => { const c = r as unknown as AdminCoupon; return <span className="text-xs">{c.used_count}/{c.max_uses ?? '∞'}</span>; } },
            { key: 'expires_at', label: 'Validade', render: (r) => <span className="text-xs text-[#A28776]">{fmtDate((r as unknown as AdminCoupon).expires_at)}</span> },
            { key: 'is_active', label: 'Status', render: (r) => <Badge variant={(r as unknown as AdminCoupon).is_active ? 'success' : 'neutral'}>{(r as unknown as AdminCoupon).is_active ? 'Ativo' : 'Inativo'}</Badge> },
            {
              key: 'actions', label: 'Ações', width: '80px',
              render: (r) => {
                const c = r as unknown as AdminCoupon;
                return (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F]"><Pencil size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeleteId(c.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
                  </div>
                );
              },
            },
          ]}
          data={filtered as unknown as Record<string, unknown>[]}
          onRowClick={(r) => openEdit(r as unknown as AdminCoupon)}
          emptyMessage="Nenhum cupom encontrado."
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Cupom' : 'Novo Cupom'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Código" required value={form.code} onChange={(v) => setForm((p) => ({ ...p, code: v.toUpperCase() }))} placeholder="SURU10" />
          <Textarea label="Descrição" value={form.description} onChange={(v) => setForm((p) => ({ ...p, description: v }))} rows={2} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipo de Desconto"
              value={form.discount_type}
              onChange={(v) => setForm((p) => ({ ...p, discount_type: v as 'percentage' | 'fixed' }))}
              options={[{ value: 'percentage', label: 'Percentual (%)' }, { value: 'fixed', label: 'Valor Fixo (R$)' }]}
            />
            <Input label="Valor do Desconto" type="number" step="0.01" value={form.discount_value} onChange={(v) => setForm((p) => ({ ...p, discount_value: Number(v) }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Valor Mínimo do Pedido" type="number" step="0.01" value={form.min_order_value} onChange={(v) => setForm((p) => ({ ...p, min_order_value: Number(v) }))} />
            <Input label="Limite de Usos" type="number" value={form.max_uses} onChange={(v) => setForm((p) => ({ ...p, max_uses: Number(v) }))} placeholder="0 = ilimitado" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Início" type="date" value={form.starts_at} onChange={(v) => setForm((p) => ({ ...p, starts_at: v }))} />
            <Input label="Validade" type="date" value={form.expires_at} onChange={(v) => setForm((p) => ({ ...p, expires_at: v }))} />
          </div>
          <div className="pt-2 border-t border-[#E4C7B7]/20"><Toggle label="Cupom ativo" checked={form.is_active} onChange={(v) => setForm((p) => ({ ...p, is_active: v }))} /></div>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Excluir Cupom" message="Tem certeza?" onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} confirmLabel="Excluir" danger />
    </div>
  );
};
