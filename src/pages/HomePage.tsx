import { ArrowRight, Flame, ChevronRight, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { KITS } from '../data/kits';
import { ProductCard } from '../components/ProductCard';
import { handleImageError } from '../utils/image';

export const HomePage: React.FC = () => {
  const { setActiveTab, addKitToCart, products } = useStore();

  return (
    <div className="animate-fade-in">
      <section className="relative min-h-[85vh] flex items-center justify-center px-6 md:px-12 py-12 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-1.5 self-center lg:self-start bg-[#E4C7B7]/30 border border-[#E4C7B7]/50 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#8B645A]">
              <Flame size={12} className="text-[#8B645A]" />
              <span>Decoração com aroma e aconchego</span>
            </div>

            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-[#56443F]">
              Velas que <br className="hidden md:inline" />
              <span className="text-[#8B645A] italic">transformam</span> o ambiente.
            </h2>

            <p className="text-sm md:text-base text-[#A28776] font-semibold leading-relaxed max-w-lg mx-auto lg:mx-0">
              Velas decorativas e aromáticas criadas para trazer aconchego, personalidade e fragrâncias marcantes ao seu espaço. Peças produzidas com atenção aos detalhes, unindo design e bem-estar para compor qualquer ambiente.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => setActiveTab('shop')}
                className="w-full sm:w-auto px-8 py-3.5 bg-[#56443F] hover:bg-[#8B645A] text-white rounded-lg transition-all font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2"
              >
                <span>Explorar a Coleção</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative flex justify-center items-center">
            <div className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden border border-[#E4C7B7]/20 bg-white p-2">
              <img
                src="download (1)_2.webp"
                alt="Vela Raspberry Milkshake em copo com calda e framboesas esculpidas"
                onError={(e) => handleImageError(e, 'gourmet-01')}
                className="w-full h-full object-cover rounded-xl"
              />
            
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/40 p-8 rounded-xl border border-[#E4C7B7]/20 space-y-3 text-left">
            <h3 className="font-serif text-lg font-bold text-[#56443F]">Design Artesanal</h3>
            <p className="text-xs md:text-sm text-[#A28776] leading-relaxed font-semibold">
              Velas decorativas com detalhes únicos, criadas em cera vegetal para trazer beleza e personalidade ao seu ambiente.
            </p>
          </div>
          <div className="bg-white/40 p-8 rounded-xl border border-[#E4C7B7]/20 space-y-3 text-left">
            <h3 className="font-serif text-lg font-bold text-[#56443F]">Aromas & Texturas</h3>
            <p className="text-xs md:text-sm text-[#A28776] leading-relaxed font-semibold">
             Criações inspiradas em elementos do cotidiano, combinando design, fragrâncias e detalhes que tornam cada peça especial.
            </p>
          </div>
          <div className="bg-white/40 p-8 rounded-xl border border-[#E4C7B7]/20 space-y-3 text-left">
            <h3 className="font-serif text-lg font-bold text-[#56443F]">Queima Limpa e Duradoura</h3>
            <p className="text-xs md:text-sm text-[#A28776] leading-relaxed font-semibold">
              Produzidas com ceras vegetais e materiais selecionados para uma experiência aromática suave e uma queima uniforme.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#E4C7B7]/10 border-t border-b border-[#E4C7B7]/30 text-left">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="space-y-1 mb-8">
            <span className="text-xs font-bold tracking-widest text-[#8B645A] uppercase">Ofertas Especiais</span>
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-[#56443F]">Nossos Kits</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {KITS.map(kit => (
              <div key={kit.id} className="bg-white rounded-2xl border border-[#E4C7B7]/35 overflow-hidden p-5 flex flex-col sm:flex-row gap-5 items-center">
                <div className="w-full sm:w-1/3 aspect-square rounded-xl overflow-hidden bg-[#F1F0E2]/40 border">
                  <img src={kit.image} alt={kit.name} onError={(e) => handleImageError(e, kit.products[0])} className="w-full h-full object-cover" />
                </div>
                <div className="sm:w-2/3 space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg font-bold text-[#56443F]">{kit.name}</h4>
                    <p className="text-xs text-[#A28776] font-medium leading-relaxed">{kit.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8B645A] font-serif text-lg font-bold">R$ {kit.price.toFixed(2)}</span>
                    <span className="text-xs text-[#A28776] line-through">R$ {kit.originalPrice.toFixed(2)}</span>
                    <span className="bg-[#E4C7B7]/40 text-[#8B645A] font-bold text-[9px] uppercase px-2 py-0.5 rounded">Economize R$ {(kit.originalPrice - kit.price).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => addKitToCart(kit)}
                    className="px-4 py-2 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <ShoppingBag size={12} />
                    <span>Adicionar Kit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-[#F1F0E2]">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row justify-between items-baseline mb-10 text-left gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold tracking-widest text-[#8B645A] uppercase">Destaques da coleção</span>
              <h3 className="font-serif text-2xl md:text-3xl font-semibold text-[#56443F]">Destaques</h3>
            </div>
            <button
              onClick={() => setActiveTab('shop')}
              className="text-xs font-bold text-[#8B645A] hover:text-[#56443F] transition-colors flex items-center gap-1 group"
            >
              <span>Ver catálogo completo</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.slice(0, 3).map(product => (
              <ProductCard key={product.id} product={product} variant="featured" />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
