import { ShoppingBag, Heart, Star } from 'lucide-react';
import type { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { handleImageError } from '../utils/image';

interface ProductCardProps {
  product: Product;
  variant?: 'featured' | 'shop';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'shop' }) => {
  const { addToCart, toggleLike, likedProducts, setSelectedProduct } = useStore();
  const isFeatured = variant === 'featured';

  return (
    <div className="group bg-white rounded-xl border border-[#E4C7B7]/15 overflow-hidden transition-all duration-300 hover:border-[#E4C7B7]/50 flex flex-col justify-between">
      <div
        className="relative aspect-[4/5] bg-white cursor-pointer overflow-hidden p-3"
        onClick={() => setSelectedProduct(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => handleImageError(e, product.id)}
          className="w-full h-full object-cover rounded-lg transition-transform duration-500 group-hover:scale-102"
        />
        <button
          onClick={(e) => toggleLike(product.id, e)}
          className="absolute top-6 right-6 bg-white/90 backdrop-blur-xs p-2.5 rounded-full text-[#8B645A] hover:bg-white transition-colors"
          aria-label="Favoritar"
        >
          <Heart
            size={14}
            fill={likedProducts.includes(product.id) ? '#8B645A' : 'none'}
            stroke={likedProducts.includes(product.id) ? '#8B645A' : 'currentColor'}
          />
        </button>

        {product.referenceFile && (
          <span className={`absolute top-6 left-6 bg-[#8B645A] text-[#F1F0E2] font-bold tracking-wider uppercase px-2.5 py-1 rounded-sm ${isFeatured ? 'text-[9px]' : 'text-[8px]'}`}>
            {isFeatured ? `Em destaque • ${product.referenceFile}` : 'Exclusivo SURU'}
          </span>
        )}

        <span className="absolute bottom-6 left-6 bg-[#F1F0E2]/90 backdrop-blur-xs text-[#56443F] text-[10px] font-bold px-2.5 py-1 rounded-sm border border-[#E4C7B7]/30">
          {product.weight} • {product.burnTime}
        </span>
      </div>

      <div className={`p-${isFeatured ? '6' : '5'} space-y-${isFeatured ? '4' : '3'} text-left`}>
        <div className="space-y-1">
          <div className="flex justify-between items-baseline gap-2">
            <h4
              className={`font-serif ${isFeatured ? 'text-lg' : 'text-base'} font-bold text-[#56443F] hover:text-[#8B645A] cursor-pointer line-clamp-1`}
              onClick={() => setSelectedProduct(product)}
            >
              {product.name}
            </h4>
            <span className={`text-${isFeatured ? 'base' : 'sm'} font-bold text-[#8B645A]`}>
              R$ {product.price.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-[#A28776] font-semibold line-clamp-1">{product.subtitle}</p>
        </div>

        {isFeatured && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#56443F]">
            <span className="flex text-[#8B645A]">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={11} fill={i < Math.floor(product.rating) ? '#8B645A' : 'none'} />
              ))}
            </span>
            <span>{product.rating}</span>
            <span className="text-[#A28776]">({product.reviewsCount} avaliações)</span>
          </div>
        )}

        {isFeatured ? (
          <div className="flex gap-2 text-[10px] font-semibold">
            <span className="bg-[#FAF9F5] border border-[#E4C7B7]/20 text-[#8B645A] px-2 py-0.5 rounded-sm">
              Dimensões: {product.dimensions}
            </span>
            <span className="bg-[#FAF9F5] border border-[#E4C7B7]/20 text-[#8B645A] px-2 py-0.5 rounded-sm">
              Cera: {product.cera}
            </span>
          </div>
        ) : (
          <div className="flex justify-between items-center text-[10px] text-[#56443F] bg-[#FAF9F5] p-2 rounded border border-[#E4C7B7]/20">
            <span>{product.burnTime}</span>
            <span>{product.dimensions}</span>
          </div>
        )}

        <button
          onClick={() => addToCart(product)}
          className={`w-full ${isFeatured ? 'py-3' : 'py-2.5'} bg-${isFeatured ? '[#56443F] hover:bg-[#8B645A]' : '[#FAF9F5] hover:bg-[#E4C7B7]/20 text-[#8B645A] border border-[#E4C7B7]/60'} text-${isFeatured ? 'white' : '[#8B645A]'} text-xs font-bold tracking-wider uppercase rounded-md transition-colors flex items-center justify-center gap-1.5`}
        >
          <ShoppingBag size={13} />
          <span>Adicionar à Sacola</span>
        </button>
      </div>
    </div>
  );
};
