
import React, { useState, useRef, useEffect } from 'react';
import { generateChefResponse } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Send, User, Sparkles } from 'lucide-react';

interface AiAssistantProps {
  onLoadingStateChange?: (isLoading: boolean) => void;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ onLoadingStateChange }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'سلام! من دستیار سرآشپز شما هستم. چطور می‌توانم در خرید لوازم یا آشپزی به شما کمک کنم؟' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex-1 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-500">
        {/* Header */}
        <div className="p-4 bg-gradient-to-l from-primary to-orange-400 text-white flex items-center">
          <div className="p-2 bg-white/20 rounded-full ml-3">
            <Sparkles size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">دستیار هوشمند آشپزخونه</h2>
            <p className="text-orange-50 text-xs">پاسخگویی سریع با هوش مصنوعی</p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div 
                className={`max-w-[80%] p-4 rounded-2xl ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="flex items-center mb-1 opacity-70 text-xs">
                  {msg.role === 'user' ? <User size={12} className="ml-1" /> : <Sparkles size={12} className="ml-1" />}
                  <span>{msg.role === 'user' ? 'شما' : 'دستیار'}</span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="سوال خود را بپرسید..."
              className="flex-1 p-3 bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-primary focus:bg-white transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-primary text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
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
