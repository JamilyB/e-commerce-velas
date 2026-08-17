import type { Kit } from '../types';

export const KITS: Kit[] = [
  {
    id: 'kit-01',
    name: 'Kit Relaxar',
    description: 'A combinação das fragrâncias Lavanda & Eucalipto e Camomila Serena para criar um ambiente tranquilo e acolhedor.',
    price: 178.00,
    originalPrice: 200.00,
    image: 'https://res.cloudinary.com/pjzckky0/image/upload/v1783705093/Emp%C3%B3rio_Coralina_Velas_Arom%C3%A1ticas_Presentes_e_Brindes_Personalizados_akqbvt.jpg',
    products: ['relaxar-01', 'relaxar-02']
  },
  {
    id: 'kit-02',
    name: 'Kit Café & Conforto',
    description: 'A união das velas Ice Latte e Cappuccino Trufado para trazer aconchego e aroma aos seus momentos de pausa.',
    price: 169.00,
    originalPrice: 190.00,
    image: 'https://res.cloudinary.com/pjzckky0/image/upload/v1783705118/download_wvvcda.jpg',
    products: ['cafe-01', 'cafe-02']
  }
];
