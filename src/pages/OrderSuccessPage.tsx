import { Check, History } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const OrderSuccessPage: React.FC = () => {
  const { placedOrder, setActiveTab, setTrackingInput } = useStore();

  if (!placedOrder) return null;

  const handleSearchTracking = (code: string) => {
    setTrackingInput(code);
    setActiveTab('tracking');
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-6 py-20 text-center space-y-8">
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-[#E4C7B7]/35 space-y-6 text-left">
        <div className="bg-[#E4C7B7]/20 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto text-[#8B645A]">
          <Check size={28} />
        </div>
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-[#8B645A] uppercase tracking-widest block">Pedido Confirmado</span>
          <h2 className="font-serif text-2xl font-bold text-[#56443F]">O perfume e a luz estão a caminho da sua casa!</h2>
          <p className="text-xs text-[#A28776] font-semibold max-w-sm mx-auto leading-relaxed">Seu pedido foi registrado no histórico. Preparamos cada embalagem individualmente com rituais manuais e carinho.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs font-semibold pt-4">
          <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E4C7B7]/25">
            <span className="text-[9px] uppercase tracking-wider text-[#A28776] block">Número do Pedido</span>
            <p className="font-mono font-bold text-[#56443F]">#{placedOrder.id}</p>
          </div>
          <div onClick={() => handleSearchTracking(placedOrder.tracking)} className="bg-[#FAF9F5] p-4 rounded-xl border border-[#8B645A]/40 cursor-pointer hover:bg-[#E4C7B7]/15 transition-all">
            <span className="text-[9px] uppercase tracking-wider text-[#A28776] block">Código de Rastreamento (Clique para Rastrear)</span>
            <p className="font-mono font-bold text-[#8B645A] underline">{placedOrder.tracking}</p>
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <button onClick={() => setActiveTab('orders')} className="text-xs font-bold text-[#8B645A] hover:underline flex items-center gap-1.5 bg-[#E4C7B7]/30 px-4 py-2 rounded-lg">
            <History size={14} /> <span>Ver Meu Histórico de Pedidos</span>
          </button>
        </div>
      </div>
    </div>
  );
};
