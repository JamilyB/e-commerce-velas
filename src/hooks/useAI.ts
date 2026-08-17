import { useState, useRef, useEffect, useCallback } from 'react';
import type { Message } from '../types';
import { SYSTEM_INSTRUCTION } from '../data/constants';

export const useAI = () => {
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Olá! Vou ajudar você a encontrar a fragrância ideal para o seu ambiente. O que você procura sentir em sua casa?',
      timestamp: new Date()
    }
  ]);
  const [userInputMessage, setUserInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [aiMessages, isAiLoading]);

  const handleSendAiMessage = useCallback(async (e?: React.FormEvent, presetText?: string) => {
    if (e) e.preventDefault();
    const textToSend = presetText || userInputMessage;
    if (!textToSend.trim() || isAiLoading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setAiMessages(prev => [...prev, userMsg]);
    if (!presetText) setUserInputMessage('');
    setIsAiLoading(true);

    try {
      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const historyContext = aiMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      historyContext.push({
        role: 'user',
        parts: [{ text: textToSend }]
      });

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: historyContext,
          systemInstruction: {
            parts: [{ text: SYSTEM_INSTRUCTION }]
          }
        })
      });

      const result = await response.json();
      const rawResponseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: rawResponseText || "Peço desculpas, senti uma leve oscilação da minha conexão. Poderia repetir por favor?",
        timestamp: new Date()
      };

      setAiMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: Math.random().toString(),
        sender: 'ai',
        text: "Houve um breve problema ao tentar conectar com nosso site. Que tal tentarmos novamente?",
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsAiLoading(false);
    }
  }, [userInputMessage, isAiLoading, aiMessages]);

  return {
    isAiOpen, setIsAiOpen,
    aiMessages, setAiMessages,
    userInputMessage, setUserInputMessage,
    isAiLoading,
    chatEndRef,
    handleSendAiMessage,
  };
};
