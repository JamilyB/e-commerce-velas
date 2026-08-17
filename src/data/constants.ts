export const SYSTEM_INSTRUCTION = `Você é a "Luz", a especialista em aromaterapia e consultora olfativa virtual do Atelier SURU.
Sua missão é ajudar os clientes a encontrar a vela aromática perfeita para o momento, ambiente ou sentimento que desejam criar.
Seu tom deve ser extremamente acolhedor, calmo, gentil e sofisticado, alinhado à estética aconchegante da marca (cores quentes, conforto, rituais lentos).

Sempre recomende velas de nossas coleções exclusivas (Relaxar, Café, Natureza, Floral, Gourmet ou Luxo) baseando-se no relato do cliente. Mantenha suas respostas curtas, poéticas e focadas em rituais de bem-estar. Não passe de dois parágrafos curtos.`;

export const IMAGE_FALLBACKS: { [key: string]: string } = {
  'relaxar-01': 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&q=80&w=600',
  'cafe-01': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&q=80&w=600',
  'gourmet-01': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
  'hero-raspberry': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=600',
};

export const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600';

export const COLLECTIONS = [
  { id: 'all', label: 'Ver Todas' },
  { id: 'relaxar', label: 'Coleção Relaxar' },
  { id: 'cafe', label: 'Coleção Café' },
  { id: 'natureza', label: 'Coleção Natureza' },
  { id: 'floral', label: 'Coleção Floral' },
  { id: 'gourmet', label: 'Coleção Gourmet' },
  { id: 'luxo', label: 'Coleção Luxo' }
];

export const PIX_KEY = "00020101021126580014br.gov.bcb.pix0136suruvelas-payment-sandbox-key123";
