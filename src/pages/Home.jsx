import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, BadgeCheck, Compass, MapPin, MessageCircle, Sparkles, Star, Users } from 'lucide-react';
import { trendingCities } from '../data/mockData';

const Home = () => {
  const navigate = useNavigate();
  const featured = trendingCities.slice(0, 4);
  return (
    <main className="page-shell overflow-hidden">
      <section className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-12 px-5 pb-20 pt-36 sm:px-8 lg:grid-cols-[1fr_0.92fr] lg:pt-40">
        <div className="relative z-10 max-w-2xl">
          <div className="eyebrow"><span className="h-2 w-2 rounded-full bg-orange-300" />Travel with a local point of view</div>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.05] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.6rem]">A city feels different <span className="text-orange-200">when someone calls it home.</span></h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/60">Meet people who know the neighborhood, then plan a day around what you actually love.</p>
          <div className="mt-9 flex flex-wrap gap-3"><Link to="/explore" className="button-primary px-6 py-3.5">Find your local <ArrowUpRight size={17} /></Link><Link to="/register" className="button-secondary px-6 py-3.5">Share your city</Link></div>
          <div className="mt-12 flex flex-wrap items-center gap-6 border-t border-white/10 pt-7 text-sm text-white/55"><span className="inline-flex items-center gap-2"><BadgeCheck size={17} className="text-orange-200" />Local-led experiences</span><span className="inline-flex items-center gap-2"><MessageCircle size={17} className="text-orange-200" />Plan together in chat</span></div>
        </div>
        <div className="relative mx-auto h-[450px] w-full max-w-[570px] sm:h-[560px]">
          <div className="absolute left-[8%] top-[5%] h-[78%] w-[72%] overflow-hidden rounded-[2rem] border border-white/15 shadow-2xl sm:rounded-[2.5rem]"><img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=1100&q=85" alt="Evening view across Mumbai" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" /><div className="absolute bottom-6 left-6"><p className="flex items-center gap-2 text-sm font-medium text-white/75"><MapPin size={15} />Maharashtra, India</p><p className="mt-1 text-3xl font-semibold text-white">Mumbai</p></div></div>
          <div className="absolute bottom-[2%] right-[1%] h-[48%] w-[42%] overflow-hidden rounded-[1.75rem] border-4 border-[#101820] shadow-xl"><img className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=700&q=85" alt="Jaipur palace at sunset" /><div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" /><div className="absolute bottom-4 left-4 text-xl font-semibold text-white">Jaipur</div></div>
          <div className="absolute right-0 top-[10%] flex items-center gap-3 rounded-2xl border border-white/15 bg-[#17232b]/90 p-4 shadow-xl backdrop-blur"><div className="rounded-xl bg-orange-200/15 p-2.5 text-orange-200"><Users size={20} /></div><div><p className="text-sm font-semibold text-white">Real local knowledge</p><p className="mt-0.5 text-xs text-white/50">Made personal to you</p></div></div>
          <div className="absolute bottom-[8%] left-0 flex items-center gap-3 rounded-2xl border border-white/15 bg-[#17232b]/90 p-4 shadow-xl backdrop-blur"><div className="rounded-xl bg-emerald-200/15 p-2.5 text-emerald-200"><Star size={20} /></div><div><p className="text-sm font-semibold text-white">Go beyond the guidebook</p><p className="mt-0.5 text-xs text-white/50">Neighborhoods, not checklists</p></div></div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="eyebrow">Find your next favorite place</p><h2 className="section-title mt-2">Start with a city</h2></div><Link to="/explore" className="text-sm font-semibold text-orange-200 hover:text-white">Browse all cities</Link></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{featured.map((city, index) => <motion.button key={city.id} onClick={() => navigate(`/city/${city.name}`)} whileHover={{ y: -4 }} className={`group relative h-[310px] overflow-hidden rounded-3xl text-left ${index === 0 ? 'lg:col-span-2' : ''}`}><img src={city.image} alt={city.name} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-[#091116]/90 via-[#091116]/10 to-transparent" /><div className="absolute bottom-0 left-0 p-6"><p className="text-sm text-white/65">{city.country} · {city.topPlaces?.slice(0, 2).join(' / ')}</p><h3 className="mt-2 text-3xl font-semibold text-white">{city.name}</h3></div><span className="absolute right-5 top-5 rounded-full border border-white/25 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">{city.rating} <Star size={12} className="ml-1 inline fill-current text-orange-200" /></span></motion.button>)}</div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8"><div className="grid gap-10 rounded-[2rem] border border-white/10 bg-white/[0.035] p-7 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:p-14"><div><p className="eyebrow"><Sparkles size={15} />A more human way to explore</p><h2 className="section-title mt-4">The best plans start with a conversation.</h2><p className="mt-4 text-white/55">You bring the curiosity. A local brings the places, stories, and small details that make a day yours.</p></div><div className="grid gap-4 sm:grid-cols-3">{[{ n: '01', title: 'Find a guide', text: 'Choose a city and meet locals with the interests you share.' }, { n: '02', title: 'Send a plan', text: 'Pick a date, tell them your group size, and share what you like.' }, { n: '03', title: 'Make it yours', text: 'Once they accept, use chat to shape the details together.' }].map((item) => <article key={item.n} className="rounded-2xl border border-white/10 bg-[#0d151b] p-5"><p className="text-sm font-semibold text-orange-200">{item.n}</p><h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{item.text}</p></article>)}</div></div></section>
      <section className="mx-auto max-w-7xl px-5 pb-24 pt-14 text-center sm:px-8"><p className="eyebrow justify-center">Your next city is waiting</p><h2 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">Make room for the unexpected.</h2><Link to="/explore" className="button-primary mx-auto mt-7">Explore local guides <Compass size={17} /></Link></section>
    </main>
  );
};

export default Home;
