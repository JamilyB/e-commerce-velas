import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type {
  CartItem,
  Product,
  Kit,
  ShippingForm,
  PaymentForm,
  HistoricOrder,
  ReturnForm,
  PlacedOrder,
  TabName,
  SavedAddress,
  SavedCard,
  UserProfile,
  ProfilePreferences,
} from '../types';
import { PRODUCTS } from '../data/products';
import { storeService } from '../services/storeService';

interface StoreContextType {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;

  products: Product[];

  cart: CartItem[];
  addToCart: (product: Product, selectedGiftWrap?: boolean) => void;
  addKitToCart: (kit: Kit) => void;
  updateQuantity: (productId: string, selectedGiftWrap: boolean, amount: number) => void;
  clearCart: () => void;
  cartTotal: number;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;

  likedProducts: string[];
  toggleLike: (productId: string, e: React.MouseEvent) => void;

  startReturnFlow: (order: HistoricOrder) => void;

  toast: string | null;
  showToast: (message: string) => void;

  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  isAccountMenuOpen: boolean;
  setIsAccountMenuOpen: (open: boolean) => void;

  shippingForm: ShippingForm;
  setShippingForm: React.Dispatch<React.SetStateAction<ShippingForm>>;

  paymentForm: PaymentForm;
  setPaymentForm: React.Dispatch<React.SetStateAction<PaymentForm>>;

  checkoutStep: 1 | 2 | 3;
  setCheckoutStep: React.Dispatch<React.SetStateAction<1 | 2 | 3>>;

  couponCode: string;
  setCouponCode: (code: string) => void;
  couponApplied: boolean;
  setCouponApplied: (applied: boolean) => void;
  discountAmount: number;
  setDiscountAmount: (amount: number) => void;

  formErrors: { [key: string]: string };
  setFormErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;

  isProcessingPayment: boolean;
  setIsProcessingPayment: (processing: boolean) => void;
  processingStatus: string;
  setProcessingStatus: (status: string) => void;

  copiedPix: boolean;
  setCopiedPix: (copied: boolean) => void;

  placedOrder: PlacedOrder | null;
  setPlacedOrder: (order: PlacedOrder | null) => void;

  historicOrders: HistoricOrder[];
  setHistoricOrders: React.Dispatch<React.SetStateAction<HistoricOrder[]>>;

  returnForm: ReturnForm;
  setReturnForm: React.Dispatch<React.SetStateAction<ReturnForm>>;
  returnStep: 1 | 2 | 3 | 4;
  setReturnStep: React.Dispatch<React.SetStateAction<1 | 2 | 3 | 4>>;
  returnSuccess: { code: string; expiration: string } | null;
  setReturnSuccess: (success: { code: string; expiration: string } | null) => void;

  trackingInput: string;
  setTrackingInput: (input: string) => void;

  shippingCost: number;
  finalTotal: number;

  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;

  savedAddresses: SavedAddress[];
  setSavedAddresses: React.Dispatch<React.SetStateAction<SavedAddress[]>>;
  addAddress: (address: Omit<SavedAddress, 'id'>) => void;
  updateAddress: (id: string, updates: Partial<SavedAddress>) => void;
  removeAddress: (id: string) => void;
  setDefaultShippingAddress: (id: string) => void;
  setDefaultBillingAddress: (id: string) => void;

  savedCards: SavedCard[];
  setSavedCards: React.Dispatch<React.SetStateAction<SavedCard[]>>;
  addCard: (card: Omit<SavedCard, 'id'>) => void;
  removeCard: (id: string) => void;
  setDefaultCard: (id: string) => void;

