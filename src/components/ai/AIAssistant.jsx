import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, User, Sparkles, Loader2 } from 'lucide-react';
import { GlassCard, GlassButton } from '../common/UIComponents';

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hi there! I'm your LocalConnect AI travel assistant. I can help you find locals, plan your itinerary, or give you city recommendations. What's on your mind?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
      const response = await fetch(`${backendUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: userMsg.text }),
      });

      const data = await response.json();

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply || data.error || 'Sorry, I could not process your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('Failed to communicate with AI:', error);
      const errorMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "I'm having trouble connecting to the server right now. Please make sure the backend is running and you have configured the GEMINI_API_KEY.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        className={`fixed bottom-8 right-8 z-50 flex items-center justify-center p-4 rounded-full shadow-[0_0_30px_rgba(139,92,246,0.6)] backdrop-blur-2xl border border-white/20 transition-all duration-500 group ${
          isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
        } bg-gradient-to-br from-brand via-vibrant-indigo to-accent text-white hover:shadow-[0_0_50px_rgba(139,92,246,1)] animate-floatOrb`}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
      >
        {/* Glow & Liquid effect behind the button */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand to-accent opacity-50 blur-xl animate-pulseGlow transition-opacity duration-500"></div>
        <div className="absolute inset-0 rounded-full border border-white/40 group-hover:scale-110 transition-transform duration-500"></div>
        
        {/* Tooltip */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.4)] opacity-0 group-hover:opacity-100 group-hover:-translate-y-2 transition-all duration-500 whitespace-nowrap pointer-events-none border border-white/50 backdrop-blur-md">
          Ask AI ✨
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <Bot size={32} className="drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] group-hover:scale-110 transition-transform duration-500" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute -top-2 -right-2 text-accent-light drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]"
          >
            <Sparkles size={16} />
          </motion.div>
        </div>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] h-[600px] max-h-[calc(100vh-100px)] flex flex-col"
          >
            <GlassCard className="p-0 flex flex-col h-full overflow-hidden border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] bg-black/60 rounded-[2.5rem]">
              {/* Header */}
              <div className="bg-gradient-to-r from-brand/20 to-vibrant-indigo/20 backdrop-blur-3xl p-5 flex justify-between items-center border-b border-white/10 shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5 noise-bg" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-2.5 bg-gradient-to-br from-brand to-accent rounded-xl shadow-[0_0_15px_rgba(225,29,72,0.4)]">
                    <Bot size={22} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-black tracking-wide">AI Travel Assistant</h3>
                    <p className="text-brand-light text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-light animate-pulse"></span> Online
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white border border-white/10 relative z-10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/20 scrollbar-hide">
                {messages.map((msg) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="shrink-0 mt-auto">
                        {msg.sender === 'user' ? (
                          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                            <User size={12} className="text-white/70" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center border border-white/20">
                            <Bot size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className={`group flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div 
                          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            msg.sender === 'user' 
                            ? 'bg-brand text-white rounded-br-sm' 
                            : 'bg-white/10 text-white/90 border border-white/10 rounded-bl-sm backdrop-blur-md'
                          }`}
                        >
                          {/* Simple render of text, optionally you could use a markdown parser here */}
                          <div className="whitespace-pre-wrap">{msg.text}</div>
                        </div>
                        <span className="text-[10px] text-white/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="flex gap-2 max-w-[85%] flex-row">
                      <div className="shrink-0 mt-auto">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand to-accent flex items-center justify-center border border-white/20">
                          <Bot size={12} className="text-white" />
                        </div>
                      </div>
                      <div className="px-4 py-3 rounded-2xl bg-white/10 border border-white/10 rounded-bl-sm backdrop-blur-md flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-5 bg-black/60 border-t border-white/5 backdrop-blur-2xl shrink-0">
                <form onSubmit={handleSendMessage} className="relative flex items-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-vibrant-indigo/10 blur-md rounded-full pointer-events-none" />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-14 text-[15px] text-white placeholder-white/30 focus:outline-none focus:border-brand/40 focus:bg-white/10 transition-all shadow-inner relative z-10"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="absolute right-2 p-3 rounded-full bg-gradient-to-tr from-brand to-vibrant-pink text-white hover:scale-105 disabled:scale-100 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] z-20"
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
