import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Compass, MessageSquare, LayoutDashboard, Search, Menu, X, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import NotificationsMenu from './NotificationsMenu';
import { Magnetic } from './UIComponents';

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
    ...(currentUser && userData?.role === 'local' ? [{ name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-500 ${
        isScrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="w-full max-w-5xl px-4">
        <div className={`rounded-full p-2 px-6 flex items-center justify-between transition-all duration-500 border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-xl ${
          isScrolled ? 'bg-black/60' : 'bg-white/10'
        }`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-accent-light flex items-center justify-center text-white shadow-lg shadow-brand/40 group-hover:scale-110 group-hover:shadow-accent/40 transition-all duration-300">
              <Compass size={24} />
            </div>
            <span className="text-xl font-bold text-white tracking-tight hidden sm:block">
              Local<span className="text-accent-light drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">Connect</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Magnetic key={link.path} strength={0.2}>
                <Link 
                  to={link.path}
                  className={`group flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    isActive(link.path) 
                      ? 'bg-gradient-to-r from-brand to-brand-dark text-white shadow-[0_0_15px_rgba(225,29,72,0.4)] border border-brand-light/30' 
                      : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                  }`}
                >
                  <div className={`${isActive(link.path) ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>
                    {link.icon}
                  </div>
                  {link.name}
                </Link>
              </Magnetic>
            ))}
            <div className="w-px h-6 bg-white/10 mx-3" />
            {currentUser ? (
              <>
                <NotificationsMenu currentUser={currentUser} />
                <Magnetic strength={0.2}>
                  <Link to="/profile" className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 ${
                    isActive('/profile') 
                      ? 'bg-white/20 text-white shadow-lg shadow-black/5' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}>
                    <User size={18} />
                    <span className="font-medium">{userData?.name || currentUser.displayName || 'Profile'}</span>
                  </Link>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-1">
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </Magnetic>
              </>
            ) : (
              <>
                <Magnetic strength={0.2}>
                  <Link to="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors font-medium">
                    <User size={18} />
                    <span>Login</span>
                  </Link>
                </Magnetic>
                <Magnetic strength={0.2}>
                  <Link to="/register" className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-brand to-vibrant-pink text-white hover:shadow-[0_0_20px_rgba(225,29,72,0.6)] hover:-translate-y-0.5 transition-all duration-300 ml-2 font-bold border border-white/20">
                    <span>Sign Up</span>
                  </Link>
                </Magnetic>
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
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    isActive('/profile') 
                      ? 'bg-white/20 text-white' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}>
                    <User size={18} />
                    <span className="font-medium">{userData?.name || currentUser.displayName || 'Profile'}</span>
                  </Link>
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
