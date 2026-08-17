import { ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { setActiveTab, setReturnStep, showToast } = useStore();

  return (
    <footer className="bg-white border-t border-[#E4C7B7]/30 py-12 px-6 md:px-12 mt-auto text-left text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-5 space-y-3">
          <h3 className="font-serif text-lg font-bold">Receba novidades</h3>
          <p className="text-[#A28776] leading-relaxed">Inscreva-se para ser notificado sobre as fornadas exclusivas de nossas velas e novidades aromáticas.</p>
          <div className="flex border-b pb-1">
            <input type="email" placeholder="Seu e-mail..." className="bg-transparent w-full outline-hidden py-1" />
            <button onClick={() => showToast("Inscrição confirmada!")}><ArrowRight size={14} /></button>
          </div>
        </div>
        <div className="md:col-span-3 space-y-2">
          <h4 className="text-[10px] font-bold uppercase text-[#8B645A]">Sobre</h4>
          <ul className="space-y-1.5 text-[#A28776] font-semibold">
            <li><button onClick={() => setActiveTab('shop')}>Ver Coleções</button></li>
            <li><button onClick={() => setActiveTab('orders')}>Meus Pedidos</button></li>
            <li><button onClick={() => setActiveTab('tracking')}>Rastrear Encomenda</button></li>
            <li><button onClick={() => { setReturnStep(1); setActiveTab('returns'); }}>Trocas & Devoluções</button></li>
          </ul>
        </div>
        <div className="md:col-span-4 space-y-2 text-[#A28776] font-semibold">
          <h4 className="text-[10px] font-bold uppercase text-[#8B645A]">Atendimento</h4>
          <p>Loja localizada em Mogi das Cruzes, SP<br />contato@jasminvelas.com.br</p>
          <div className="pt-2 text-[9px] text-[#BBAA91] uppercase">© {new Date().getFullYear()} JASMIN VELAS. TODOS OS DIREITOS RESERVADOS.</div>
          <a href="/admin" className="inline-block pt-1 text-[9px] text-[#BBAA91] hover:text-[#8B645A] transition-colors uppercase">Painel Administrativo</a>
        </div>
      </div>
    </footer>
  );
};
