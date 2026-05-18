import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, deleteDoc, writeBatch, limit } from 'firebase/firestore';

const NotificationsMenu = ({ currentUser, className = "" }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    // Use limit to prevent fetching too many docs
    // and keep it simple to avoid index requirement if possible (though orderBy + where usually needs it)
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifs);
    }, (error) => {
      console.error("Notifications listener error:", error);
      // Fallback: try without orderBy if it fails (likely due to missing index)
      if (error.code === 'failed-precondition') {
        console.warn("Retrying notifications query without orderBy due to missing index.");
        const fallbackQ = query(
          collection(db, 'notifications'),
          where('userId', '==', currentUser.uid),
          limit(20)
        );
        onSnapshot(fallbackQ, (fallbackSnapshot) => {
          const fallbackNotifs = [];
          fallbackSnapshot.forEach((doc) => {
            fallbackNotifs.push({ id: doc.id, ...doc.data() });
          });
          // Sort locally if Firestore couldn't
          fallbackNotifs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
          setNotifications(fallbackNotifs);
        });
      }
    });

    return unsubscribe;
  }, [currentUser]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (notif) => {
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
    if (!notif.read) {
      updateDoc(doc(db, 'notifications', notif.id), { read: true }).catch((err) => {
        console.error("Error marking notification as read:", err);
      });
    }
  };

  const handleDeleteNotification = async (e, notifId) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    try {
      await deleteDoc(doc(db, 'notifications', notifId));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleClearAll = async () => {
    if (!currentUser || notifications.length === 0) return;
    
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      try {
        const batch = writeBatch(db);
        notifications.forEach((notif) => {
          batch.delete(doc(db, 'notifications', notif.id));
        });
        await batch.commit();
      } catch (err) {
        console.error("Error clearing all notifications:", err);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors relative group"
        title="Notifications"
      >
        <Bell size={20} className={isOpen ? 'text-white' : ''} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1e1b4b] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-3 w-80 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-[100]"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-2">
                <h3 className="text-white font-bold">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold text-brand-light bg-brand/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button 
                  onClick={handleClearAll}
                  className="text-white/30 hover:text-red-400 transition-colors p-1 rounded-lg hover:bg-red-500/10 group/clear"
                  title="Clear All"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/20">
                    <Bell size={24} />
                  </div>
                  <p className="text-white/40 text-sm">No notifications yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="relative group/notif">
                      <button
                        onClick={() => handleNotificationClick(notif)}
                        className={`w-full text-left p-4 hover:bg-white/5 transition-all flex gap-3 ${!notif.read ? 'bg-white/10' : ''}`}
                      >
                        <div className="shrink-0 mt-1">
                          {!notif.read ? (
                            <div className="w-2.5 h-2.5 bg-brand rounded-full shadow-[0_0_8px_rgba(var(--brand-rgb),0.5)]" />
                          ) : (
                            <div className="w-2.5 h-2.5 rounded-full border border-white/20" />
                          )}
                        </div>
                        <div className="flex-1 pr-6">
                          <p className={`text-sm leading-tight ${!notif.read ? 'text-white font-bold' : 'text-white/70'}`}>
                            {notif.title}
                          </p>
                          <p className="text-xs text-white/40 mt-1.5 line-clamp-2 leading-relaxed">{notif.body}</p>
                          {notif.createdAt && (
                            <p className="text-[9px] text-white/20 mt-2 font-bold uppercase tracking-widest">
                              {new Date(notif.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </button>
                      <button 
                        onClick={(e) => handleDeleteNotification(e, notif.id)}
                        className="absolute top-4 right-4 p-1.5 rounded-lg text-white/0 group-hover/notif:text-white/20 hover:!text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete Notification"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsMenu;
