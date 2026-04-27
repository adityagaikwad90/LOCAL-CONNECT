import React from 'react';

export const Badge = ({ children, variant = 'primary' }) => {
  const variants = {
    primary: 'bg-brand/20 text-brand-light border-brand/30',
    accent: 'bg-accent/20 text-accent-light border-accent/30',
    white: 'bg-white/10 text-white/80 border-white/20',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {children}
    </span>
  );
};

export const GlassCard = ({ children, className = '', hover = true, onClick }) => {
  return (
    <div 
      className={`glass-card p-6 ${!hover ? 'hover:transform-none hover:bg-white/10' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const GlassButton = ({ children, variant = 'primary', onClick, className = '' }) => {
  const variants = {
    primary: 'glass-button-primary',
    accent: 'glass-button-accent',
    outline: 'border border-white/20 text-white hover:bg-white/10',
  };

  return (
    <button onClick={onClick} className={`${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};
