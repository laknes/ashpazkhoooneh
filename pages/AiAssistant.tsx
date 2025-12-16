
import React, { useState, useRef, useEffect } from 'react';
import { generateChefResponse, isAiConfigured } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Sparkles, BotOff } from 'lucide-react';

interface AiAssistantProps {
  onLoadingStateChange?: (isLoading: boolean) => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onLoadingStateChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'سلام! من دستیار سرآشپز شما هستم. چطور می‌توانم در خرید لوازم یا آشپزی به شما کمک کنم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      setIsApiAvailable(isAiConfigured());
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);
    if (onLoadingStateChange) onLoadingStateChange(true);

    try {
      const response = await generateChefResponse(userText);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'خطایی رخ داد.', isError: true }]);
    } finally {
      setIsLoading(false);
      if (onLoadingStateChange) onLoadingStateChange(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isApiAvailable) {
      return (
        <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md w-full relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 to-gray-300"></div>
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400 border border-gray-100">
                    <BotOff size={40} strokeWidth={1.5} />
                </div>
                <h2 className="text-xl font-black text-gray-800 mb-3">دستیار هوشمند غیرفعال است</h2>
                <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                    سرویس هوش مصنوعی در حال حاضر در دسترس نیست. این ممکن است به دلیل عدم تنظیمات صحیح یا مشکل موقتی سرور باشد.
                </p>
                <div className="bg-orange-50 text-orange-800 text-xs py-3 px-4 rounded-xl font-medium inline-block border border-orange-100">
                    وضعیت: API Key Missing
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* Header */}
        <div className="p-4 bg-gradient-to-l from-primary to-orange-400 text-white flex items-center shadow-sm z-10">
          <div className="p-2 bg-white/20 rounded-full ml-3 backdrop-blur-sm">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">دستیار هوشمند آشپزخونه</h2>
            <p className="text-orange-50 text-xs">پاسخگویی سریع با هوش مصنوعی</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div 
                className={`max-w-[85%] p-4 rounded-2xl text-sm leading-7 shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}
              >
                <div className={`flex items-center mb-1 text-xs font-bold ${msg.role === 'user' ? 'text-orange-100' : 'text-primary'}`}>
                  {msg.role === 'user' ? <User size={12} className="ml-1" /> : <Sparkles size={12} className="ml-1" />}
                  <span>{msg.role === 'user' ? 'شما' : 'دستیار'}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="سوال خود را بپرسید..."
              className="flex-1 p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none text-sm text-gray-700 placeholder-gray-400"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3.5 bg-primary text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:scale-105 active:scale-95"
            >
              <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
