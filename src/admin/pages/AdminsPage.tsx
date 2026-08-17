import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Shield, Power } from 'lucide-react';
import { adminsService, activityLogService } from '../services';
import type { AdminUser, AdminPermission, AdminRole } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Input, Select, Toggle } from '../components/Form';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { ConfirmDialog, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Nunca';

const roleConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' }> = {
  owner: { label: 'Proprietário', variant: 'error' },
  admin: { label: 'Administrador', variant: 'default' },
  manager: { label: 'Gerente', variant: 'info' },
  staff: { label: 'Equipe', variant: 'neutral' },
};

const allPermissions: { key: AdminPermission; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'products', label: 'Produtos' },
  { key: 'categories', label: 'Categorias' },
  { key: 'inventory', label: 'Estoque' },
  { key: 'orders', label: 'Pedidos' },
  { key: 'deliveries', label: 'Entregas' },
  { key: 'returns', label: 'Devoluções' },
  { key: 'coupons', label: 'Cupons' },
  { key: 'reviews', label: 'Avaliações' },
  { key: 'customers', label: 'Clientes' },
  { key: 'admins', label: 'Administradores' },
  { key: 'settings', label: 'Configurações' },
];

const rolePermissions: Record<AdminRole, AdminPermission[]> = {
  owner: allPermissions.map((p) => p.key),
  admin: allPermissions.map((p) => p.key),
  manager: ['dashboard', 'products', 'categories', 'inventory', 'orders', 'deliveries', 'returns', 'coupons', 'reviews', 'customers'],
  staff: ['dashboard', 'products', 'orders', 'customers'],
};

const emptyForm = { full_name: '', email: '', password: '', role: 'staff' as AdminRole, is_active: true, avatar_initials: '', permissions: [] as AdminPermission[] };

