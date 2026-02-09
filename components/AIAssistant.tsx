
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { Icons } from '../constants';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Olá Sensei! Sou o seu assistente virtual do OssFlow App. Posso ajudar com técnicas de treino, análise de alunos ou gestão da sua academia. O que deseja saber hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const aiResponse = await geminiService.getSenseiAdvice(userMessage);
    
    setMessages(prev => [...prev, { role: 'ai', content: aiResponse || "Opa, perdi o fôlego aqui no tatame. Pode repetir?" }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-12rem)] flex flex-col bg-white rounded-2xl lg:rounded-3xl shadow-xl border border-zinc-100 overflow-hidden animate-in slide-in-from-right-4 duration-500 mb-20 lg:mb-0">
      <div className="p-4 lg:p-6 bg-zinc-950 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg lg:rounded-xl flex items-center justify-center text-black shadow-lg shadow-white/10">
            <Icons.Bot />
          </div>
          <div>
            <h2 className="font-bold text-sm lg:text-base">Sensei <span className="text-zinc-400">AI</span></h2>
            <p className="text-[10px] text-zinc-500 font-bold uppercase flex items-center gap-1 tracking-tighter sm:tracking-normal">
              <span className="w-1.5 h-1.5 bg-zinc-100 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6 bg-zinc-50/30"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] lg:max-w-[80%] p-3 lg:p-4 rounded-2xl shadow-sm text-sm lg:text-base leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-zinc-950 text-white font-bold rounded-tr-none' 
                : 'bg-white text-zinc-700 border border-zinc-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-zinc-100 p-3 rounded-2xl flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full animate-bounce delay-75"></div>
              <div className="w-1.5 h-1.5 bg-zinc-950 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 lg:p-6 bg-white border-t border-zinc-100">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Pergunte ao Sensei..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-950/10 transition-all text-sm placeholder:text-zinc-300"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-zinc-950 text-white w-10 h-10 lg:w-auto lg:px-6 rounded-xl font-bold hover:bg-black transition-all shadow-lg shadow-zinc-950/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="hidden lg:inline">Enviar</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
