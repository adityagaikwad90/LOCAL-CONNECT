import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, LayoutDashboard, Menu, MessageCircle, UserRound, X } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useAuth } from '../../context/AuthContext';
import NotificationsMenu from './NotificationsMenu';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { currentUser, userData } = useAuth();
  const links = [
    { label: 'Explore', to: '/explore', icon: Compass },
    ...(currentUser ? [{ label: 'Messages', to: '/chat', icon: MessageCircle }, { label: 'My space', to: '/dashboard', icon: LayoutDashboard }] : []),
  ];
  const active = (to) => to === '/explore' ? pathname.startsWith('/explore') : pathname === to || pathname.startsWith(`${to}/`);

  const navItems = (mobile = false) => links.map(({ label, to, icon: Icon }) => <Link key={to} to={to} onClick={() => mobile && setOpen(false)} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${active(to) ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/[0.06] hover:text-white'}`}><Icon size={16} />{label}</Link>);

  return <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6"><nav className="mx-auto flex max-w-7xl items-center justify-between rounded-2xl border border-white/10 bg-[#101920]/90 px-3 py-2.5 shadow-lg shadow-black/10 backdrop-blur-xl sm:px-5">
    <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-200 text-slate-950"><Compass size={20} /></span><span className="font-semibold tracking-tight text-white">Local<span className="text-orange-200">Connect</span></span></Link>
    <div className="hidden items-center gap-1 md:flex">{navItems()}</div>
    <div className="hidden items-center gap-2 md:flex">{currentUser ? <><NotificationsMenu currentUser={currentUser} /><Link to="/profile" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/[0.06] hover:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-orange-100">{userData?.name?.slice(0, 1) || currentUser.displayName?.slice(0, 1) || <UserRound size={15} />}</span>{userData?.name?.split(' ')[0] || 'Profile'}</Link><button onClick={() => signOut(auth)} className="button-secondary min-h-9 px-3 py-1.5 text-xs">Sign out</button></> : <><Link to="/login" className="rounded-xl px-3 py-2 text-sm font-semibold text-white/70 hover:text-white">Log in</Link><Link to="/register" className="button-primary min-h-9 px-3 py-2 text-xs">Join the community</Link></>}</div>
    <div className="flex items-center gap-2 md:hidden">{currentUser && <NotificationsMenu currentUser={currentUser} />}<button aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)} className="rounded-xl p-2 text-white/80 hover:bg-white/10">{open ? <X size={20} /> : <Menu size={20} />}</button></div>
  </nav>{open && <div className="mx-auto mt-2 max-w-7xl rounded-2xl border border-white/10 bg-[#101920]/95 p-3 shadow-xl backdrop-blur-xl md:hidden"><div className="flex flex-col gap-1">{navItems(true)}{currentUser ? <><Link to="/profile" onClick={() => setOpen(false)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white/70"><UserRound size={16} />My profile</Link><button onClick={() => { signOut(auth); setOpen(false); }} className="rounded-xl px-3 py-2 text-left text-sm font-semibold text-white/60">Sign out</button></> : <div className="mt-2 grid grid-cols-2 gap-2"><Link to="/login" onClick={() => setOpen(false)} className="button-secondary">Log in</Link><Link to="/register" onClick={() => setOpen(false)} className="button-primary">Join</Link></div>}</div></div>}</header>;
};

export default Navbar;
