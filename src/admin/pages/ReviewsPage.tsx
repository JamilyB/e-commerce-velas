import React, { useEffect, useState, useCallback } from 'react';
import { Star, Check, X, Trash2, MessageSquare } from 'lucide-react';
import { reviewsService, activityLogService } from '../services';
import type { AdminReview } from '../types';
import { Card, CardBody } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button, Textarea } from '../components/Form';
import { Modal } from '../components/Modal';
import { SearchInput, ConfirmDialog, PageHeader } from '../components/Common';
import { useAdmin } from '../context/AdminContext';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('pt-BR');

const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'default' }> = {
  pending: { label: 'Pendente', variant: 'warning' },
  approved: { label: 'Aprovada', variant: 'success' },
  rejected: { label: 'Rejeitada', variant: 'error' },
};

const StarRating: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={size} className={i <= rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'} />
    ))}
  </div>
);

export const ReviewsPage: React.FC = () => {
  const { user, showToast } = useAdmin();
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editReview, setEditReview] = useState<AdminReview | null>(null);
  const [response, setResponse] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setReviews(await reviewsService.list()); } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (r: AdminReview, status: 'approved' | 'rejected') => {
    await reviewsService.update(r.id, { status });
    await activityLogService.log(user, `${status === 'approved' ? 'Aprovou' : 'Rejeitou'} avaliação`, 'review', r.id);
    showToast(`Avaliação ${status === 'approved' ? 'aprovada' : 'rejeitada'}.`);
    load();
  };

  const openEdit = (r: AdminReview) => { setEditReview(r); setResponse(r.admin_response ?? ''); };

  const saveResponse = async () => {
    if (!editReview) return;
    await reviewsService.update(editReview.id, { admin_response: response });
    await activityLogService.log(user, 'Respondeu avaliação', 'review', editReview.id);
    showToast('Resposta publicada!');
    setEditReview(null);
    load();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await reviewsService.remove(deleteId);
    await activityLogService.log(user, 'Excluiu avaliação', 'review', deleteId);
    showToast('Avaliação excluída.');
    setDeleteId(null);
    load();
  };

  const filtered = reviews.filter((r) => {
    const matchSearch = !search ||
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.product_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (r.title ?? '').toLowerCase().includes(search.toLowerCase());
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
      <PageHeader title="Avaliações" subtitle={`${reviews.length} avaliações`} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1"><SearchInput value={search} onChange={setSearch} placeholder="Buscar por cliente, produto ou título..." /></div>
        <div className="flex gap-2">
          {[
            { v: 'all', l: 'Todas' },
            { v: 'pending', l: 'Pendentes' },
            { v: 'approved', l: 'Aprovadas' },
            { v: 'rejected', l: 'Rejeitadas' },
          ].map((opt) => (
            <button key={opt.v} onClick={() => setStatusFilter(opt.v)} className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${statusFilter === opt.v ? 'bg-[#56443F] text-white border-[#56443F]' : 'bg-white text-[#56443F] border-[#E4C7B7]/40 hover:bg-[#E4C7B7]/20'}`}>{opt.l}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((r) => (
          <Card key={r.id}>
            <CardBody>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E4C7B7]/30 flex items-center justify-center text-xs font-bold text-[#8B645A]">
                    {r.customer_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#56443F]">{r.customer_name}</p>
                    <p className="text-xs text-[#A28776]">{r.product_name ?? '—'} • {fmtDate(r.created_at)}</p>
                  </div>
                </div>
                <Badge variant={statusConfig[r.status]?.variant ?? 'neutral'}>{statusConfig[r.status]?.label ?? r.status}</Badge>
              </div>

              <div className="flex items-center gap-2 mb-2"><StarRating rating={r.rating} /></div>

              {r.title && <p className="text-sm font-semibold text-[#56443F] mb-1">{r.title}</p>}
              {r.body && <p className="text-xs text-[#A28776] leading-relaxed mb-3">{r.body}</p>}

              {r.admin_response && (
                <div className="bg-[#FAF9F5] rounded-lg p-3 mb-3 border-l-2 border-[#8B645A]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B645A] mb-1">Resposta da Loja</p>
                  <p className="text-xs text-[#56443F]">{r.admin_response}</p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-[#E4C7B7]/20">
                {r.status === 'pending' && (
                  <>
                    <Button size="sm" onClick={() => setStatus(r, 'approved')}><Check size={13} /> Aprovar</Button>
                    <Button size="sm" variant="danger" onClick={() => setStatus(r, 'rejected')}><X size={13} /> Rejeitar</Button>
                  </>
                )}
                <Button size="sm" variant="ghost" onClick={() => openEdit(r)}><MessageSquare size={13} /> Responder</Button>
                <button onClick={() => setDeleteId(r.id)} className="ml-auto p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </CardBody>
          </Card>
        ))}
        {filtered.length === 0 && (
          <Card className="col-span-full"><CardBody><p className="text-center text-sm text-[#A28776] py-8">Nenhuma avaliação encontrada.</p></CardBody></Card>
        )}
      </div>

      <Modal
        open={!!editReview}
        onClose={() => setEditReview(null)}
        title="Responder Avaliação"
        subtitle={editReview ? `${editReview.customer_name} • ${editReview.product_name ?? ''}` : ''}
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditReview(null)}>Cancelar</Button>
            <Button onClick={saveResponse}>Publicar Resposta</Button>
          </>
        }
      >
        {editReview && (
          <div className="space-y-4">
            <div className="bg-[#FAF9F5] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2"><StarRating rating={editReview.rating} /></div>
              {editReview.title && <p className="text-sm font-semibold text-[#56443F] mb-1">{editReview.title}</p>}
              <p className="text-xs text-[#A28776]">{editReview.body}</p>
            </div>
            <Textarea label="Sua Resposta" value={response} onChange={setResponse} rows={4} placeholder="Escreva uma resposta para o cliente..." />
          </div>
        )}
      </Modal>

      <ConfirmDialog open={!!deleteId} title="Excluir Avaliação" message="Tem certeza?" onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} confirmLabel="Excluir" danger />
    </div>
  );
};
