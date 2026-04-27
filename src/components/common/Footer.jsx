import React from 'react';
import { Compass, Globe, MessageCircle, Camera, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="glass rounded-3xl p-8 md:p-12 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand to-accent flex items-center justify-center text-white">
                  <Compass size={20} />
                </div>
                <span className="text-xl font-bold text-white uppercase tracking-wider">
                  LocalConnect
                </span>
              </Link>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Connecting curious travelers with passionate locals for authentic city experiences.
              </p>
              <div className="flex gap-4">
                {[MessageCircle, Camera, Globe].map((Icon, idx) => (
                  <a 
                    key={idx}
                    href="#" 
                    className="w-10 h-10 rounded-xl glass-button-primary flex items-center justify-center hover:-translate-y-1 transition-transform"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-4">
                {['Home', 'Explore', 'Become a Local', 'Safety'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Support</h4>
              <ul className="space-y-4">
                {['Help Center', 'Terms of Service', 'Privacy Policy', 'Contact Us'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Newsletter</h4>
              <p className="text-white/50 text-sm mb-4">Get travel tips and local magic in your inbox.</p>
              <div className="flex gap-2 p-1 glass rounded-2xl bg-white/5">
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="bg-transparent border-none focus:ring-0 text-white text-sm px-4 py-2 w-full outline-none"
                />
                <button className="bg-brand px-4 py-2 rounded-xl text-white text-sm font-medium hover:bg-brand-dark transition-colors">
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center text-white/40 text-xs">
          © {new Date().getFullYear()} LocalConnect. Built with and ❤️ for travelers.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
