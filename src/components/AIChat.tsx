import { useEffect } from 'react';
import { MessageSquare, X, Sparkles, Send } from 'lucide-react';
import { useAI } from '../hooks/useAI';

export const AIChat: React.FC = () => {
  const {
    isAiOpen, setIsAiOpen,
    aiMessages,
    userInputMessage, setUserInputMessage,
    isAiLoading,
    chatEndRef,
    handleSendAiMessage,
  } = useAI();

  useEffect(() => {
    const handler = () => setIsAiOpen(true);
    window.addEventListener('open-ai-chat', handler);
    return () => window.removeEventListener('open-ai-chat', handler);
  }, [setIsAiOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isAiOpen ? (
        <button
          onClick={() => setIsAiOpen(true)}
          className="bg-[#56443F] hover:bg-[#8B645A] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition-all group scale-100 hover:scale-105 active:scale-95 duration-300"
        >
          <MessageSquare size={20} className="text-[#E4C7B7]" />
          <span className="text-xs font-bold uppercase tracking-wider pr-1 hidden sm:inline">Iniciar Conversa</span>
        </button>
      ) : (
        <div className="w-[340px] sm:w-[400px] h-[500px] bg-[#F1F0E2] border border-[#E4C7B7] rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in">
          <div className="bg-white px-5 py-4 border-b border-[#E4C7B7]/40 flex justify-between items-center text-left">
            <div className="flex items-center gap-2.5">
              <div className="bg-[#E4C7B7]/45 p-2 rounded-full text-[#8B645A]">
                <Sparkles size={16} />
              </div>
              <div>
                <h4 className="font-serif font-bold text-sm text-[#56443F]">Consultoria Virtual</h4>
                <p className="text-[10px] text-[#A28776] font-semibold">Descubra sua vela ideal</p>
              </div>
            </div>
            <button
              onClick={() => setIsAiOpen(false)}
              className="text-[#56443F] hover:bg-[#E4C7B7]/20 p-1.5 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4 text-xs text-left">
            {aiMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.sender === 'user' ? 'bg-[#56443F] text-white rounded-tr-none' : 'bg-white border text-[#56443F] rounded-tl-none'}`}>
                  <p className="leading-relaxed font-semibold">{msg.text}</p>
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#8B645A] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#8B645A] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-[#8B645A] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="px-4 py-2 flex gap-1.5 overflow-x-auto bg-white/40 border-t border-[#E4C7B7]/20">
            <button
              onClick={() => handleSendAiMessage(undefined, "Quero uma vela para relaxar e dormir.")}
              className="flex-shrink-0 bg-white border text-[10px] font-bold px-2.5 py-1 rounded-full text-[#8B645A]"
            >
              Para relaxar
            </button>
            <button
              onClick={() => handleSendAiMessage(undefined, "Qual vela combina com café da manhã?")}
              className="flex-shrink-0 bg-white border text-[10px] font-bold px-2.5 py-1 rounded-full text-[#8B645A]"
            >
              Café da manhã
            </button>
            <button
              onClick={() => handleSendAiMessage(undefined, "Estou procurando um presente romântico.")}
              className="flex-shrink-0 bg-white border text-[10px] font-bold px-2.5 py-1 rounded-full text-[#8B645A]"
            >
              Presente doce
            </button>
          </div>

          <form onSubmit={handleSendAiMessage} className="bg-white p-3 border-t border-[#E4C7B7]/40 flex gap-2">
            <input
              type="text"
              placeholder="Ex: Quero um aroma doce para a sala..."
              value={userInputMessage}
              onChange={(e) => setUserInputMessage(e.target.value)}
              className="w-full bg-[#FAF9F5] border border-[#E4C7B7]/50 rounded-lg px-3 py-2 text-xs outline-hidden text-[#56443F]"
            />
            <button
              type="submit"
              className="bg-[#56443F] hover:bg-[#8B645A] text-white p-2.5 rounded-lg transition-colors flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
