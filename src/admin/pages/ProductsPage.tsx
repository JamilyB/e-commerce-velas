import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, Power, Star } from 'lucide-react';
import { productsService, categoriesService, activityLogService } from '../services';
import type { AdminProduct, AdminCategory } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Input, Textarea, Select, Toggle } from '../components/Form';
import { Modal } from '../components/Modal';
import { DataTable } from '../components/DataTable';
import { SearchInput, ConfirmDialog, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const emptyForm: Partial<AdminProduct> = {
  name: '', subtitle: '', price: 0, compare_at_price: null, image: '', collection: '',
  aroma: '', familia_olfativa: '', size: '', weight: '', dimensions: '', burn_time: '',
  color: '', recipiente: '', cera: '', description: '', details: '',
  notes_top: '', notes_heart: '', notes_base: '', sku: '', stock: 0,
  low_stock_threshold: 5, is_active: true, is_featured: false, category_id: null,
};

export const ProductsPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<Partial<AdminProduct>>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([productsService.list(), categoriesService.list()]);
      setProducts(prods);
      setCategories(cats);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) => {
    const matchSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && p.is_active) ||
      (statusFilter === 'inactive' && !p.is_active) ||
      (statusFilter === 'featured' && p.is_featured);
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (p: AdminProduct) => {
    setEditing(p);
    setForm({ ...p });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name || !form.price) {
      showToast('Preencha nome e preço.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        compare_at_price: form.compare_at_price ? Number(form.compare_at_price) : null,
        stock: Number(form.stock),
        low_stock_threshold: Number(form.low_stock_threshold),
        category_id: form.category_id || null,
      };
      if (editing) {
        await productsService.update(editing.id, payload);
        await activityLogService.log(user, 'Atualizou produto', 'product', editing.id, { name: form.name });
        showToast('Produto atualizado!');
      } else {
        const created = await productsService.create(payload);
        await activityLogService.log(user, 'Criou produto', 'product', created.id, { name: form.name });
        showToast('Produto criado!');
      }
      setModalOpen(false);
      load();
    } catch (e) {
      showToast('Erro ao salvar produto.');
      console.error(e);
    }
    setSaving(false);
  };

  const toggleActive = async (p: AdminProduct) => {
    await productsService.toggleActive(p.id, !p.is_active);
    await activityLogService.log(user, `${p.is_active ? 'Desativou' : 'Ativou'} produto`, 'product', p.id, { name: p.name });
    showToast(`Produto ${p.is_active ? 'desativado' : 'ativado'}.`);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await productsService.remove(deleteId);
    await activityLogService.log(user, 'Excluiu produto', 'product', deleteId);
    showToast('Produto excluído.');
    setDeleteId(null);
    load();
  };

  const setField = (field: string, value: unknown) => setForm((prev) => ({ ...prev, [field]: value }));

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} produtos no catálogo`}
        action={<Button onClick={openCreate}><Plus size={16} /> Novo Produto</Button>}
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome ou SKU..." /></div>
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'all', label: 'Todos' },
            { value: 'active', label: 'Ativos' },
            { value: 'inactive', label: 'Inativos' },
            { value: 'featured', label: 'Destaque' },
          ]}
        />
      </div>

      <Card>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-[#8B645A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <DataTable
            columns={[
              {
                key: 'name', label: 'Produto',
                render: (row) => {
                  const p = row as unknown as AdminProduct;
                  return (
                    <div className="flex items-center gap-3">
                      {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-[#E4C7B7]/20" />}
                      <div>
                        <p className="font-semibold text-[#56443F]">{p.name}</p>
                        <p className="text-xs text-[#A28776]">{p.sku ?? '—'}</p>
                      </div>
                    </div>
                  );
                },
              },
              {
                key: 'price', label: 'Preço',
                render: (row) => {
                  const p = row as unknown as AdminProduct;
                  return <span className="font-semibold">{fmtBRL(p.price)}</span>;
                },
              },
              {
                key: 'stock', label: 'Estoque',
                render: (row) => {
                  const p = row as unknown as AdminProduct;
                  return (
                    <span className={`font-semibold ${p.stock <= p.low_stock_threshold ? 'text-red-600' : 'text-[#56443F]'}`}>
                      {p.stock}
                    </span>
                  );
                },
              },
              {
                key: 'rating', label: 'Avaliação',
                render: (row) => {
                  const p = row as unknown as AdminProduct;
                  return (
                    <span className="flex items-center gap-1 text-xs">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {p.rating.toFixed(1)} ({p.reviews_count})
                    </span>
                  );
                },
              },
              {
                key: 'is_active', label: 'Status',
                render: (row) => {
                  const p = row as unknown as AdminProduct;
                  return <Badge variant={p.is_active ? 'success' : 'neutral'}>{p.is_active ? 'Ativo' : 'Inativo'}</Badge>;
                },
              },
              {
                key: 'actions', label: 'Ações', width: '120px',
                render: (row) => {
                  const p = row as unknown as AdminProduct;
                  return (
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(p); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F] transition-colors" title="Editar">
                        <Pencil size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleActive(p); }} className="p-1.5 hover:bg-[#E4C7B7]/20 rounded-lg text-[#56443F] transition-colors" title={p.is_active ? 'Desativar' : 'Ativar'}>
                        <Power size={14} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors" title="Excluir">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                },
              },
            ]}
            data={filtered as unknown as Record<string, unknown>[]}
            onRowClick={(row) => openEdit(row as unknown as AdminProduct)}
            emptyMessage="Nenhum produto encontrado."
          />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Produto' : 'Novo Produto'}
        subtitle="Preencha as informações do produto"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar Produto'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nome" required value={form.name ?? ''} onChange={(v) => setField('name', v)} placeholder="Nome do produto" />
            <Input label="Subtítulo" value={form.subtitle ?? ''} onChange={(v) => setField('subtitle', v)} placeholder="Subtítulo descritivo" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input label="Preço (R$)" type="number" step="0.01" required value={form.price ?? 0} onChange={(v) => setField('price', v)} />
            <Input label="Preço Promocional" type="number" step="0.01" value={form.compare_at_price ?? ''} onChange={(v) => setField('compare_at_price', v)} />
            <Input label="Estoque" type="number" value={form.stock ?? 0} onChange={(v) => setField('stock', v)} />
            <Input label="Alerta de Estoque Baixo" type="number" value={form.low_stock_threshold ?? 5} onChange={(v) => setField('low_stock_threshold', v)} />
          </div>

          <Input label="URL da Imagem" value={form.image ?? ''} onChange={(v) => setField('image', v)} placeholder="https://..." />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Coleção"
              value={form.collection ?? ''}
              onChange={(v) => setField('collection', v)}
              placeholder="Selecionar..."
              options={[
                { value: 'relaxar', label: 'Relaxar' },
                { value: 'cafe', label: 'Café' },
                { value: 'natureza', label: 'Natureza' },
                { value: 'floral', label: 'Floral' },
                { value: 'gourmet', label: 'Gourmet' },
                { value: 'luxo', label: 'Luxo' },
              ]}
            />
            <Select
              label="Categoria"
              value={form.category_id ?? ''}
              onChange={(v) => setField('category_id', v)}
              placeholder="Selecionar..."
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <Input label="SKU" value={form.sku ?? ''} onChange={(v) => setField('sku', v)} placeholder="SUR-XXX-001" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input label="Aroma" value={form.aroma ?? ''} onChange={(v) => setField('aroma', v)} />
            <Select
              label="Família Olfativa"
              value={form.familia_olfativa ?? ''}
              onChange={(v) => setField('familia_olfativa', v)}
              placeholder="Selecionar..."
              options={['Doce', 'Floral', 'Herbal', 'Cítrico', 'Amadeirado', 'Cafés'].map((f) => ({ value: f, label: f }))}
            />
            <Select
              label="Tamanho"
              value={form.size ?? ''}
              onChange={(v) => setField('size', v)}
              placeholder="Selecionar..."
              options={['Pequeno', 'Médio', 'Grande'].map((s) => ({ value: s, label: s }))}
            />
            <Input label="Peso" value={form.weight ?? ''} onChange={(v) => setField('weight', v)} placeholder="200g" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Input label="Dimensões" value={form.dimensions ?? ''} onChange={(v) => setField('dimensions', v)} placeholder="8 x 9 cm" />
            <Input label="Tempo de Queima" value={form.burn_time ?? ''} onChange={(v) => setField('burn_time', v)} placeholder="40 horas" />
            <Input label="Cor" value={form.color ?? ''} onChange={(v) => setField('color', v)} />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <Select
              label="Recipiente"
              value={form.recipiente ?? ''}
              onChange={(v) => setField('recipiente', v)}
              placeholder="Selecionar..."
              options={[{ value: 'Vidro', label: 'Vidro' }, { value: 'Cerâmica', label: 'Cerâmica' }]}
            />
            <Select
              label="Cera"
              value={form.cera ?? ''}
              onChange={(v) => setField('cera', v)}
              placeholder="Selecionar..."
              options={['Soja', 'Coco', 'Vegetal', 'Parafina'].map((c) => ({ value: c, label: c }))}
            />
          </div>

          <Textarea label="Descrição" value={form.description ?? ''} onChange={(v) => setField('description', v)} rows={3} />
          <Textarea label="Detalhes" value={form.details ?? ''} onChange={(v) => setField('details', v)} rows={2} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Notas de Saída" value={form.notes_top ?? ''} onChange={(v) => setField('notes_top', v)} />
            <Input label="Notas de Coração" value={form.notes_heart ?? ''} onChange={(v) => setField('notes_heart', v)} />
            <Input label="Notas de Base" value={form.notes_base ?? ''} onChange={(v) => setField('notes_base', v)} />
          </div>

          <div className="flex items-center gap-6 pt-2 border-t border-[#E4C7B7]/20">
            <Toggle label="Produto ativo" checked={form.is_active ?? false} onChange={(v) => setField('is_active', v)} />
            <Toggle label="Produto em destaque" checked={form.is_featured ?? false} onChange={(v) => setField('is_featured', v)} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        title="Excluir Produto"
        message="Tem certeza? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmLabel="Excluir"
        danger
      />
    </div>
  );
};
