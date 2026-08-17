import React, { useEffect, useState, useCallback } from 'react';
import { Boxes, AlertCircle, Save } from 'lucide-react';
// Input not needed here - using native input for inline editing
import { productsService, activityLogService } from '../services';
import type { AdminProduct } from '../types';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Form';
import { SearchInput, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const InventoryPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingStock, setEditingStock] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const prods = await productsService.list();
      setProducts(prods);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku ?? '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' ||
      (filter === 'low' && p.stock <= p.low_stock_threshold && p.stock > 0) ||
      (filter === 'out' && p.stock === 0) ||
      (filter === 'ok' && p.stock > p.low_stock_threshold);
    return matchSearch && matchFilter;
  });

  const saveStock = async (p: AdminProduct) => {
    const newStock = parseInt(editingStock[p.id] ?? '0', 10);
    if (isNaN(newStock)) { showToast('Valor inválido.'); return; }
    await productsService.updateStock(p.id, newStock);
    await activityLogService.log(user, 'Atualizou estoque', 'product', p.id, { name: p.name, stock: newStock });
    showToast(`Estoque de ${p.name} atualizado para ${newStock} unidades.`);
    setEditingStock((prev) => { const c = { ...prev }; delete c[p.id]; return c; });
    load();
  };

  const stockStatus = (p: AdminProduct) => {
    if (p.stock === 0) return { label: 'Sem estoque', variant: 'error' as const };
    if (p.stock <= p.low_stock_threshold) return { label: 'Estoque baixo', variant: 'warning' as const };
    return { label: 'Em estoque', variant: 'success' as const };
  };

  const totalStock = products.reduce((s, p) => s + p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.low_stock_threshold && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const stockValue = products.reduce((s, p) => s + p.stock * p.price, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#8B645A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Controle de Estoque" subtitle="Gerencie o estoque de todos os produtos" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-[#8B645A]/10 flex items-center justify-center"><Boxes size={18} className="text-[#8B645A]" /></div><div><p className="text-xs text-[#A28776] font-semibold">Total em Estoque</p><p className="text-xl font-bold text-[#56443F]">{totalStock}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center"><AlertCircle size={18} className="text-amber-600" /></div><div><p className="text-xs text-[#A28776] font-semibold">Estoque Baixo</p><p className="text-xl font-bold text-[#56443F]">{lowStockCount}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><AlertCircle size={18} className="text-red-600" /></div><div><p className="text-xs text-[#A28776] font-semibold">Sem Estoque</p><p className="text-xl font-bold text-[#56443F]">{outOfStockCount}</p></div></div></Card>
        <Card className="p-4"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center"><span className="text-emerald-600 font-bold text-xs">R$</span></div><div><p className="text-xs text-[#A28776] font-semibold">Valor em Estoque</p><p className="text-xl font-bold text-[#56443F]">{fmtBRL(stockValue)}</p></div></div></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar produto..." /></div>
        <div className="flex gap-2">
          {[
            { v: 'all', l: 'Todos' },
            { v: 'ok', l: 'Em estoque' },
            { v: 'low', l: 'Baixo' },
            { v: 'out', l: 'Esgotado' },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => setFilter(opt.v)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${filter === opt.v ? 'bg-[#56443F] text-white border-[#56443F]' : 'bg-white text-[#56443F] border-[#E4C7B7]/40 hover:bg-[#E4C7B7]/20'}`}
            >
              {opt.l}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E4C7B7]/20">
                {['Produto', 'SKU', 'Preço', 'Estoque Atual', 'Status', 'Ações'].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-wider text-[#A28776] py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status = stockStatus(p);
                const isEditing = editingStock[p.id] !== undefined;
                return (
                  <tr key={p.id} className="border-b border-[#E4C7B7]/10">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {p.image && <img src={p.image} alt={p.name} className="w-9 h-9 object-cover rounded-lg bg-[#E4C7B7]/20" />}
                        <span className="text-sm font-semibold text-[#56443F]">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-sm text-[#A28776]">{p.sku ?? '—'}</td>
                    <td className="py-3.5 px-4 text-sm font-semibold">{fmtBRL(p.price)}</td>
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input type="number" value={editingStock[p.id]} onChange={(e) => setEditingStock((prev) => ({ ...prev, [p.id]: e.target.value }))} className="w-20 px-3 py-2.5 rounded-lg border border-[#E4C7B7]/40 bg-white text-sm text-[#56443F] focus:outline-none focus:border-[#8B645A] focus:ring-2 focus:ring-[#8B645A]/10 transition-all" />
                      ) : (
                        <span className={`text-sm font-bold ${p.stock <= p.low_stock_threshold ? 'text-red-600' : 'text-[#56443F]'}`}>{p.stock}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4"><Badge variant={status.variant}>{status.label}</Badge></td>
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <Button size="sm" onClick={() => saveStock(p)}><Save size={13} /> Salvar</Button>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => setEditingStock((prev) => ({ ...prev, [p.id]: String(p.stock) }))}>Ajustar</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-sm text-[#A28776]">Nenhum produto encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
