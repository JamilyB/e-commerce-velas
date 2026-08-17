import { useStore } from '../context/StoreContext';

export const PaymentProcessingModal: React.FC = () => {
  const { isProcessingPayment, processingStatus } = useStore();

  if (!isProcessingPayment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#56443F]/60 backdrop-blur-md">
      <div className="bg-[#F1F0E2] max-w-sm w-full p-8 rounded-2xl border border-[#E4C7B7]/40 text-center space-y-4">
        <div className="relative w-12 h-12 mx-auto">
          <div className="absolute inset-0 border-4 border-[#E4C7B7]/40 rounded-full" />
          <div className="absolute inset-0 border-4 border-[#8B645A] border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="space-y-1">
          <h4 className="font-serif text-lg font-bold text-[#56443F]">Processando...</h4>
          <p className="text-xs text-[#A28776] font-semibold animate-pulse">{processingStatus}</p>
        </div>
      </div>
    </div>
  );
};
