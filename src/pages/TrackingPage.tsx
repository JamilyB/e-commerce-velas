import { useState, useCallback } from 'react';
import { Check, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import type { TrackingData } from '../types';

export const TrackingPage: React.FC = () => {
  const {
    trackingInput, setTrackingInput,
    historicOrders, placedOrder, shippingForm, cart,
    showToast, setActiveTab,
  } = useStore();

  const [activeTrackingData, setActiveTrackingData] = useState<TrackingData | null>(null);

  const handleSearchTracking = useCallback((code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      showToast("Por favor, digite um código de rastreamento.");
      return;
    }

    const matchHistory = historicOrders.find(o => o.tracking === cleanCode);

    if (placedOrder && cleanCode === placedOrder.tracking) {
      setActiveTrackingData({
        code: placedOrder.tracking,
        recipientName: shippingForm.name || "Cliente SURU",
        orderDate: placedOrder.date,
        itemsCount: cart.length || 1,
        currentStep: 2,
        steps: [
          { title: 'Pedido Confirmado', subtitle: 'Pagamento aprovado com sucesso em nosso sistema.', time: 'Hoje, logo após a compra', status: 'done' },
          { title: 'Preparação Artesanal', subtitle: 'Lote de cera vegetal vertido. Essências sendo homogeneizadas e integradas.', time: 'Em andamento', status: 'current' },
          { title: 'Controle de Qualidade', subtitle: 'Verificação do pavio de algodão puro e acabamento estético.', status: 'pending' },
          { title: 'Embalagem Segura', subtitle: 'Caixa de presente com papel colmeia eco-protetor sendo selada.', status: 'pending' },
          { title: 'Despachado', subtitle: 'Entregue à transportadora e rota de entrega iniciada.', status: 'pending' },
          { title: 'Aconchego Entregue', subtitle: 'Sua casa perfumada com rituais de luz.', status: 'pending' },
        ]
      });
      setActiveTab('tracking');
      showToast("Pedido localizado com sucesso!");
      return;
    }

    if (matchHistory) {
      const isDelivered = matchHistory.status === 'delivered';
      setActiveTrackingData({
        code: matchHistory.tracking,
        recipientName: "Cliente SURU",
        orderDate: matchHistory.date,
        itemsCount: matchHistory.items.length,
        currentStep: isDelivered ? 6 : 2,
        steps: [
          { title: 'Pedido Confirmado', subtitle: 'Pagamento aprovado com sucesso.', time: `${matchHistory.date} • 10:14`, status: 'done' },
          { title: 'Preparação Artesanal', subtitle: 'Cera vegetal de soja e essências vertidas.', time: `${matchHistory.date} • 15:30`, status: 'done' },
          { title: 'Controle de Qualidade', subtitle: 'Pavio centralizado e queima de teste em lote aprovada.', time: `${matchHistory.date} • 17:00`, status: 'done' },
          { title: 'Embalagem Segura', subtitle: 'Acomodado em caixa kraft especial com aroma da marca.', time: `${matchHistory.date} • 18:15`, status: 'done' },
          { title: 'Despachado', subtitle: 'Despacho com rastreamento ativo.', time: `${matchHistory.date} • 19:45`, status: 'done' },
          { title: 'Aconchego Entregue', subtitle: 'Entregue e pronto para perfumar seu lar.', time: isDelivered ? 'Entregue' : undefined, status: isDelivered ? 'done' : 'pending' },
        ]
      });
      setActiveTab('tracking');
      showToast("Pedido localizado com sucesso!");
    } else {
      showToast("Código não encontrado. Tente o código do seu histórico: SR492810481BR");
    }
  }, [trackingInput, historicOrders, placedOrder, shippingForm.name, cart.length, showToast, setActiveTab]);

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-6 py-16 text-left space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-widest text-[#8B645A] uppercase">Acompanhe Seus Aromas</span>
        <h2 className="font-serif text-3xl font-semibold text-[#56443F]">Checklist de Rastreio</h2>
        <p className="text-xs text-[#A28776] font-semibold">Consulte a jornada física e o preparo artesanal do seu lote.</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-[#E4C7B7]/25 max-w-xl mx-auto space-y-3">
        <label className="text-[10px] font-bold uppercase text-[#8B645A] tracking-wider">Código de Rastreamento</label>
        <div className="flex gap-2">
          <input type="text" placeholder="Ex: SR492810481BR" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} className="w-full bg-[#FAF9F5] border rounded-lg pl-3 pr-3 py-2.5 text-xs font-bold uppercase tracking-wider" />
          <button onClick={() => handleSearchTracking(trackingInput)} className="bg-[#56443F] hover:bg-[#8B645A] text-white px-5 rounded-lg text-xs font-bold uppercase">Buscar</button>
        </div>
      </div>

      {activeTrackingData ? (
        <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E4C7B7]/30 max-w-xl mx-auto space-y-6 text-left">
          <div className="flex justify-between items-center border-b pb-3 text-xs">
            <div>
              <span className="text-[9px] text-[#A28776] block">Código de Envio</span>
              <span className="font-mono font-bold text-[#56443F]">{activeTrackingData.code}</span>
            </div>
            <div>
              <span className="text-[9px] text-[#A28776] block text-right">Data do Pedido</span>
              <span className="font-bold text-[#56443F] block text-right">{activeTrackingData.orderDate}</span>
            </div>
          </div>

          <div className="relative pl-6 border-l-2 border-[#E4C7B7]/40 space-y-8 py-2">
            {activeTrackingData.steps.map((step, index) => {
              const isDone = step.status === 'done';
              const isCurrent = step.status === 'current';
              return (
                <div key={index} className="relative">
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${isDone ? 'bg-[#8B645A] border-[#8B645A]' : isCurrent ? 'bg-white border-[#8B645A] ring-4 ring-[#E4C7B7]/30' : 'bg-white border-[#E4C7B7]'}`}>
                    {isDone && <Check size={10} className="text-white" />}
                  </div>
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <h4 className={`font-bold ${isCurrent ? 'text-[#8B645A]' : 'text-[#56443F]'}`}>{step.title}</h4>
                      {step.time && <span className="text-[9px] bg-gray-50 px-1.5 py-0.5 rounded border">{step.time}</span>}
                    </div>
                    <p className="text-[11px] text-[#A28776] mt-0.5 font-medium leading-relaxed">{step.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto text-center py-6">
          <Package size={32} className="text-[#A28776] mx-auto mb-2" />
          <p className="text-xs text-[#A28776] font-semibold">Tente pesquisar o código modelo `SR492810481BR` para ver a animação de rastreamento.</p>
        </div>
      )}
    </div>
  );
};
