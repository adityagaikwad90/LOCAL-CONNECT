import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, Phone, Image as ImageIcon, Smile, ArrowLeft, MessageSquare, Mic, Paperclip, CheckCheck, Sparkles, Circle } from 'lucide-react';
import { GlassCard } from '../components/common/UIComponents';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, query, where, onSnapshot, orderBy, 
  addDoc, serverTimestamp, getDoc, getDocs, doc 
} from 'firebase/firestore';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

const fallbackImage = 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=1920&q=80';

// Connect to our custom Socket.io server
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
const socket = io(SOCKET_URL);

const Chat = () => {
  const { currentUser, userData } = useAuth();
  const { userId: urlUserId } = useParams();
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [userCache, setUserCache] = useState({});
  const [loadingChats, setLoadingChats] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Unread', 'Groups', 'AI'];
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chats list (We still use Firebase onSnapshot here so the sidebar updates automatically when a new chat starts)
  useEffect(() => {
    if (!currentUser) return;

    // Remove orderBy from query to avoid needing a composite index in Firestore
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort locally
      chatsData.sort((a, b) => {
        const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
        const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
        return timeB - timeA;
      });

      setChats(chatsData);
      setLoadingChats(false);

      // Fetch user data for other participants if not in cache
      chatsData.forEach(chat => {
        const otherUserId = chat.participants.find(id => id !== currentUser.uid);
        if (otherUserId) {
          setUserCache(prev => {
            if (prev[otherUserId]) return prev;
            // Fetch and update cache
            getDoc(doc(db, 'users', otherUserId)).then(userDoc => {
              if (userDoc.exists()) {
                setUserCache(currentCache => ({
                  ...currentCache,
                  [otherUserId]: userDoc.data()
                }));
              }
            });
            return { ...prev, [otherUserId]: { name: 'Loading...', image: fallbackImage } };
          });
        }
      });
    });

    return unsubscribe;
  }, [currentUser]);

  const creatingChatRef = useRef(false);

  // Handle URL user ID (starting a new chat or opening an existing one)
  useEffect(() => {
    if (!currentUser || loadingChats) return;

    if (urlUserId) {
      const existingChat = chats.find(c => c.participants.includes(urlUserId));
      if (existingChat) {
        if (!activeChat || activeChat.id !== existingChat.id) {
          setActiveChat(existingChat);
        }
      } else {
        // Chat doesn't exist in local snapshot yet, but verify on server before creating to prevent duplicates
        if (!creatingChatRef.current) {
          creatingChatRef.current = true;
          const createChat = async () => {
            try {
              // Verify on server first to prevent race condition with onSnapshot cache
              const verifyQ = query(
                collection(db, 'chats'),
                where('participants', 'array-contains', currentUser.uid)
              );
              const { getDocs } = await import('firebase/firestore');
              const snapshot = await getDocs(verifyQ);
              const existingOnServer = snapshot.docs.find(d => d.data().participants.includes(urlUserId));
              
              if (existingOnServer) {
                setActiveChat({ id: existingOnServer.id, participants: existingOnServer.data().participants });
              } else {
                const newChatRef = await addDoc(collection(db, 'chats'), {
                  participants: [currentUser.uid, urlUserId],
                  updatedAt: serverTimestamp()
                });
                setActiveChat({ id: newChatRef.id, participants: [currentUser.uid, urlUserId] });
              }
            } catch (err) {
              console.error("Error creating chat:", err);
            } finally {
              creatingChatRef.current = false;
            }
          };
          createChat();
        }
      }
    } else if (!activeChat && chats.length > 0) {
      setActiveChat(chats[0]);
    }
  }, [urlUserId, loadingChats, chats, currentUser, activeChat]);

  // Fetch active chat messages AND setup Socket.io listener
  useEffect(() => {
    if (!activeChat?.id) {
      setMessages([]);
      return;
    }

    // 1. Join the specific Socket.io chat room
    socket.emit('join_chat', activeChat.id);

    // 2. Fetch historical messages from Firebase one time
    const fetchHistory = async () => {
      const q = query(
        collection(db, 'chats', activeChat.id, 'messages'),
        orderBy('createdAt', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    };
    fetchHistory();

    // 3. Listen for new live incoming messages via Socket.io
    const handleReceiveMessage = (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    };
    socket.on('receive_message', handleReceiveMessage);

    // Cleanup
    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.emit('leave_chat', activeChat.id);
    };
  }, [activeChat?.id]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeChat || !currentUser) return;

    const messageText = inputText.trim();
    setInputText('');

    const otherUserId = activeChat.participants.find(id => id !== currentUser.uid);

    // Create a normalized message object for Socket.io
    const newMessage = {
      id: Date.now().toString(),
      senderId: currentUser.uid,
      text: messageText,
      createdAt: new Date().toISOString() // Use string instead of serverTimestamp for socket transport
    };

    // Optimistically update local UI immediately
    setMessages(prev => [...prev, newMessage]);

    // Push message to the recipient's screen live via Socket.io
    socket.emit('send_message', {
      chatId: activeChat.id,
      message: newMessage
    });

    try {
      // 1. Save message to Firebase for historical persistence (in the background)
      const { updateDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'chats', activeChat.id, 'messages'), {
        senderId: currentUser.uid,
        text: messageText,
        createdAt: serverTimestamp() // Use true server time for the permanent record
      });

      // 2. Update parent chat updatedAt so it floats to top of sidebar
      await updateDoc(doc(db, 'chats', activeChat.id), {
        updatedAt: serverTimestamp(),
        lastMessage: messageText
      });

      // 3. Trigger a notification for the receiver
      if (otherUserId) {
        await addDoc(collection(db, 'notifications'), {
          userId: otherUserId,
          title: `New Message from ${userData?.name || currentUser.displayName || 'Someone'}`,
          body: messageText,
          read: false,
          link: `/chat/${currentUser.uid}`,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Error saving message:", err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    // Handle both Firestore timestamps and ISO date strings from Socket.io
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!currentUser) {
    return (
      <div className="pt-32 min-h-screen container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Please Login</h2>
        <p className="text-white/70 mb-8">You need to be logged in to view your messages.</p>
        <Link to="/login" className="bg-brand text-white px-8 py-3 rounded-xl font-medium">
          Login
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-24 h-[100dvh] container mx-auto px-4 pb-6 md:pb-10 flex flex-col relative"
    >
      {/* Animated Background Blobs strictly for Chat Area context */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[3rem] z-0 opacity-40 mix-blend-screen">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[10%] left-[20%] w-[40%] h-[40%] bg-brand/30 blur-[100px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -40, 0], y: [0, -50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[20%] right-[10%] w-[35%] h-[35%] bg-accent/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, 30, 0], y: [0, -40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-[40%] right-[30%] w-[25%] h-[25%] bg-vibrant-pink/20 blur-[80px] rounded-full" 
        />
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden relative z-10 backdrop-blur-sm rounded-[2.5rem] border border-white/5 shadow-2xl">
        {/* Sidebar - Chats List */}
        <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 shrink-0 bg-black/40 backdrop-blur-xl border-r border-white/10 overflow-hidden`}>
          <div className="p-6 pb-2 space-y-6">
            {/* Header & Search */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Messages</h2>
              <button className="w-10 h-10 rounded-full glass flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                <Sparkles size={18} />
              </button>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search size={18} className="text-white/40 group-focus-within:text-brand-light transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:bg-white/10 focus:border-brand/50 focus:ring-1 ring-brand/50 transition-all shadow-inner"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 ${
                    activeTab === tab 
                      ? 'bg-brand text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' 
                      : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
            {loadingChats ? (
              <div className="flex flex-col gap-3 mt-4">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex items-center gap-4 p-4 rounded-[1.5rem] bg-white/5">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-white/10 rounded w-1/2" />
                      <div className="h-3 bg-white/10 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : chats.length === 0 ? (
              <div className="text-center text-white/50 py-20 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-white/20">
                  <MessageSquare size={32} />
                </div>
                <p>No messages yet.</p>
              </div>
            ) : (
              <AnimatePresence>
                {chats.map((chat, index) => {
                  const otherUserId = chat.participants.find(id => id !== currentUser.uid);
                  const otherUser = userCache[otherUserId] || { name: '...', image: fallbackImage };
                  const isActive = activeChat?.id === chat.id;
                  
                  return (
                    <motion.button 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      key={chat.id}
                      onClick={() => {
                        setActiveChat(chat);
                        navigate(`/chat/${otherUserId}`);
                      }}
                      className={`w-full text-left p-4 rounded-[1.5rem] transition-all duration-300 flex items-center gap-4 relative group ${
                        isActive 
                          ? 'bg-gradient-to-r from-brand/20 to-accent/10 border border-brand/30 shadow-[0_4px_20px_rgba(225,29,72,0.15)]' 
                          : 'bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10'
                      }`}
                    >
                      {/* Active Indicator Line */}
                      {isActive && (
                        <motion.div layoutId="activeChatIndicator" className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-brand rounded-r-full shadow-[0_0_10px_rgba(225,29,72,0.8)]" />
                      )}

                      <div className="relative shrink-0">
                        <img src={otherUser.image || fallbackImage} alt={otherUser.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                        <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-black"></span>
                        </span>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className={`font-bold truncate ${isActive ? 'text-white' : 'text-white/90'}`}>{otherUser.name}</h4>
                          {chat.updatedAt && (
                            <span className={`text-[10px] whitespace-nowrap ${isActive ? 'text-brand-light font-medium' : 'text-white/40'}`}>
                              {formatTime(chat.updatedAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <p className={`text-xs truncate ${isActive ? 'text-white/80' : 'text-white/50'}`}>
                            {chat.lastMessage || 'Start a conversation'}
                          </p>
                          {/* Mock Unread Badge */}
                          {index === 1 && !isActive && (
                            <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center text-[10px] text-white font-bold shadow-[0_0_10px_rgba(225,29,72,0.5)] shrink-0">
                              2
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Main Chat Window */}
        {activeChat ? (
          <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-black/20 backdrop-blur-md relative z-10 rounded-[2.5rem] md:rounded-none md:rounded-r-[2.5rem] overflow-hidden`}>
            {(() => {
              const otherUserId = activeChat.participants.find(id => id !== currentUser.uid);
              const otherUser = userCache[otherUserId] || { name: '...', image: fallbackImage };
              
              return (
                <>
                  {/* Chat Header */}
                  <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl shadow-sm z-20">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setActiveChat(null);
                          navigate('/chat');
                        }}
                        className="md:hidden text-white/50 p-2 hover:text-white glass rounded-xl"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                        <img src={otherUser.image || fallbackImage} alt={otherUser.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{otherUser.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <Circle size={8} className="fill-green-500 text-green-500" />
                          <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Online</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 rounded-xl glass hover:bg-white/10 text-white transition-colors">
                        <Phone size={18} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-3 rounded-xl glass hover:bg-white/10 text-white transition-colors">
                        <MoreVertical size={18} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar flex flex-col relative z-10">
                    {/* Subtle Pattern Overlay */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                    
                    {messages.length === 0 ? (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto"
                      >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-brand/20 to-accent/20 flex items-center justify-center text-white/30 mb-6 shadow-[0_0_50px_rgba(225,29,72,0.1)]">
                          <MessageSquare size={48} />
                        </div>
                        <h3 className="text-white font-bold text-xl mb-2">Say Hello!</h3>
                        <p className="text-white/40 text-sm">Send a message to start the conversation with {otherUser.name}.</p>
                      </motion.div>
                    ) : (
                      <AnimatePresence>
                        {messages.map((msg, idx) => {
                          const isSent = msg.senderId === currentUser.uid;
                          return (
                            <motion.div 
                              key={msg.id} 
                              initial={{ opacity: 0, y: 10, x: isSent ? 20 : -20 }}
                              animate={{ opacity: 1, y: 0, x: 0 }}
                              transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
                              className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[85%] md:max-w-[70%] space-y-1.5 flex flex-col ${isSent ? 'items-end' : 'items-start'}`}>
                                <div className={`p-4 text-[15px] leading-relaxed shadow-lg backdrop-blur-md relative group ${
                                  isSent 
                                    ? 'bg-gradient-to-br from-brand to-vibrant-pink text-white rounded-[2rem] rounded-tr-sm border border-white/20' 
                                    : 'bg-white/10 text-white/90 rounded-[2rem] rounded-tl-sm border border-white/5'
                                }`}>
                                  {msg.text}
                                </div>
                                <div className={`flex items-center gap-1.5 px-2 ${isSent ? 'justify-end' : 'justify-start'}`}>
                                  <p className="text-[10px] text-white/30 font-bold tracking-wider uppercase">
                                    {formatTime(msg.createdAt)}
                                  </p>
                                  {isSent && <CheckCheck size={14} className="text-brand-light opacity-80" />}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                    <div ref={messagesEndRef} className="h-4" />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 md:p-6 bg-gradient-to-t from-black/60 to-transparent relative z-20">
                    <form onSubmit={handleSendMessage} className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-brand/20 to-accent/20 blur-xl opacity-50 rounded-full" />
                      <div className="glass bg-black/60 backdrop-blur-2xl p-2 rounded-full flex items-center gap-2 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] focus-within:border-brand/50 focus-within:bg-black/80 transition-all duration-300 relative z-10">
                        <div className="hidden sm:flex gap-1 pl-2">
                          <motion.button type="button" whileHover={{ scale: 1.1, rotate: 10 }} className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Smile size={20} /></motion.button>
                          <motion.button type="button" whileHover={{ scale: 1.1, rotate: -10 }} className="p-2.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"><Paperclip size={20} /></motion.button>
                        </div>
                        
                        <input 
                          type="text" 
                          placeholder="Type a message..." 
                          className="flex-1 bg-transparent border-none outline-none text-white text-[15px] px-4 py-3 placeholder:text-white/30"
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                        />
                        
                        {inputText.trim() ? (
                          <motion.button 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit" 
                            className="w-12 h-12 shrink-0 rounded-full bg-gradient-to-r from-brand to-vibrant-pink text-white flex items-center justify-center shadow-[0_0_20px_rgba(225,29,72,0.4)] border border-white/20 ml-1"
                          >
                            <Send size={18} className="ml-1" />
                          </motion.button>
                        ) : (
                          <motion.button 
                            type="button" 
                            whileHover={{ scale: 1.1 }}
                            className="w-12 h-12 shrink-0 rounded-full glass bg-white/5 text-white/50 hover:text-white flex items-center justify-center mr-1"
                          >
                            <Mic size={20} />
                          </motion.button>
                        )}
                      </div>
                    </form>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="hidden md:flex flex-1 flex-col items-center justify-center relative bg-black/20 backdrop-blur-md rounded-r-[2.5rem] border border-l-0 border-white/5">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center relative z-10"
            >
              <div className="w-32 h-32 mx-auto mb-8 relative">
                <div className="absolute inset-0 bg-brand/20 blur-2xl rounded-full animate-pulse" />
                <div className="w-full h-full glass rounded-[2rem] flex items-center justify-center text-white/30 border border-white/10 shadow-2xl relative z-10 rotate-12 hover:rotate-0 transition-transform duration-500">
                  <MessageSquare size={48} />
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Connect & Discover</h2>
              <p className="text-white/40 max-w-sm mx-auto leading-relaxed">
                Select a conversation from the sidebar to start messaging, or explore new connections.
              </p>
              <button onClick={() => navigate('/explore')} className="mt-8 px-8 py-3 rounded-full bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-md">
                Find Locals
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Chat;
