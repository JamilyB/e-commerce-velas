import { Check } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { storeService } from '../services/storeService';

export const ReturnsPage: React.FC = () => {
  const {
    returnForm, setReturnForm,
    returnStep, setReturnStep,
    returnSuccess, setReturnSuccess,
    historicOrders,
    showToast, setActiveTab,
    userProfile,
  } = useStore();

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-6 py-16 text-left space-y-12">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold tracking-widest text-[#8B645A] uppercase">Suporte e Carinho</span>
        <h2 className="font-serif text-3xl font-semibold text-[#56443F]">Trocas & Devoluções</h2>
        <p className="text-xs text-[#A28776] font-semibold">Queremos que sua experiência seja perfeita. Siga os passos simples para realizar sua devolução de forma aconchegante.</p>
      </div>

      <div className="max-w-xl mx-auto flex justify-between items-center text-xs font-bold border-b border-[#E4C7B7]/20 pb-6 mb-8">
        <span className={`px-3 py-1.5 rounded-full ${returnStep === 1 ? 'bg-[#56443F] text-white' : 'bg-white border text-[#A28776]'}`}>1. Identificação</span>
        <span className={`px-3 py-1.5 rounded-full ${returnStep === 2 ? 'bg-[#56443F] text-white' : 'bg-white border text-[#A28776]'}`}>2. Itens & Motivo</span>
        <span className={`px-3 py-1.5 rounded-full ${returnStep === 3 ? 'bg-[#56443F] text-white' : 'bg-white border text-[#A28776]'}`}>3. Reembolso</span>
        <span className={`px-3 py-1.5 rounded-full ${returnStep === 4 ? 'bg-[#56443F] text-white' : 'bg-white border text-[#A28776]'}`}>4. Conclusão</span>
      </div>

      <div className="bg-white rounded-2xl p-6 md:p-8 border border-[#E4C7B7]/25 max-w-xl mx-auto space-y-6">
        {returnStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#56443F]">Localizar Encomenda</h3>
              <p className="text-xs text-[#A28776] font-medium">Informe os dados da sua compra para iniciar o atendimento.</p>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Número do Pedido (Ex: 582910)"
                value={returnForm.orderId}
                onChange={(e) => setReturnForm(prev => ({ ...prev, orderId: e.target.value }))}
                className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-3 text-xs font-semibold"
              />
              <input
                type="email"
                placeholder="E-mail de cadastro"
                value={returnForm.email}
                onChange={(e) => setReturnForm(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-3 text-xs font-semibold"
              />
            </div>
            <button
              onClick={() => {
                const match = historicOrders.find(o => o.id === returnForm.orderId.trim());
                if (match) {
                  setReturnForm(prev => ({
                    ...prev,
                    items: match.items.map(item => ({
                      productName: item.productName,
                      quantity: item.quantity,
                      selected: true,
                      reason: 'Aroma não atingiu as expectativas'
                    }))
                  }));
                  setReturnStep(2);
                  showToast("Pedido localizado! Selecione os itens para devolução.");
                } else {
                  showToast("Pedido não encontrado no histórico. Tente usar '582910' como exemplo.");
                }
              }}
              className="w-full py-3 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg transition-colors"
            >
              Buscar Pedido
            </button>
          </div>
        )}

        {returnStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#56443F]">Selecione os Produtos</h3>
              <p className="text-xs text-[#A28776] font-medium">Marque os itens que deseja devolver e nos conte o motivo.</p>
            </div>

            <div className="space-y-4">
              {returnForm.items.map((item, index) => (
                <div key={index} className="p-4 rounded-xl border border-[#E4C7B7]/30 bg-[#FAF9F5] space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={(e) => {
                        const updated = [...returnForm.items];
                        updated[index].selected = e.target.checked;
                        setReturnForm(prev => ({ ...prev, items: updated }));
                      }}
                      className="w-4 h-4 rounded text-[#8B645A] focus:ring-[#8B645A]"
                    />
                    <div className="text-xs font-bold text-[#56443F]">{item.productName}</div>
                  </div>

                  {item.selected && (
                    <div className="space-y-2 pl-7">
                      <label className="text-[10px] uppercase text-[#8B645A] font-bold">Motivo da devolução</label>
                      <select
                        value={item.reason}
                        onChange={(e) => {
                          const updated = [...returnForm.items];
                          updated[index].reason = e.target.value;
                          setReturnForm(prev => ({ ...prev, items: updated }));
                        }}
                        className="w-full bg-white border border-[#E4C7B7]/60 rounded-md p-2 text-xs font-semibold text-[#56443F]"
                      >
                        <option value="Aroma não atingiu as expectativas">Aroma não atingiu as expectativas</option>
                        <option value="Produto chegou danificado">Produto chegou danificado ou quebrado</option>
                        <option value="Embalagem violada">Embalagem ou pote danificado</option>
                        <option value="Arrependimento da compra">Arrependimento / Outro motivo</option>
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase text-[#8B645A] font-bold">Comentários Adicionais (Opcional)</label>
              <textarea
                placeholder="Conte-nos um pouco mais sobre sua experiência..."
                value={returnForm.comments}
                onChange={(e) => setReturnForm(prev => ({ ...prev, comments: e.target.value }))}
                rows={3}
                className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/60 rounded-lg p-3 text-xs font-semibold"
              />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReturnStep(1)} className="w-1/2 py-3 bg-white text-[#56443F] border border-[#E4C7B7] text-xs font-bold uppercase rounded-lg transition-colors">
                Voltar
              </button>
              <button
                onClick={() => {
                  const selectedCount = returnForm.items.filter(i => i.selected).length;
                  if (selectedCount === 0) {
                    showToast("Por favor, selecione pelo menos um item para devolução.");
                    return;
                  }
                  setReturnStep(3);
                }}
                className="w-1/2 py-3 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg transition-colors"
              >
                Avançar
              </button>
            </div>
          </div>
        )}

        {returnStep === 3 && (
          <div className="space-y-5">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-[#56443F]">Escolha o método de devolução</h3>
              <p className="text-xs text-[#A28776] font-medium">Selecione como deseja receber o reembolso correspondente.</p>
            </div>

            <div className="space-y-3">
              <div
                onClick={() => setReturnForm(prev => ({ ...prev, refundMethod: 'store_credit' }))}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${returnForm.refundMethod === 'store_credit' ? 'border-[#8B645A] bg-[#E4C7B7]/10' : 'border-[#E4C7B7]/30 bg-[#FAF9F5]'}`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#56443F]">Crédito no Atelier (Cupom)</span>
                  <span className="text-[9px] bg-[#8B645A] text-white px-2 py-0.5 rounded-sm font-bold uppercase">+10% de Bônus</span>
                </div>
                <p className="text-[11px] text-[#A28776] mt-1 font-medium">Receba um cupom de compras imediatamente após a postagem, com um bônus de 10% adicional pelo carinho.</p>
              </div>

              <div
                onClick={() => setReturnForm(prev => ({ ...prev, refundMethod: 'pix' }))}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${returnForm.refundMethod === 'pix' ? 'border-[#8B645A] bg-[#E4C7B7]/10' : 'border-[#E4C7B7]/30 bg-[#FAF9F5]'}`}
              >
                <span className="text-xs font-bold text-[#56443F]">Estorno no Meio de Pagamento Original</span>
                <p className="text-[11px] text-[#A28776] mt-1 font-medium">O reembolso será processado diretamente na sua conta Pix ou estornado na fatura do cartão em até 5 dias úteis após a chegada do produto.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setReturnStep(2)} className="w-1/2 py-3 bg-white text-[#56443F] border border-[#E4C7B7] text-xs font-bold uppercase rounded-lg transition-colors">
                Voltar
              </button>
              <button
                onClick={() => {
                  const randomAuthCode = "DEVOL-" + Math.floor(100000 + Math.random() * 900000);
                  const expDate = new Date();
                  expDate.setDate(expDate.getDate() + 7);

                  // Persist return request to Supabase (non-blocking)
                  const selectedItems = returnForm.items.filter(i => i.selected);
                  const refundAmount = selectedItems.reduce((sum, i) => {
                    const order = historicOrders.find(o => o.id === returnForm.orderId);
                    const item = order?.items.find(it => it.productName === i.productName);
                    return sum + (item ? item.price * i.quantity : 0);
                  }, 0);

                  storeService.saveReturn({
                    returnCode: randomAuthCode,
                    orderNumber: returnForm.orderId,
                    customerName: userProfile.fullName,
                    customerEmail: userProfile.email,
                    reason: selectedItems[0]?.reason ?? 'Não especificado',
                    refundMethod: returnForm.refundMethod,
                    refundAmount,
                    items: selectedItems.map(i => ({
                      productName: i.productName,
                      quantity: i.quantity,
                      reason: i.reason,
                    })),
                  });

                  setReturnSuccess({
                    code: randomAuthCode,
                    expiration: expDate.toLocaleDateString('pt-BR')
                  });
                  setReturnStep(4);
                  showToast("Solicitação concluída com muito carinho!");
                }}
                className="w-1/2 py-3 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg transition-colors"
              >
                Concluir Solicitação
              </button>
            </div>
          </div>
        )}

        {returnStep === 4 && returnSuccess && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="bg-[#E4C7B7]/30 p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-[#8B645A]">
                <Check size={22} />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#56443F]">Solicitação Registrada!</h3>
              <p className="text-xs text-[#A28776] font-medium leading-relaxed">
                Geramos seu código de postagem reversa sem custos. O aconchego do seu processo está garantido!
              </p>
            </div>

            <div className="p-4 bg-[#FAF9F5] border border-[#E4C7B7]/40 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-[10px] text-[#A28776] font-bold uppercase">Código de Autorização</span>
                <span className="font-mono font-bold text-[#8B645A] text-sm">{returnSuccess.code}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-[#56443F]">
                <span>Válido até:</span>
                <span>{returnSuccess.expiration}</span>
              </div>
              <div className="text-[10px] text-[#A28776] leading-relaxed">
                Leve os produtos devidamente embalados até qualquer agência dos Correios e apresente este código. Não há nenhuma cobrança pelo envio!
              </div>
            </div>

            <div className="bg-[#E4C7B7]/15 p-4 rounded-xl border border-dashed border-[#E4C7B7]/50 text-xs text-[#56443F] space-y-2 leading-relaxed">
              <h4 className="font-serif font-bold text-[#8B645A]">Instruções de Embalagem Aconchegante:</h4>
              <p>Recomendamos utilizar a mesma caixa Kraft e o papel colmeia protetor em que suas velas chegaram.</p>
              <p>Certifique-se de preencher espaços vazios com papel amassado para que o vidro temperado viaje em total segurança de volta para nós.</p>
            </div>

            <button
              onClick={() => {
                setReturnStep(1);
                setActiveTab('home');
              }}
              className="w-full py-3 bg-[#56443F] hover:bg-[#8B645A] text-white text-xs font-bold uppercase rounded-lg transition-colors"
            >
              Voltar para a Página Inicial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
