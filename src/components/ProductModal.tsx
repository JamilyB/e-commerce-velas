import { X, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { handleImageError } from '../utils/image';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, products } = useStore();

  if (!selectedProduct) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#56443F]/30 backdrop-blur-xs animate-fade-in">
      <div className="relative bg-[#F1F0E2] max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-[#E4C7B7]/40 p-1">
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-5 right-5 text-[#56443F] p-2 hover:bg-[#E4C7B7]/25 rounded-full z-10"
        >
          <X size={18} />
        </button>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 md:p-8 text-left">
          <div className="md:col-span-5 relative aspect-[4/5] bg-white rounded-xl overflow-hidden border p-2">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              onError={(e) => handleImageError(e, selectedProduct.id)}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="md:col-span-7 flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] bg-[#E4C7B7]/45 text-[#8B645A] px-2.5 py-0.5 rounded-full font-bold uppercase">
                  Coleção {selectedProduct.collection}
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#56443F] mt-1.5">{selectedProduct.name}</h3>
                <p className="text-xs text-[#A28776] font-semibold italic">{selectedProduct.subtitle}</p>
                <p className="text-lg font-bold text-[#8B645A] mt-1">R$ {selectedProduct.price.toFixed(2)}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#E4C7B7]/20 text-[10px] font-semibold text-[#56443F]">
                <div>
                  <span className="text-[#A28776] block text-[8px] uppercase font-bold">Peso líquido</span>
                  <span>{selectedProduct.weight}</span>
                </div>
                <div>
                  <span className="text-[#A28776] block text-[8px] uppercase font-bold">Dimensões</span>
                  <span>{selectedProduct.dimensions}</span>
                </div>
                <div>
                  <span className="text-[#A28776] block text-[8px] uppercase font-bold">Queima Estimada</span>
                  <span>{selectedProduct.burnTime}</span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-[#56443F]/90 font-medium leading-relaxed">{selectedProduct.description}</p>

              <div className="bg-white p-4 rounded-xl border border-[#E4C7B7]/25 space-y-2 text-xs">
                <h4 className="text-[9px] font-bold uppercase text-[#8B645A] tracking-wider">Estrutura de Aromaterapia</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-[#F1F0E2]/60 p-2 rounded-lg text-center">
                    <span className="text-[8px] text-[#A28776] block uppercase font-bold">Saída</span>
                    <p className="font-bold text-[9px] mt-0.5">{selectedProduct.notes.top}</p>
                  </div>
                  <div className="bg-[#F1F0E2]/60 p-2 rounded-lg text-center">
                    <span className="text-[8px] text-[#A28776] block uppercase font-bold">Corpo</span>
                    <p className="font-bold text-[9px] mt-0.5">{selectedProduct.notes.heart}</p>
                  </div>
                  <div className="bg-[#F1F0E2]/60 p-2 rounded-lg text-center">
                    <span className="text-[8px] text-[#A28776] block uppercase font-bold">Fundo</span>
                    <p className="font-bold text-[9px] mt-0.5">{selectedProduct.notes.base}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <h5 className="text-[10px] font-bold uppercase text-[#8B645A] tracking-wider">Quem comprou também levou:</h5>
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {products.filter(p => p.collection === selectedProduct.collection && p.id !== selectedProduct.id).slice(0, 2).map(rel => (
                    <div
                      key={rel.id}
                      onClick={() => setSelectedProduct(rel)}
                      className="flex-shrink-0 w-32 bg-white rounded-lg p-2 border border-[#E4C7B7]/20 cursor-pointer hover:bg-[#FAF9F5] transition-all text-center space-y-1"
                    >
                      <img src={rel.image} alt={rel.name} onError={(e) => handleImageError(e, rel.id)} className="w-12 h-12 object-cover rounded-md mx-auto" />
                      <p className="font-serif font-bold text-[10px] text-[#56443F] truncate">{rel.name}</p>
                      <p className="text-[9px] font-bold text-[#8B645A]">R$ {rel.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
              className="w-full py-3 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              <span>Adicionar à Sacola</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
