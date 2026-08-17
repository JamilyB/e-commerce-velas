import type { Product } from '../types';

export interface FilterState {
  activeCollection: string;
  selectedAroma: string;
  selectedFamilia: string;
  selectedTamanho: string;
  selectedQueima: string;
  selectedCor: string;
  selectedMaterial: string;
  selectedCera: string;
  maxPrice: number;
}

export const DEFAULT_FILTERS: FilterState = {
  activeCollection: 'all',
  selectedAroma: 'all',
  selectedFamilia: 'all',
  selectedTamanho: 'all',
  selectedQueima: 'all',
  selectedCor: 'all',
  selectedMaterial: 'all',
  selectedCera: 'all',
  maxPrice: 130,
};

export const filterProducts = (products: Product[], filters: FilterState): Product[] => {
  return products.filter(product => {
    if (filters.activeCollection !== 'all' && product.collection !== filters.activeCollection) return false;
    if (filters.selectedAroma !== 'all' && product.aroma !== filters.selectedAroma) return false;
    if (filters.selectedFamilia !== 'all' && product.familiaOlfativa !== filters.selectedFamilia) return false;
    if (filters.selectedTamanho !== 'all' && product.size !== filters.selectedTamanho) return false;
    if (filters.selectedCor !== 'all' && product.color !== filters.selectedCor) return false;
    if (filters.selectedMaterial !== 'all' && product.recipiente !== filters.selectedMaterial) return false;
    if (filters.selectedCera !== 'all' && product.cera !== filters.selectedCera) return false;
    if (product.price > filters.maxPrice) return false;

    if (filters.selectedQueima !== 'all') {
      const hours = parseInt(product.burnTime);
      if (filters.selectedQueima === 'curto' && hours >= 40) return false;
      if (filters.selectedQueima === 'medio' && (hours < 40 || hours > 50)) return false;
      if (filters.selectedQueima === 'longo' && hours <= 50) return false;
    }

    return true;
  });
};