export const AdminsPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setAdmins(await adminsService.list()); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (a: AdminUser) => {
    setEditing(a);
    setForm({ full_name: a.full_name, email: a.email, password: '', role: a.role, is_active: a.is_active, avatar_initials: a.avatar_initials, permissions: a.permissions });
    setModalOpen(true);
  };

  const togglePermission = (perm: AdminPermission) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  const onRoleChange = (role: AdminRole) => {
    setForm((prev) => ({ ...prev, role, permissions: rolePermissions[role] }));
  };

  const save = async () => {
    if (!form.full_name || !form.email) { showToast('Preencha nome e email.'); return; }
    if (!editing && !form.password) { showToast('Defina uma senha.'); return; }
    try {
      const payload: Partial<AdminUser> = {
        full_name: form.full_name,
        email: form.email,
        role: form.role,
        is_active: form.is_active,
        avatar_initials: form.avatar_initials || form.full_name.slice(0, 2).toUpperCase(),
        permissions: form.role === 'owner' ? allPermissions.map((p) => p.key) : form.permissions,
      };
      if (form.password) payload.password = form.password;
      if (editing) {
        if (editing.role === 'owner' && user?.role !== 'owner') { showToast('Apenas proprietários podem editar outros proprietários.'); return; }
        await adminsService.update(editing.id, payload);
        await activityLogService.log(user, 'Atualizou administrador', 'admin', editing.id, { name: form.full_name });
        showToast('Administrador atualizado!');
      } else {
        const created = await adminsService.create(payload);
        await activityLogService.log(user, 'Criou administrador', 'admin', created.id, { name: form.full_name });
        showToast('Administrador criado!');
      }
      setModalOpen(false);
      load();
    } catch (e) { showToast('Erro ao salvar.'); console.error(e); }
  };

  const toggleActive = async (a: AdminUser) => {
    if (a.role === 'owner') { showToast('Proprietários não podem ser desativados.'); return; }
    await adminsService.update(a.id, { is_active: !a.is_active });
    await activityLogService.log(user, `${a.is_active ? 'Desativou' : 'Ativou'} administrador`, 'admin', a.id, { name: a.full_name });
    showToast(`Administrador ${a.is_active ? 'desativado' : 'ativado'}.`);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const target = admins.find((a) => a.id === deleteId);
    if (target?.role === 'owner') { showToast('Proprietários não podem ser excluídos.'); setDeleteId(null); return; }
    await adminsService.remove(deleteId);
    await activityLogService.log(user, 'Excluiu administrador', 'admin', deleteId);
    showToast('Administrador excluído.');
    setDeleteId(null);
    load();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#8B645A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Administradores" subtitle={`${admins.length} usuários administrativos`} action={user?.role === 'owner' || user?.role === 'admin' ? <Button onClick={openCreate}><Plus size={16} /> Novo Admin</Button> : undefined} />

      <Card>
        <DataTable
          columns={[
            {
              key: 'full_name', label: 'Nome',
              render: (r) => {
                const a = r as unknown as AdminUser;
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#8B645A] flex items-center justify-center text-xs font-bold text-white">{a.avatar_initials ?? a.full_name.slice(0, 2).toUpperCase()}</div>
                    <div><p className="text-sm font-semibold text-[#56443F]">{a.full_name}</p><p className="text-xs text-[#A28776]">{a.email}</p></div>
                  </div>
                );
              },
            },
            { key: 'role', label: 'Nível', render: (r) => { const c = roleConfig[(r as unknown as AdminUser).role] ?? { label: r.role, variant: 'neutral' }; return <Badge variant={c.variant}>{c.label}</Badge>; } },
            { key: 'last_login_at', label: 'Último Acesso', render: (r) => <span className="text-xs text-[#A28776]">{fmtDate((r as unknown as AdminUser).last_login_at)}</span> },
            { key: 'is_active', label: 'Status', render: (r) => <Badge variant={(r as unknown as AdminUser).is_active ? 'success' : 'neutral'}>{(r as unknown as AdminUser).is_active ? 'Ativo' : 'Inativo'}</Badge> },
            {
              key: 'actions', label: 'Ações', width: '100px',
              render: (r) => {
                const a = r as unknown as AdminUser;
                return (
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); openEdit(a); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F]"><Pencil size={14} /></button>
                    {a.role !== 'owner' && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); toggleActive(a); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F]"><Power size={14} /></button>
                        <button onClick={(e) => { e.stopPropagation(); setDeleteId(a.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500"><Trash2 size={14} /></button>
                      </>
                    )}
                  </div>
                );
              },
            },
          ]}
          data={admins as unknown as Record<string, unknown>[]}
          onRowClick={(r) => openEdit(r as unknown as AdminUser)}
          emptyMessage="Nenhum administrador."
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Administrador' : 'Novo Administrador'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome" required value={form.full_name} onChange={(v) => setForm((p) => ({ ...p, full_name: v }))} />
            <Input label="Email" type="email" required value={form.email} onChange={(v) => setForm((p) => ({ ...p, email: v }))} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label={editing ? 'Nova Senha (deixe vazio para manter)' : 'Senha'} type="password" value={form.password} onChange={(v) => setForm((p) => ({ ...p, password: v }))} required={!editing} />
            <Select
              label="Nível de Acesso"
              value={form.role}
              onChange={(v) => onRoleChange(v as AdminRole)}
              options={[
                { value: 'owner', label: 'Proprietário (acesso total)' },
                { value: 'admin', label: 'Administrador (acesso total)' },
                { value: 'manager', label: 'Gerente (catálogo + vendas)' },
                { value: 'staff', label: 'Equipe (básico)' },
              ]}
            />
          </div>

          <div>
            <p className="text-xs font-semibold text-[#56443F] mb-2 flex items-center gap-1.5"><Shield size={13} /> Permissões ({form.permissions.length}/{allPermissions.length})</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#FAF9F5] rounded-lg p-4">
              {allPermissions.map((perm) => {
                const checked = form.role === 'owner' || form.permissions.includes(perm.key);
                return (
                  <label key={perm.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={form.role === 'owner'}
                      onChange={() => togglePermission(perm.key)}
                      className="w-4 h-4 rounded border-[#E4C7B7] text-[#8B645A] focus:ring-[#8B645A]"
                    />
                    <span className="text-xs font-semibold text-[#56443F]">{perm.label}</span>
                  </label>
                );
              })}
            </div>
            {form.role === 'owner' && <p className="text-xs text-[#A28776] mt-1">Proprietários têm acesso total automaticamente.</p>}
          </div>

          {editing && (
            <div className="pt-2 border-t border-[#E4C7B7]/20"><Toggle label="Conta ativa" checked={form.is_active} onChange={(v) => setForm((p) => ({ ...p, is_active: v }))} /></div>
          )}
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Excluir Administrador" message="Tem certeza? O usuário perderá acesso ao painel." onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} confirmLabel="Excluir" danger />
    </div>
  );
};
