import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, FolderTree } from 'lucide-react';
import { categoriesService, productsService, activityLogService } from '../services';
import type { AdminCategory, AdminProduct } from '../types';
import { Card, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Input, Textarea, Toggle } from '../components/Form';
import { Modal } from '../components/Modal';
import { ConfirmDialog, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const slugify = (s: string) => s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

const emptyForm = { name: '', slug: '', description: '', image: '', is_active: true, sort_order: 0 };

export const CategoriesPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([categoriesService.list(), productsService.list()]);
      setCategories(cats);
      setProducts(prods);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const productCount = (catId: string) => products.filter((p) => p.category_id === catId).length;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true); };
  const openEdit = (c: AdminCategory) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', image: c.image ?? '', is_active: c.is_active, sort_order: c.sort_order });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name) { showToast('Informe o nome.'); return; }
    const slug = form.slug || slugify(form.name);
    const payload = { ...form, slug };
    try {
      if (editing) {
        await categoriesService.update(editing.id, payload);
        await activityLogService.log(user, 'Atualizou categoria', 'category', editing.id, { name: form.name });
        showToast('Categoria atualizada!');
      } else {
        await categoriesService.create(payload);
        await activityLogService.log(user, 'Criou categoria', 'category', undefined, { name: form.name });
        showToast('Categoria criada!');
      }
      setModalOpen(false);
      load();
    } catch (e) { showToast('Erro ao salvar.'); console.error(e); }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await categoriesService.remove(deleteId);
    await activityLogService.log(user, 'Excluiu categoria', 'category', deleteId);
    showToast('Categoria excluída.');
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
      <PageHeader
        title="Categorias"
        subtitle={`${categories.length} categorias`}
        action={<Button onClick={openCreate}><Plus size={16} /> Nova Categoria</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Card key={cat.id}>
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E4C7B7]/30 flex items-center justify-center">
                    <FolderTree size={18} className="text-[#8B645A]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#56443F]">{cat.name}</p>
                    <p className="text-xs text-[#A28776]">/{cat.slug}</p>
                  </div>
                </div>
                <Badge variant={cat.is_active ? 'success' : 'neutral'}>{cat.is_active ? 'Ativa' : 'Inativa'}</Badge>
              </div>
              {cat.description && <p className="text-xs text-[#A28776] mb-3 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center justify-between pt-3 border-t border-[#E4C7B7]/20">
                <span className="text-xs text-[#A28776]">{productCount(cat.id)} produtos</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {categories.length === 0 && (
          <Card className="col-span-full"><CardBody><p className="text-center text-sm text-[#A28776] py-8">Nenhuma categoria cadastrada.</p></CardBody></Card>
        )}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Categoria' : 'Nova Categoria'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nome" required value={form.name} onChange={(v) => setForm((prev) => ({ ...prev, name: v, slug: prev.slug || slugify(v) }))} placeholder="Nome da categoria" />
          <Input label="Slug (URL)" value={form.slug} onChange={(v) => setForm((prev) => ({ ...prev, slug: v }))} placeholder="colecao-relaxar" />
          <Textarea label="Descrição" value={form.description} onChange={(v) => setForm((prev) => ({ ...prev, description: v }))} rows={2} />
          <Input label="URL da Imagem" value={form.image} onChange={(v) => setForm((prev) => ({ ...prev, image: v }))} placeholder="https://..." />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ordem" type="number" value={form.sort_order} onChange={(v) => setForm((prev) => ({ ...prev, sort_order: Number(v) }))} />
            <div className="flex items-end pb-2"><Toggle label="Ativa" checked={form.is_active} onChange={(v) => setForm((prev) => ({ ...prev, is_active: v }))} /></div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Categoria"
        message="Tem certeza? Os produtos vinculados ficarão sem categoria."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Excluir"
        danger
      />
    </div>
  );
};
