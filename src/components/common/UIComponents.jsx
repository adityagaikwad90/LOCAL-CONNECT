import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-orange-200/10 text-orange-100 border-orange-200/20',
    accent: 'bg-emerald-200/10 text-emerald-100 border-emerald-200/20',
    white: 'bg-white/5 text-white/75 border-white/15',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const GlassCard = ({ children, className = '', hover = true, onClick, variant = 'light' }) => {
  const variants = {
    light: 'bg-white/[0.04] border-white/10',
    dark: 'bg-[#101920] border-white/10 shadow-xl',
  };

  return (
    <div 
      className={`rounded-3xl border p-6 ${variants[variant]} ${hover ? 'transition-colors hover:border-white/20 hover:bg-white/[0.06]' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const Magnetic = ({ children, strength = 0.5 }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * strength;
    const y = (clientY - (top + height / 2)) * strength;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export const GlassButton = ({ children, variant = 'primary', onClick, className = '', ...props }) => {
  const variants = {
    primary: 'button-secondary',
    accent: 'button-primary',
    outline: 'button-secondary',
  };

  return (
    <button onClick={onClick} className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};