  preferences: ProfilePreferences;
  setPreferences: React.Dispatch<React.SetStateAction<ProfilePreferences>>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const useStore = (): StoreContextType => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within StoreProvider');
  }
  return context;
};

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<TabName>('home');
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [likedProducts, setLikedProducts] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const [shippingForm, setShippingForm] = useState<ShippingForm>({
    email: '', name: '', cpf: '', phone: '', cep: '', street: '',
    number: '', complement: '', city: '', state: '', method: 'standard'
  });
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    method: 'pix', cardName: '', cardNumber: '', cardExpiry: '', cardCvv: '', cardInstallments: '1'
  });
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);

  const [historicOrders, setHistoricOrders] = useState<HistoricOrder[]>([
    {
      id: '582910',
      date: '15/06/2026',
      tracking: 'SR492810481BR',
      items: [
        { productName: 'Ice Latte Candle', quantity: 1, price: 94.00, image: 'download (2)_2.webp', volume: '220g' },
        { productName: 'Lavender & Eucalyptus Premium', quantity: 1, price: 112.00, image: 'download (3).webp', volume: '737g' }
      ],
      total: 206.00,
      status: 'delivered',
      shippingMethod: 'Padrão'
    }
  ]);

  const [returnForm, setReturnForm] = useState<ReturnForm>({
    orderId: '', email: '', items: [], refundMethod: 'store_credit', comments: ''
  });
  const [returnStep, setReturnStep] = useState<1 | 2 | 3 | 4>(1);
  const [returnSuccess, setReturnSuccess] = useState<{ code: string; expiration: string } | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const [userProfile, setUserProfile] = useState<UserProfile>({
    fullName: 'Ana Beatriz Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    birthDate: '1992-03-15',
    avatarInitials: 'AB',
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([
    {
      id: 'addr-1',
      label: 'Casa',
      recipientName: 'Ana Beatriz Silva',
      cep: '01310-100',
      street: 'Av. Paulista',
      number: '1578',
      complement: 'Apto 42',
      city: 'São Paulo',
      state: 'SP',
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
  ]);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    {
      id: 'card-1',
      brand: 'visa',
      last4: '4242',
      expiry: '12/28',
      holderName: 'ANA BEATRIZ SILVA',
      isDefault: true,
    },
  ]);

  const [preferences, setPreferences] = useState<ProfilePreferences>({
    language: 'pt-BR',
    currency: 'BRL',
    aromaProfile: 'all',
    notifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
      newCollections: true,
    },
  });

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    storeService.getProducts().then(setProducts);
  }, []);

  // Load historic orders from Supabase (falls back to demo data on failure)
  useEffect(() => {
    storeService.getHistoricOrders(userProfile.email).then((orders) => {
      if (orders && orders.length > 0) setHistoricOrders(orders);
    });
  }, [userProfile.email]);

  const addToCart = useCallback((product: Product, selectedGiftWrap = false) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id && item.selectedGiftWrap === selectedGiftWrap);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id && item.selectedGiftWrap === selectedGiftWrap
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, selectedGiftWrap }];
    });
    showToast(`${product.name} adicionado à sacola!`);
  }, [showToast]);

  const addKitToCart = useCallback((kit: Kit) => {
    kit.products.forEach(pId => {
      const found = products.find(p => p.id === pId);
      if (found) addToCart(found);
    });
    showToast(`${kit.name} adicionado à sacola com desconto!`);
  }, [addToCart, showToast, products]);

  const updateQuantity = useCallback((productId: string, selectedGiftWrap: boolean, amount: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.product.id === productId && item.selectedGiftWrap === selectedGiftWrap) {
          const newQty = item.quantity + amount;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter((item): item is CartItem => item !== null)
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleLike = useCallback((productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedProducts(prev => {
      const isLiked = prev.includes(productId);
      showToast(isLiked ? "Removido dos favoritos" : "Salvo nos seus favoritos");
      return isLiked ? prev.filter(id => id !== productId) : [...prev, productId];
    });
  }, [showToast]);

  const startReturnFlow = useCallback((order: HistoricOrder) => {
    setReturnForm({
      orderId: order.id,
      email: shippingForm.email || 'cliente@suruvelas.com.br',
      items: order.items.map(item => ({
        productName: item.productName,
        quantity: item.quantity,
        selected: true,
        reason: 'Aroma não atingiu as expectativas'
      })),
      refundMethod: 'store_credit',
      comments: ''
    });
    setReturnStep(2);
    setActiveTab('returns');
    showToast(`Solicitação de devolução iniciada para o Pedido #${order.id}`);
  }, [shippingForm.email, setReturnForm, setReturnStep, setActiveTab, showToast]);

  const addAddress = useCallback((address: Omit<SavedAddress, 'id'>) => {
    const id = `addr-${Date.now()}`;
    setSavedAddresses(prev => {
      const updated = [...prev];
      if (address.isDefaultShipping) updated.forEach(a => a.isDefaultShipping = false);
      if (address.isDefaultBilling) updated.forEach(a => a.isDefaultBilling = false);
      return [...updated, { ...address, id }];
    });
    showToast('Endereço adicionado com sucesso!');
  }, [showToast]);

  const updateAddress = useCallback((id: string, updates: Partial<SavedAddress>) => {
    setSavedAddresses(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...updates } : a);
      if (updates.isDefaultShipping) updated.forEach(a => { if (a.id !== id) a.isDefaultShipping = false; });
      if (updates.isDefaultBilling) updated.forEach(a => { if (a.id !== id) a.isDefaultBilling = false; });
      return updated;
    });
    showToast('Endereço atualizado!');
  }, [showToast]);

  const removeAddress = useCallback((id: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== id));
    showToast('Endereço removido.');
  }, [showToast]);

  const setDefaultShippingAddress = useCallback((id: string) => {
    setSavedAddresses(prev => prev.map(a => ({ ...a, isDefaultShipping: a.id === id })));
    showToast('Endereço de entrega padrão atualizado!');
  }, [showToast]);

  const setDefaultBillingAddress = useCallback((id: string) => {
    setSavedAddresses(prev => prev.map(a => ({ ...a, isDefaultBilling: a.id === id })));
    showToast('Endereço de cobrança padrão atualizado!');
  }, [showToast]);

  const addCard = useCallback((card: Omit<SavedCard, 'id'>) => {
    const id = `card-${Date.now()}`;
    setSavedCards(prev => {
      const updated = [...prev];
      if (card.isDefault) updated.forEach(c => c.isDefault = false);
      return [...updated, { ...card, id }];
    });
    showToast('Cartão adicionado com sucesso!');
  }, [showToast]);

  const removeCard = useCallback((id: string) => {
    setSavedCards(prev => prev.filter(c => c.id !== id));
    showToast('Cartão removido.');
  }, [showToast]);

  const setDefaultCard = useCallback((id: string) => {
    setSavedCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
    showToast('Cartão padrão atualizado!');
  }, [showToast]);

  const cartTotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const shippingCost = shippingForm.method === 'express' ? 25.00 : (cartTotal >= 180 ? 0.00 : 15.00);
  const finalTotal = cartTotal + shippingCost - discountAmount;

  const value: StoreContextType = {
    activeTab, setActiveTab,
    products,
    cart, addToCart, addKitToCart, updateQuantity, clearCart, cartTotal,
    isCartOpen, setIsCartOpen,
    selectedProduct, setSelectedProduct,
    likedProducts, toggleLike,
    startReturnFlow,
    toast, showToast,
    mobileMenuOpen, setMobileMenuOpen,
    isAccountMenuOpen, setIsAccountMenuOpen,
    shippingForm, setShippingForm,
    paymentForm, setPaymentForm,
    checkoutStep, setCheckoutStep,
    couponCode, setCouponCode, couponApplied, setCouponApplied, discountAmount, setDiscountAmount,
    formErrors, setFormErrors,
    isProcessingPayment, setIsProcessingPayment, processingStatus, setProcessingStatus,
    copiedPix, setCopiedPix,
    placedOrder, setPlacedOrder,
    historicOrders, setHistoricOrders,
    returnForm, setReturnForm, returnStep, setReturnStep, returnSuccess, setReturnSuccess,
    trackingInput, setTrackingInput,
    shippingCost, finalTotal,
    userProfile, setUserProfile,
    savedAddresses, setSavedAddresses, addAddress, updateAddress, removeAddress,
    setDefaultShippingAddress, setDefaultBillingAddress,
    savedCards, setSavedCards, addCard, removeCard, setDefaultCard,
    preferences, setPreferences,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};
