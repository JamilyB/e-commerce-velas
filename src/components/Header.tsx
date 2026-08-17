import { Menu, X, ShoppingBag, User, History, Package, Settings } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Header: React.FC = () => {
  const {
    activeTab, setActiveTab,
    isCartOpen, setIsCartOpen,
    cart,
    mobileMenuOpen, setMobileMenuOpen,
    isAccountMenuOpen, setIsAccountMenuOpen,
    setReturnStep, setReturnForm,
  } = useStore();

  return (
    <>
      <header className="sticky top-0 bg-[#F1F0E2]/90 backdrop-blur-md z-40 border-b border-[#E4C7B7]/25 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
          <button
            className="md:hidden text-[#56443F] p-2 hover:bg-[#E4C7B7]/20 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={22} />
          </button>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold tracking-wider uppercase text-[#56443F]">
            <button
              onClick={() => { setActiveTab('shop'); }}
              className={`hover:text-[#8B645A] transition-colors py-2 relative ${activeTab === 'shop' ? 'text-[#8B645A]' : ''}`}
            >
              Coleções de Velas
              {activeTab === 'shop' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B645A]" />}
            </button>
          </nav>

          <div className="absolute left-1/2 -translate-x-1/2 cursor-pointer text-center" onClick={() => setActiveTab('home')}>
            <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-normal text-[#56443F]">
              JASMIN
            </h1>
            <p className="text-[9px] tracking-[0.2em] font-bold uppercase text-[#A28776] -mt-0.5">
              Velas & Aromas
            </p>
          </div>

          <div className="flex items-center space-x-2 md:space-x-3 relative">
            <div className="relative">
              <button
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className={`p-2.5 hover:bg-[#E4C7B7]/20 rounded-full text-[#56443F] transition-all flex items-center gap-1 text-xs font-bold ${activeTab === 'orders' || activeTab === 'tracking' || activeTab === 'returns' ? 'bg-[#E4C7B7]/20 text-[#8B645A]' : ''}`}
                title="Minha Conta"
              >
                <User size={18} />
                <span className="hidden lg:inline text-[11px] tracking-wider uppercase">Meus Pedidos</span>
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#FAF9F5] border border-[#E4C7B7]/40 rounded-xl shadow-lg z-50 p-2 animate-fade-in text-left">
                  <div className="px-3 py-2 border-b border-[#E4C7B7]/20">
                    <p className="text-[10px] uppercase tracking-wider text-[#A28776] font-bold">Minha conta</p>
                  </div>
                  <button
                    onClick={() => { setActiveTab('orders'); setIsAccountMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[#E4C7B7]/25 text-[#56443F] transition-colors flex items-center gap-2"
                  >
                    <History size={14} />
                    Histórico de Pedidos
                  </button>
                  <button
                    onClick={() => { setActiveTab('tracking'); setIsAccountMenuOpen(false); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[#E4C7B7]/25 text-[#56443F] transition-colors flex items-center gap-2"
                  >
                    <Package size={14} />
                    Rastrear Encomenda
                  </button>
                  <button
                    onClick={() => {
                      setReturnStep(1);
                      setReturnForm(prev => ({ ...prev, orderId: '', items: [] }));
                      setActiveTab('returns');
                      setIsAccountMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[#E4C7B7]/25 text-[#56443F] transition-colors flex items-center gap-2"
                  >
                    <History size={14} className="text-[#8B645A]" />
                    Trocas & Devoluções
                  </button>
                  <button
                    onClick={() => { setActiveTab('profile'); setIsAccountMenuOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg hover:bg-[#E4C7B7]/25 text-[#56443F] transition-colors flex items-center gap-2 border-t border-[#E4C7B7]/10 mt-1 pt-2 ${activeTab === 'profile' ? 'bg-[#E4C7B7]/20 text-[#8B645A]' : ''}`}
                  >
                    <Settings size={14} className="text-[#8B645A]" />
                    Perfil & Configurações
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 hover:bg-[#E4C7B7]/20 rounded-full text-[#56443F] transition-colors"
              aria-label="Sacola"
            >
              <ShoppingBag size={18} />
              {cart.length > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-[#8B645A] text-[#F1F0E2] text-[9px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#F1F0E2] z-50 flex flex-col p-8 justify-between animate-fade-in">
          <div>
            <div className="flex justify-between items-center mb-12">
              <span className="font-serif text-2xl font-bold text-[#56443F]">SURU</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#56443F] p-2 hover:bg-[#E4C7B7]/20 rounded-full"
              >
                <X size={24} />
              </button>
            </div>

            <nav className="flex flex-col space-y-4 text-lg font-serif">
              <button
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className="text-left py-2.5 border-b border-[#E4C7B7]/20 hover:text-[#8B645A] text-[#56443F]"
              >
                Página Inicial
              </button>
              <button
                onClick={() => { setActiveTab('shop'); setMobileMenuOpen(false); }}
                className="text-left py-2.5 border-b border-[#E4C7B7]/20 hover:text-[#8B645A] text-[#56443F]"
              >
                Coleção de Velas
              </button>
              <button
                onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }}
                className="text-left py-2.5 border-b border-[#E4C7B7]/20 hover:text-[#8B645A] text-[#56443F]"
              >
                Meus Pedidos
              </button>
              <button
                onClick={() => { setActiveTab('tracking'); setMobileMenuOpen(false); }}
                className="text-left py-2.5 border-b border-[#E4C7B7]/20 hover:text-[#8B645A] text-[#56443F]"
              >
                Rastrear Encomenda
              </button>
              <button
                onClick={() => { setReturnStep(1); setActiveTab('returns'); setMobileMenuOpen(false); }}
                className="text-left py-2.5 border-b border-[#E4C7B7]/20 hover:text-[#8B645A] text-[#56443F]"
              >
                Trocas & Devoluções
              </button>
              <button
                onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }}
                className="text-left py-2.5 border-b border-[#E4C7B7]/20 hover:text-[#8B645A] text-[#56443F]"
              >
                Perfil & Configurações
              </button>
            </nav>
          </div>

          <div className="bg-[#E4C7B7]/20 p-6 rounded-2xl space-y-2 text-left">
            <p className="text-xs text-[#8B645A] font-bold tracking-wide uppercase">Cuidado Artesanal</p>
            <p className="text-xs text-[#56443F] leading-relaxed font-semibold">
              Velas esculpidas e finalizadas à mão com ceras vegetais selecionadas. O aroma perfeito para seus rituais de luz e calma.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
