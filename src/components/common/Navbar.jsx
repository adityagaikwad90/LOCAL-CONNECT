import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, MessageSquare, LayoutDashboard, Search, Menu, X, User, LogOut, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';

const NotificationsMenu = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifs);
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

  const handleNotificationClick = async (notif) => {
    if (!notif.read) {
      await updateDoc(doc(db, 'notifications', notif.id), { read: true });
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1e1b4b]" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h3 className="text-white font-bold">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs text-brand-light bg-brand/20 px-2 py-1 rounded-full">{unreadCount} New</span>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-white/50 text-sm">
                  No notifications yet.
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`w-full text-left p-4 hover:bg-white/5 transition-colors flex gap-3 ${!notif.read ? 'bg-white/5' : ''}`}
                    >
                      <div className="shrink-0 mt-1">
                        {!notif.read ? (
                          <div className="w-2 h-2 bg-brand rounded-full" />
                        ) : (
                          <div className="w-2 h-2 rounded-full border border-white/20" />
                        )}
                      </div>
                      <div>
                        <p className={`text-sm ${!notif.read ? 'text-white font-bold' : 'text-white/80'}`}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-white/50 mt-1 line-clamp-2">{notif.body}</p>
                      </div>
                    </button>
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

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, userData } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Explore', path: '/explore', icon: <Compass size={18} /> },
    { name: 'Messages', path: '/chat', icon: <MessageSquare size={18} /> },
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'py-3' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className={`glass rounded-2xl p-2 px-6 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? 'bg-white/10' : 'bg-white/5 border-transparent'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-accent flex items-center justify-center text-white shadow-lg shadow-brand/20 group-hover:scale-110 transition-transform">
              <Compass size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
              Local<span className="text-blue-400">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(link.path) 
                    ? 'bg-white/20 text-white shadow-lg shadow-black/5' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="w-px h-6 bg-white/10 mx-2" />
            {currentUser ? (
              <>
                <NotificationsMenu currentUser={currentUser} />
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white transition-colors">
                  <User size={18} />
                  <span>{userData?.name || currentUser.displayName || 'Profile'}</span>
                </div>
                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors ml-2">
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white transition-colors">
                  <User size={18} />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white hover:bg-brand-light transition-colors ml-2">
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-2">
            {currentUser && <NotificationsMenu currentUser={currentUser} />}
            <button 
              className="p-2 text-white hover:bg-white/10 rounded-xl transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 p-4 pt-0"
          >
            <div className="glass rounded-2xl p-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive(link.path) 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                </Link>
              ))}
              <hr className="border-white/10 my-2" />
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 p-3 rounded-xl text-white/70">
                    <User size={18} />
                    <span className="font-medium">{userData?.name || currentUser.displayName || 'Profile'}</span>
                  </div>
                  <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="flex items-center justify-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors mt-2">
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-xl text-white/70 hover:text-white transition-colors">
                    <User size={18} />
                    <span className="font-medium">Login</span>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-3 p-3 rounded-xl bg-brand text-white transition-colors mt-2">
                    <span className="font-medium">Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
