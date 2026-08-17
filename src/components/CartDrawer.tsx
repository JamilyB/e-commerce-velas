import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { handleImageError } from '../utils/image';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen, setIsCartOpen,
    cart, updateQuantity, cartTotal,
    setCheckoutStep, setActiveTab,
  } = useStore();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[#56443F]/20 backdrop-blur-xs" onClick={() => setIsCartOpen(false)} />
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-[#F1F0E2] shadow-xl flex flex-col justify-between z-10 border-l">
        <div className="p-6 border-b flex justify-between items-center bg-white text-xs">
          <span className="font-serif text-lg font-bold">Sua Sacola</span>
          <button onClick={() => setIsCartOpen(false)}><X size={18} /></button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2">
              <span className="text-3xl">🍓🍂</span>
              <p className="text-xs text-[#A28776] font-semibold">Sua sacola está vazia.</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex gap-3 border-b pb-4 bg-white p-3 rounded-xl text-left text-xs">
                <div className="w-12 h-16 bg-white p-0.5 border rounded-lg flex-shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    onError={(e) => handleImageError(e, item.product.id)}
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-serif font-bold text-[#56443F]">{item.product.name}</h4>
                      <span className="text-[10px] text-[#A28776]">{item.product.subtitle}</span>
                    </div>
                    <span className="font-bold text-[#8B645A]">R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center gap-2 bg-[#FAF9F5] border px-1.5 py-0.5 rounded-lg">
                      <button onClick={() => updateQuantity(item.product.id, item.selectedGiftWrap, -1)}><Minus size={10} /></button>
                      <span className="font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.selectedGiftWrap, 1)}><Plus size={10} /></button>
                    </div>
                    <button onClick={() => updateQuantity(item.product.id, item.selectedGiftWrap, -item.quantity)} className="text-[10px] text-red-400">Remover</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-white border-t space-y-4 text-xs">
            <div className="flex justify-between font-bold">
              <span>Subtotal:</span>
              <span>R$ {cartTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { setIsCartOpen(false); setCheckoutStep(1); setActiveTab('checkout'); }}
              className="w-full py-3.5 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg flex items-center justify-center gap-2"
            >
              <ShoppingBag size={14} />
              Finalizar Compra
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
