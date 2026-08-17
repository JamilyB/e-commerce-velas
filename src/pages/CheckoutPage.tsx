import { ChevronLeft, ArrowRight, QrCode, CreditCard, FileText, Check, Copy } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { handleImageError } from '../utils/image';
import { formatCep, formatCpf, formatPhone, formatCardNumber, formatCardExpiry, formatCardCvv } from '../utils/format';
import { validateShipping, validatePayment } from '../utils/validation';
import { PIX_KEY } from '../data/constants';
import { storeService } from '../services/storeService';
import type { HistoricOrder } from '../types';

export const CheckoutPage: React.FC = () => {
  const {
    checkoutStep, setCheckoutStep,
    setActiveTab,
    shippingForm, setShippingForm,
    paymentForm, setPaymentForm,
    formErrors, setFormErrors,
    cart, cartTotal, shippingCost, finalTotal, discountAmount,
    couponCode, setCouponCode, couponApplied, setCouponApplied, setDiscountAmount,
    showToast, copiedPix, setCopiedPix,
    setIsProcessingPayment, setProcessingStatus,
    setPlacedOrder, setHistoricOrders, clearCart,
  } = useStore();

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'ACONCHEGO') {
      setCouponApplied(true);
      setDiscountAmount(cartTotal * 0.15);
      showToast("Cupom ACONCHEGO (15%) aplicado!");
    } else {
      showToast("Cupom inválido. Tente 'ACONCHEGO'");
    }
  };

  const copyPixKey = () => {
    const dummyArea = document.createElement('textarea');
    dummyArea.value = PIX_KEY;
    document.body.appendChild(dummyArea);
    dummyArea.select();
    document.execCommand('copy');
    document.body.removeChild(dummyArea);
    setCopiedPix(true);
    showToast("Chave Pix Copia e Cola copiada!");
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const handlePaymentSubmit = () => {
    if (Object.keys(validatePayment(paymentForm)).length > 0) {
      setFormErrors(validatePayment(paymentForm));
      showToast("Por favor, preencha os dados de pagamento corretamente.");
      return;
    }

    setIsProcessingPayment(true);
    setProcessingStatus("Segurando seus dados de forma segura...");

    setTimeout(() => setProcessingStatus("Preparando sua caixa artesanal com carinho..."), 1500);
    setTimeout(() => setProcessingStatus("Aprovando transação com a operadora..."), 3000);

    setTimeout(() => {
      setIsProcessingPayment(false);
      const randomOrderNumber = Math.floor(100000 + Math.random() * 900000).toString();
      const randomTracking = "SR" + Math.floor(100000000 + Math.random() * 900000000).toString() + "BR";
      const currentDateString = new Date().toLocaleDateString('pt-BR');

      setPlacedOrder({ id: randomOrderNumber, tracking: randomTracking, date: currentDateString });

      const newHistoricEntry: HistoricOrder = {
        id: randomOrderNumber,
        date: currentDateString,
        tracking: randomTracking,
        items: cart.map(item => ({
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          image: item.product.image,
          volume: item.product.weight
        })),
        total: finalTotal,
        status: 'preparation',
        shippingMethod: shippingForm.method === 'express' ? 'Expresso' : 'Padrão'
      };

      setHistoricOrders(prev => [newHistoricEntry, ...prev]);

      // Persist to Supabase (non-blocking — storefront works regardless)
      storeService.saveOrder({
        orderNumber: randomOrderNumber,
        trackingCode: randomTracking,
        customerName: shippingForm.name,
        customerEmail: shippingForm.email,
        customerPhone: shippingForm.phone,
        customerCpf: shippingForm.cpf,
        items: cart.map(item => ({
          productName: item.product.name,
          productImage: item.product.image,
          quantity: item.quantity,
          unitPrice: item.product.price,
          volume: item.product.weight,
        })),
        subtotal: cartTotal,
        shippingCost,
        discount: discountAmount,
        total: finalTotal,
        paymentMethod: paymentForm.method,
        paymentStatus: 'paid',
        shippingAddress: {
          street: `${shippingForm.street}, ${shippingForm.number}`,
          complement: shippingForm.complement,
          city: shippingForm.city,
          state: shippingForm.state,
          cep: shippingForm.cep,
        },
        shippingMethod: shippingForm.method,
        couponCode: couponApplied ? couponCode : null,
      });

      setActiveTab('order-success');
      clearCart();
      showToast("Sua encomenda foi confirmada com muito amor!");
    }, 4500);
  };

  return (
    <div className="animate-fade-in max-w-7xl mx-auto px-6 md:px-12 py-10">
      <div className="flex items-center justify-between border-b border-[#E4C7B7]/30 pb-6 mb-8 text-left">
        <button
          onClick={() => {
            if (checkoutStep > 1) setCheckoutStep(prev => (prev - 1) as 1 | 2);
            else setActiveTab('shop');
          }}
          className="flex items-center gap-2 text-xs font-bold text-[#8B645A]"
        >
          <ChevronLeft size={16} /> <span>Voltar</span>
        </button>
        <div className="flex items-center gap-4 text-xs font-bold">
          <span className={`px-3 py-1.5 rounded-full ${checkoutStep === 1 ? 'bg-[#56443F] text-white' : 'bg-white border'}`}>1. Entrega</span>
          <span className={`px-3 py-1.5 rounded-full ${checkoutStep === 2 ? 'bg-[#56443F] text-white' : 'bg-white border'}`}>2. Pagamento</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
        <div className="lg:col-span-7 bg-white rounded-xl p-6 md:p-8 border border-[#E4C7B7]/25 space-y-6">
          {checkoutStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#56443F]">Identificação & Entrega</h3>
                <p className="text-xs text-[#A28776] font-semibold">Preencha seus dados para receber rituais de luz em casa.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="Nome Completo"
                    value={shippingForm.name}
                    onChange={(e) => {
                      setShippingForm(prev => ({ ...prev, name: e.target.value }));
                      if (formErrors.name) setFormErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.name ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.name && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.name}</p>}
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={shippingForm.email}
                    onChange={(e) => {
                      setShippingForm(prev => ({ ...prev, email: e.target.value }));
                      if (formErrors.email) setFormErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.email ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.email && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.email}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="CPF"
                    value={shippingForm.cpf}
                    onChange={(e) => {
                      setShippingForm(prev => ({ ...prev, cpf: formatCpf(e.target.value) }));
                      if (formErrors.cpf) setFormErrors(prev => ({ ...prev, cpf: '' }));
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.cpf ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.cpf && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.cpf}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Telefone"
                    value={shippingForm.phone}
                    onChange={(e) => {
                      setShippingForm(prev => ({ ...prev, phone: formatPhone(e.target.value) }));
                      if (formErrors.phone) setFormErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.phone ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.phone && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.phone}</p>}
                </div>
              </div>
              <div className="h-px bg-gray-100" />
              <h4 className="font-serif text-lg font-bold">Endereço</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="CEP (Ex: 01001-000)"
                    value={shippingForm.cep}
                    onChange={(e) => {
                      const formatted = formatCep(e.target.value);
                      setShippingForm(prev => ({ ...prev, cep: formatted }));
                      if (formErrors.cep) setFormErrors(prev => ({ ...prev, cep: '' }));
                      if (formatted.replace(/\D/g, '').length === 8) {
                        setShippingForm(prev => ({
                          ...prev,
                          street: 'Alameda das Lavandas',
                          city: 'São Paulo',
                          state: 'SP',
                          complement: 'Casa'
                        }));
                        showToast("Endereço preenchido automaticamente!");
                      }
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.cep ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.cep && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.cep}</p>}
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    placeholder="Rua / Logradouro"
                    value={shippingForm.street}
                    onChange={(e) => {
                      setShippingForm(prev => ({ ...prev, street: e.target.value }));
                      if (formErrors.street) setFormErrors(prev => ({ ...prev, street: '' }));
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.street ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.street && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.street}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Número"
                    value={shippingForm.number}
                    onChange={(e) => {
                      setShippingForm(prev => ({ ...prev, number: e.target.value }));
                      if (formErrors.number) setFormErrors(prev => ({ ...prev, number: '' }));
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.number ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.number && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.number}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Complemento"
                    value={shippingForm.complement}
                    onChange={(e) => setShippingForm(prev => ({ ...prev, complement: e.target.value }))}
                    className="w-full border border-[#E4C7B7]/60 rounded-lg p-3 text-xs"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={shippingForm.city}
                    onChange={(e) => {
                      setShippingForm(prev => ({ ...prev, city: e.target.value }));
                      if (formErrors.city) setFormErrors(prev => ({ ...prev, city: '' }));
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.city ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.city && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.city}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Estado (Ex: SP)"
                    value={shippingForm.state}
                    onChange={(e) => {
                      setShippingForm(prev => ({ ...prev, state: e.target.value }));
                      if (formErrors.state) setFormErrors(prev => ({ ...prev, state: '' }));
                    }}
                    className={`w-full border rounded-lg p-3 text-xs ${formErrors.state ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                  />
                  {formErrors.state && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.state}</p>}
                </div>
              </div>

              <button
                onClick={() => {
                  const errors = validateShipping(shippingForm);
                  if (Object.keys(errors).length === 0) {
                    setFormErrors({});
                    setCheckoutStep(2);
                  } else {
                    setFormErrors(errors);
                    showToast("Por favor, preencha corretamente os campos em destaque.");
                  }
                }}
                className="w-full py-3.5 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg flex justify-center items-center gap-2"
              >
                <span>Ir para o Pagamento</span> <ArrowRight size={14} />
              </button>
            </div>
          )}

          {checkoutStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#56443F]">Meio de Pagamento</h3>
                <p className="text-xs text-[#A28776] font-semibold">Ambiente criptografado e 100% seguro.</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => setPaymentForm(prev => ({ ...prev, method: 'pix' }))} className={`py-3.5 rounded-xl border flex flex-col items-center gap-1.5 ${paymentForm.method === 'pix' ? 'border-[#8B645A] bg-[#E4C7B7]/10 text-[#8B645A]' : 'bg-[#FAF9F5]'}`}>
                  <QrCode size={18} /> <span className="text-[10px] font-bold uppercase">Pix</span>
                </button>
                <button onClick={() => setPaymentForm(prev => ({ ...prev, method: 'card' }))} className={`py-3.5 rounded-xl border flex flex-col items-center gap-1.5 ${paymentForm.method === 'card' ? 'border-[#8B645A] bg-[#E4C7B7]/10 text-[#8B645A]' : 'bg-[#FAF9F5]'}`}>
                  <CreditCard size={18} /> <span className="text-[10px] font-bold uppercase">Cartão</span>
                </button>
                <button onClick={() => setPaymentForm(prev => ({ ...prev, method: 'boleto' }))} className={`py-3.5 rounded-xl border flex flex-col items-center gap-1.5 ${paymentForm.method === 'boleto' ? 'border-[#8B645A] bg-[#E4C7B7]/10 text-[#8B645A]' : 'bg-[#FAF9F5]'}`}>
                  <FileText size={18} /> <span className="text-[10px] font-bold uppercase">Boleto</span>
                </button>
              </div>

              {paymentForm.method === 'pix' && (
                <div className="bg-[#FAF9F5] p-5 rounded-xl border border-[#E4C7B7]/30 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-white p-2 rounded-lg border w-24 h-24 flex items-center justify-center flex-shrink-0">
                      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="10" y="10" width="20" height="20" />
                        <rect x="70" y="10" width="20" height="20" />
                        <rect x="10" y="70" width="20" height="20" />
                        <rect x="40" y="40" width="20" height="20" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#56443F]">Pagamento instantâneo por Pix</h4>
                      <p className="text-[11px] text-[#A28776] leading-relaxed">Escaneie o QR Code ou use o Copia e Cola. O pedido será processado imediatamente após a confirmação automática bancária.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" readOnly value={PIX_KEY} className="w-full bg-white border rounded-lg px-3 py-2 text-[10px] font-mono truncate" />
                    <button onClick={copyPixKey} className="bg-[#56443F] text-white p-2.5 rounded-lg flex items-center justify-center">
                      {copiedPix ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              )}

              {paymentForm.method === 'card' && (
                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Nome Impresso no Cartão"
                      value={paymentForm.cardName}
                      onChange={(e) => {
                        setPaymentForm(prev => ({ ...prev, cardName: e.target.value.toUpperCase() }));
                        if (formErrors.cardName) setFormErrors(prev => ({ ...prev, cardName: '' }));
                      }}
                      className={`w-full border rounded-lg p-3 text-xs ${formErrors.cardName ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                    />
                    {formErrors.cardName && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.cardName}</p>}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Número do Cartão"
                      value={paymentForm.cardNumber}
                      onChange={(e) => {
                        setPaymentForm(prev => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }));
                        if (formErrors.cardNumber) setFormErrors(prev => ({ ...prev, cardNumber: '' }));
                      }}
                      className={`w-full border rounded-lg p-3 text-xs font-mono ${formErrors.cardNumber ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                    />
                    {formErrors.cardNumber && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.cardNumber}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Validade (MM/AA)"
                        value={paymentForm.cardExpiry}
                        onChange={(e) => {
                          setPaymentForm(prev => ({ ...prev, cardExpiry: formatCardExpiry(e.target.value) }));
                          if (formErrors.cardExpiry) setFormErrors(prev => ({ ...prev, cardExpiry: '' }));
                        }}
                        className={`w-full border rounded-lg p-3 text-xs font-mono ${formErrors.cardExpiry ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                      />
                      {formErrors.cardExpiry && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.cardExpiry}</p>}
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="CVV"
                        value={paymentForm.cardCvv}
                        onChange={(e) => {
                          setPaymentForm(prev => ({ ...prev, cardCvv: formatCardCvv(e.target.value) }));
                          if (formErrors.cardCvv) setFormErrors(prev => ({ ...prev, cardCvv: '' }));
                        }}
                        className={`w-full border rounded-lg p-3 text-xs font-mono ${formErrors.cardCvv ? 'border-[#8B645A] bg-[#8B645A]/5' : 'border-[#E4C7B7]/60'}`}
                      />
                      {formErrors.cardCvv && <p className="text-[#8B645A] text-[10px] mt-1 pl-1 font-semibold">{formErrors.cardCvv}</p>}
                    </div>
                  </div>
                </div>
              )}

              {paymentForm.method === 'boleto' && (
                <div className="bg-[#FAF9F5] p-5 rounded-xl border border-[#E4C7B7]/30 text-center py-6">
                  <p className="text-xs text-[#56443F] font-bold">O boleto será gerado ao concluir seu pedido.</p>
                  <p className="text-[11px] text-[#A28776] leading-relaxed">Você poderá pagar no internet banking. A confirmação ocorre de 1 a 2 dias úteis.</p>
                </div>
              )}

              <button onClick={handlePaymentSubmit} className="w-full py-3.5 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg">
                Confirmar e Pagar R$ {finalTotal.toFixed(2)}
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-[#E4C7B7]/20 space-y-6 lg:sticky lg:top-24">
          <h3 className="font-serif text-lg font-bold border-b pb-3">Resumo da Encomenda</h3>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-1">
            {cart.map((item, index) => (
              <div key={`${item.product.id}-${index}`} className="flex gap-3 items-center border-b pb-3 text-xs">
                <div className="w-10 h-12 bg-[#F1F0E2]/30 border rounded-md flex-shrink-0 p-0.5">
                  <img src={item.product.image} alt={item.product.name} onError={(e) => handleImageError(e, item.product.id)} className="w-full h-full object-cover rounded-sm" />
                </div>
                <div className="flex-grow">
                  <div className="flex justify-between font-bold">
                    <span>{item.product.name}</span>
                    <span>R$ {(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] text-[#A28776]">Qtd: {item.quantity} {item.selectedGiftWrap && '• Embrulho de Linho'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-bold uppercase text-[#8B645A]">Cupom de Desconto</label>
            <div className="flex gap-2">
              <input type="text" placeholder="Ex: ACONCHEGO" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} disabled={couponApplied} className="w-full bg-[#FAF9F5] border rounded-lg px-3 py-2 text-xs font-bold" />
              <button onClick={applyCoupon} disabled={couponApplied} className="bg-[#56443F] text-white text-[10px] uppercase font-bold px-4 rounded-lg">Aplicar</button>
            </div>
          </div>

          <div className="border-t pt-4 space-y-2 text-xs font-semibold text-[#A28776]">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-[#56443F]">R$ {cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Frete:</span>
              <span className="text-[#56443F]">R$ {shippingCost.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-[#8B645A]">
                <span>Desconto Cupom:</span>
                <span>- R$ {discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between items-baseline">
              <span className="font-serif font-bold text-[#56443F]">Total do Pedido:</span>
              <span className="font-serif text-xl font-bold text-[#8B645A]">R$ {finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
