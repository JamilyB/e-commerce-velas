import { StoreProvider, useStore } from './context/StoreContext';
import { useFonts } from './hooks/useFonts';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { CartDrawer } from './components/CartDrawer';
import { ProductModal } from './components/ProductModal';
import { PaymentProcessingModal } from './components/PaymentProcessingModal';
import { AIChat } from './components/AIChat';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { TrackingPage } from './pages/TrackingPage';
import { OrdersPage } from './pages/OrdersPage';
import { ReturnsPage } from './pages/ReturnsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminApp } from './admin/AdminApp';
import { Flame } from 'lucide-react';

function isAdminRoute() {
  return window.location.pathname.startsWith('/admin');
}

function AppContent() {
  useFonts();
  const { activeTab } = useStore();

  const renderPage = () => {
    switch (activeTab) {
      case 'home': return <HomePage />;
      case 'shop': return <ShopPage />;
      case 'checkout': return <CheckoutPage />;
      case 'order-success': return <OrderSuccessPage />;
      case 'tracking': return <TrackingPage />;
      case 'orders': return <OrdersPage />;
      case 'returns': return <ReturnsPage />;
      case 'profile': return <ProfilePage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F0E2] text-[#56443F] font-['Plus_Jakarta_Sans'] selection:bg-[#E4C7B7] selection:text-[#56443F] relative overflow-x-hidden flex flex-col justify-between">
      <Toast />

      <div className="bg-[#E4C7B7] text-[#56443F] py-2 px-4 text-center text-[11px] font-bold tracking-wide flex justify-center items-center gap-2">
        <Flame size={12} className="text-[#8B645A]" />
        <span>Velas aromáticas esculpidas à mão • Frete grátis em pedidos acima de R$ 180</span>
      </div>

      <Header />

      <main className="flex-grow">
        {renderPage()}
      </main>

      <Footer />

      <PaymentProcessingModal />
      <ProductModal />
      <CartDrawer />
      <AIChat />
    </div>
  );
}

function App() {
  if (isAdminRoute()) {
    return <AdminApp />;
  }
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}

export default App;
