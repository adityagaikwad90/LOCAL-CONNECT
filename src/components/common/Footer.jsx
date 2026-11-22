import React from 'react';
import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => <footer className="border-t border-white/10 bg-[#0a1116]">
  <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1.3fr_1fr_1fr]">
    <div><Link to="/" className="inline-flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-200 text-slate-950"><Compass size={19} /></span><span className="font-semibold text-white">Local<span className="text-orange-200">Connect</span></span></Link><p className="mt-4 max-w-sm text-sm leading-6 text-white/50">Meet the people who make a place feel like somewhere you belong.</p></div>
    <div><p className="text-sm font-semibold text-white">Explore</p><div className="mt-4 flex flex-col gap-3 text-sm text-white/50"><Link to="/explore" className="hover:text-white">Find a local</Link><Link to="/register" className="hover:text-white">Become a local</Link></div></div>
    <div><p className="text-sm font-semibold text-white">Stay curious</p><p className="mt-4 text-sm leading-6 text-white/50">Thoughtful travel begins with a local conversation.</p><Link to="/explore" className="mt-3 inline-block text-sm font-medium text-orange-200 hover:text-white">Explore the community</Link></div>
  </div>
  <div className="border-t border-white/[0.06] px-5 py-4 text-center text-xs text-white/35">© {new Date().getFullYear()} LocalConnect · Made for curious travelers</div>
</footer>;

export default Footer;
