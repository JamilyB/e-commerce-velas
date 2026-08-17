export interface Product {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  image: string;
  collection: 'relaxar' | 'cafe' | 'natureza' | 'floral' | 'gourmet' | 'luxo';
  aroma: string;
  familiaOlfativa: 'Doce' | 'Floral' | 'Herbal' | 'Cítrico' | 'Amadeirado' | 'Cafés';
  size: 'Pequeno' | 'Médio' | 'Grande';
  weight: string;
  dimensions: string;
  burnTime: string;
  color: 'Rosa' | 'Marrom' | 'Branco' | 'Terracota' | 'Verde';
  recipiente: 'Vidro' | 'Cerâmica';
  cera: 'Soja' | 'Coco' | 'Vegetal' | 'Parafina';
  description: string;
  referenceFile?: string;
  rating: number;
  reviewsCount: number;
  notes: {
    top: string;
    heart: string;
    base: string;
  };
  details: string;
}

export interface Kit {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  image: string;
  products: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedGiftWrap: boolean;
}

export interface ShippingForm {
  email: string;
  name: string;
  cpf: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  method: 'standard' | 'express';
}

export interface PaymentForm {
  method: 'pix' | 'card' | 'boleto';
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  cardInstallments: string;
}

export interface HistoricOrder {
  id: string;
  date: string;
  tracking: string;
  items: { productName: string; quantity: number; price: number; image: string; volume: string }[];
  total: number;
  status: 'preparation' | 'despatched' | 'delivered';
  shippingMethod: 'Padrão' | 'Expresso';
}

export interface ReturnItem {
  productName: string;
  quantity: number;
  selected: boolean;
  reason: string;
}

export interface ReturnForm {
  orderId: string;
  email: string;
  items: ReturnItem[];
  refundMethod: 'pix' | 'store_credit';
  comments: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export type TabName = 'home' | 'shop' | 'checkout' | 'order-success' | 'tracking' | 'orders' | 'returns' | 'profile';

export type AddressType = 'shipping' | 'billing';

export interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  cep: string;
  street: string;
  number: string;
  complement: string;
  city: string;
  state: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export interface SavedCard {
  id: string;
  brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'unknown';
  last4: string;
  expiry: string;
  holderName: string;
  isDefault: boolean;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  avatarInitials: string;
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  newsletter: boolean;
  newCollections: boolean;
}

export interface ProfilePreferences {
  language: 'pt-BR' | 'en-US';
  currency: 'BRL' | 'USD' | 'EUR';
  aromaProfile: 'Doce' | 'Floral' | 'Herbal' | 'Cítrico' | 'Amadeirado' | 'Cafés' | 'all';
  notifications: NotificationPreferences;
}

export interface TrackingStep {
  title: string;
  subtitle: string;
  time?: string;
  status: 'done' | 'current' | 'pending';
}

export interface TrackingData {
  code: string;
  recipientName: string;
  orderDate: string;
  itemsCount: number;
  currentStep: number;
  steps: TrackingStep[];
}

export interface PlacedOrder {
  id: string;
  tracking: string;
  date: string;
}

export interface ReturnSuccess {
  code: string;
  expiration: string;
}
