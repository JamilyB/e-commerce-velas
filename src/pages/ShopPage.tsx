import { useState } from 'react';
import { Sparkles, MessageSquare, Filter } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { COLLECTIONS } from '../data/constants';
import { ProductCard } from '../components/ProductCard';
import { filterProducts, DEFAULT_FILTERS, type FilterState } from '../utils/filters';

export const ShopPage: React.FC = () => {
  const { products } = useStore();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const filteredProducts = filterProducts(products, filters);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-10">
      <section className="mb-12 bg-[#E4C7B7]/15 border border-[#E4C7B7]/40 rounded-xl p-8 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 bg-white px-3 py-1 rounded-full text-xs font-bold text-[#8B645A] border border-[#E4C7B7]/30">
            <Sparkles size={12} /> Encontre seu aroma ideal
          </span>
          <h3 className="font-serif text-2xl font-bold text-[#56443F]">Descubra fragrâncias que combinam com seu ambiente e preferências.</h3>
          <p className="text-xs text-[#A28776] font-semibold">Abra nosso bate-papo de IA no rodapé para receber rituais personalizados baseados no seu estado de espírito e ambiente do lar.</p>
          <button
            onClick={() => {
              const event = new CustomEvent('open-ai-chat');
              window.dispatchEvent(event);
            }}
            className="px-6 py-3 bg-[#56443F] hover:bg-[#8B645A] text-white rounded-lg text-xs font-bold tracking-wider uppercase transition-colors inline-flex items-center gap-2"
          >
            <MessageSquare size={14} />
            <span>Iniciar conversa</span>
          </button>
        </div>
      </section>

      <div className="text-center space-y-4 mb-8">
        <span className="text-xs font-bold tracking-widest text-[#8B645A] uppercase">Menu de Coleções</span>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold text-[#56443F]">Sintonias por Coleção</h2>

        <div className="flex flex-wrap justify-center gap-2 pt-2">
          {COLLECTIONS.map(col => (
            <button
              key={col.id}
              onClick={() => updateFilter('activeCollection', col.id)}
              className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${
                filters.activeCollection === col.id
                  ? 'bg-[#56443F] text-white'
                  : 'bg-white text-[#56443F] border border-[#E4C7B7]/40 hover:bg-[#E4C7B7]/15'
              }`}
            >
              {col.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl border border-[#E4C7B7]/30 text-left space-y-6">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-serif text-base font-bold flex items-center gap-1.5">
              <Filter size={15} /> <span>Filtros Rápidos</span>
            </h3>
            <button onClick={clearFilters} className="text-[10px] text-[#8B645A] font-bold hover:underline">
              Limpar Todos
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-[#8B645A]">Preço Máximo: R$ {filters.maxPrice}</label>
            <input
              type="range"
              min="50"
              max="130"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
              className="w-full accent-[#8B645A]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#8B645A]">Família Olfativa</label>
            <select
              value={filters.selectedFamilia}
              onChange={(e) => updateFilter('selectedFamilia', e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-2 text-xs font-semibold text-[#56443F]"
            >
              <option value="all">Todas</option>
              <option value="Doce">Doce</option>
              <option value="Floral">Floral</option>
              <option value="Herbal">Herbal</option>
              <option value="Cítrico">Cítrico</option>
              <option value="Amadeirado">Amadeirado</option>
              <option value="Cafés">Cafés</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#8B645A]">Tamanho / Peso</label>
            <select
              value={filters.selectedTamanho}
              onChange={(e) => updateFilter('selectedTamanho', e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-2 text-xs font-semibold text-[#56443F]"
            >
              <option value="all">Todos</option>
              <option value="Pequeno">Pequeno (&lt; 200g)</option>
              <option value="Médio">Médio (200g - 250g)</option>
              <option value="Grande">Grande (&gt; 250g)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#8B645A]">Tempo de Queima</label>
            <select
              value={filters.selectedQueima}
              onChange={(e) => updateFilter('selectedQueima', e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-2 text-xs font-semibold text-[#56443F]"
            >
              <option value="all">Qualquer tempo</option>
              <option value="curto">Até 40 Horas</option>
              <option value="medio">40h a 50 Horas</option>
              <option value="longo">Mais de 50 Horas</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#8B645A]">Recipiente</label>
            <select
              value={filters.selectedMaterial}
              onChange={(e) => updateFilter('selectedMaterial', e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-2 text-xs font-semibold text-[#56443F]"
            >
              <option value="all">Todos os materiais</option>
              <option value="Vidro">Vidro</option>
              <option value="Cerâmica">Cerâmica</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#8B645A]">Tipo de Cera</label>
            <select
              value={filters.selectedCera}
              onChange={(e) => updateFilter('selectedCera', e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-2 text-xs font-semibold text-[#56443F]"
            >
              <option value="all">Todas as ceras</option>
              <option value="Soja">Cera de Soja</option>
              <option value="Coco">Cera de Coco</option>
              <option value="Vegetal">Cera Vegetal</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-[#8B645A]">Tonalidade do Pote</label>
            <select
              value={filters.selectedCor}
              onChange={(e) => updateFilter('selectedCor', e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-2 text-xs font-semibold text-[#56443F]"
            >
              <option value="all">Todas as cores</option>
              <option value="Rosa">Rosa</option>
              <option value="Marrom">Marrom</option>
              <option value="Branco">Branco</option>
              <option value="Terracota">Terracota</option>
              <option value="Verde">Verde</option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#E4C7B7]/20">
              <span className="text-3xl block mb-2">🕯</span>
              <h4 className="font-serif text-lg font-bold text-[#56443F]">Nenhuma vela encontrada</h4>
              <p className="text-xs text-[#A28776] max-w-xs mx-auto mt-1 leading-relaxed">Não encontramos resultados para sua busca. Tente ajustar os filtros ou buscar por outro termo.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} variant="shop" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
