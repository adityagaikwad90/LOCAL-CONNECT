import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, MoreVertical, Phone, Image as ImageIcon, Smile, ArrowLeft, MessageSquare } from 'lucide-react';
import { GlassCard } from '../components/common/UIComponents';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { 
  collection, query, where, onSnapshot, orderBy, 
  addDoc, serverTimestamp, getDoc, getDocs, doc 
} from 'firebase/firestore';
import { io } from 'socket.io-client';

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
        // Chat doesn't exist, create it safely without triggering loops
        if (!creatingChatRef.current) {
          creatingChatRef.current = true;
          const createChat = async () => {
            try {
              const newChatRef = await addDoc(collection(db, 'chats'), {
                participants: [currentUser.uid, urlUserId],
                updatedAt: serverTimestamp()
              });
              setActiveChat({ id: newChatRef.id, participants: [currentUser.uid, urlUserId] });
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
    <div className="pt-24 h-screen container mx-auto px-4 pb-10 flex flex-col">
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Sidebar - Chats List */}
        <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 space-y-4 overflow-y-auto pr-2 custom-scrollbar`}>
          <div className="glass p-3 rounded-2xl flex items-center gap-3 px-4 mb-2">
            <Search size={18} className="text-white/40" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="bg-transparent border-none outline-none text-white text-sm w-full"
            />
          </div>

          {loadingChats ? (
            <div className="text-center text-white/50 py-10">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="text-center text-white/50 py-10">No messages yet.</div>
          ) : (
            chats.map((chat) => {
              const otherUserId = chat.participants.find(id => id !== currentUser.uid);
              const otherUser = userCache[otherUserId] || { name: '...', image: fallbackImage };
              
              return (
                <button 
                  key={chat.id}
                  onClick={() => {
                    setActiveChat(chat);
                    navigate(`/chat/${otherUserId}`);
                  }}
                  className={`text-left p-4 rounded-[1.5rem] transition-all duration-300 flex items-center gap-4 ${
                    activeChat?.id === chat.id 
                      ? 'glass bg-brand/30 border-white/20 shadow-lg' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img src={otherUser.image || fallbackImage} alt={otherUser.name} className="w-14 h-14 rounded-2xl object-cover" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-[#1e1b4b] rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-white font-bold truncate">{otherUser.name}</h4>
                      {chat.updatedAt && (
                        <span className="text-[10px] text-white/30 whitespace-nowrap">
                          {formatTime(chat.updatedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-white/40 text-xs truncate">
                      {chat.lastMessage || 'Start a conversation'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Main Chat Window */}
        {activeChat ? (
          <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-1 glass rounded-[2.5rem] flex-col overflow-hidden border-white/5`}>
            {(() => {
              const otherUserId = activeChat.participants.find(id => id !== currentUser.uid);
              const otherUser = userCache[otherUserId] || { name: '...', image: fallbackImage };
              
              return (
                <>
                  {/* Header */}
                  <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setActiveChat(null);
                          navigate('/chat');
                        }}
                        className="md:hidden text-white/50 p-2 hover:text-white"
                      >
                        <ArrowLeft size={20} />
                      </button>
                      <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0">
                        <img src={otherUser.image || fallbackImage} alt={otherUser.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold">{otherUser.name}</h3>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-white/30 text-xs font-bold uppercase tracking-wider italic">Online</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors"><Phone size={20} /></button>
                      <button className="p-3 rounded-xl hover:bg-white/10 text-white transition-colors"><MoreVertical size={20} /></button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar flex flex-col">
                    {messages.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                        No messages yet. Send a message to start the conversation!
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.senderId === currentUser.uid ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                            <div className={`p-4 rounded-[1.5rem] text-sm leading-relaxed ${
                              msg.senderId === currentUser.uid 
                                ? 'bg-brand text-white rounded-tr-none' 
                                : 'glass bg-white/10 text-white/80 rounded-tl-none'
                            }`}>
                              {msg.text}
                            </div>
                            <p className={`text-[10px] text-white/30 font-bold ${msg.senderId === currentUser.uid ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Area */}
                  <div className="p-4 md:p-6 pt-0">
                    <form onSubmit={handleSendMessage} className="glass p-2 rounded-[2rem] flex items-center gap-2 bg-black/20 focus-within:ring-1 ring-brand/50 transition-all">
                      <button type="button" className="hidden sm:block p-3 rounded-full text-white/40 hover:text-white transition-colors"><Smile size={20} /></button>
                      <button type="button" className="hidden sm:block p-3 rounded-full text-white/40 hover:text-white transition-colors"><ImageIcon size={20} /></button>
                      <input 
                        type="text" 
                        placeholder="Type your message..." 
                        className="flex-1 bg-transparent border-none outline-none text-white text-sm px-4"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                      />
                      <button 
                        type="submit" 
                        disabled={!inputText.trim()}
                        className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-brand text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:hover:scale-100"
                      >
                        <Send size={18} />
                      </button>
                    </form>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="hidden md:flex flex-1 glass rounded-[2.5rem] items-center justify-center border-white/5">
            <div className="text-center text-white/40">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
              <p>Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
