import { Calendar, Flame, Truck, CheckCircle2, Package } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { handleImageError } from '../utils/image';
import type { HistoricOrder } from '../types';

export const OrdersPage: React.FC = () => {
  const { historicOrders, setTrackingInput, setActiveTab, startReturnFlow } = useStore();

  const handleTrackOrder = (order: HistoricOrder) => {
    setTrackingInput(order.tracking);
    setActiveTab('tracking');
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-6 py-16 text-left space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-widest text-[#8B645A] uppercase">Seus Lotes de Aromas</span>
        <h2 className="font-serif text-3xl font-semibold text-[#56443F]">Histórico de Pedidos</h2>
        <p className="text-xs text-[#A28776] font-semibold">Monitore o andamento, visualize os itens e rastreie suas entregas anteriores.</p>
      </div>

      <div className="space-y-6 max-w-xl mx-auto">
        {historicOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-2xl p-6 border border-[#E4C7B7]/30 space-y-4">
            <div className="flex flex-wrap justify-between items-start gap-2 border-b pb-3">
              <div className="space-y-1">
                <span className="text-[9px] bg-[#E4C7B7]/30 text-[#8B645A] px-2 py-0.5 rounded-sm font-bold uppercase">Pedido #{order.id}</span>
                <div className="flex items-center gap-1.5 text-[11px] text-[#A28776] font-semibold">
                  <Calendar size={12} />
                  <span>Feito em {order.date}</span>
                </div>
              </div>

              <div className="text-right">
                {order.status === 'preparation' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full">
                    <Flame size={10} className="animate-pulse" /> Em Preparação
                  </span>
                )}
                {order.status === 'despatched' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                    <Truck size={10} /> Despachado
                  </span>
                )}
                {order.status === 'delivered' && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={10} /> Entregue
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3 items-center text-xs text-[#56443F]">
                  <div className="w-10 h-12 bg-[#F1F0E2]/30 border rounded-md p-0.5 flex-shrink-0">
                    <img src={item.image} alt={item.productName} onError={(e) => handleImageError(e, 'cafe-01')} className="w-full h-full object-cover rounded-sm" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold">{item.productName}</p>
                    <span className="text-[10px] text-[#A28776]">{item.volume} • Qtd: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-[#8B645A]">R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="border-t pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-left text-xs">
                <span className="text-[#A28776] font-semibold">Valor Total:</span>{' '}
                <span className="font-bold text-[#56443F]">R$ {order.total.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                {order.status === 'delivered' && (
                  <button
                    onClick={() => startReturnFlow(order)}
                    className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-[#E4C7B7]/15 text-[#8B645A] border border-[#E4C7B7] rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Solicitar Devolução
                  </button>
                )}
                <button
                  onClick={() => handleTrackOrder(order)}
                  className="w-full sm:w-auto px-4 py-2 bg-[#56443F] hover:bg-[#8B645A] text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Package size={12} />
                  <span>Rastrear Encomenda</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
