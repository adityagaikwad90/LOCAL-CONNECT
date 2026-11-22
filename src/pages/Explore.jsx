import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Heart, MapPin, Search, ShieldCheck, Star, Tag, UserRound } from 'lucide-react';
import { trendingCities } from '../data/mockData';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';

const Explore = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState(location.state?.selectedCity || 'Mumbai');
  const [locals, setLocals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');
  const { userData, updateUserData, currentUser } = useAuth();
  const likedCities = userData?.likedCities || [];

  useEffect(() => {
    if (location.state?.selectedCity) setSelectedCity(location.state.selectedCity);
  }, [location.state?.selectedCity]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError(false);
    getDocs(query(collection(db, 'users'), where('role', '==', 'local'), where('location', '==', selectedCity)))
      .then((snapshot) => { if (active) setLocals(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))); })
      .catch((error) => { console.error('Could not load local guides:', error); if (active) { setLocals([]); setLoadError(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedCity]);

  const filteredLocals = useMemo(() => locals.filter((person) => {
    const text = `${person.name || ''} ${person.bio || ''} ${(person.interests || []).join(' ')} ${(person.languages || []).join(' ')}`.toLowerCase();
    return text.includes(search.trim().toLowerCase());
  }), [locals, search]);

  const toggleSaved = async (cityName) => {
    if (!currentUser) { navigate('/login'); return; }
    const next = likedCities.includes(cityName) ? likedCities.filter((item) => item !== cityName) : [...likedCities, cityName];
    try { await updateUserData({ likedCities: next }); } catch (error) { console.error('Could not save destination:', error); }
  };

  return (
    <main className="page-shell min-h-screen">
      <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8">
        <header className="max-w-3xl"><p className="eyebrow"><span className="h-2 w-2 rounded-full bg-emerald-300" />Meet the people behind the place</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-6xl">Find a local who <span className="text-orange-200">gets your kind of trip.</span></h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/55">Choose a city, explore what its locals love, and send a plan that makes it easy to say yes.</p></header>

        <section className="mt-12"><div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-lg font-semibold text-white">Popular cities</h2><span className="text-sm text-white/45">{selectedCity} selected</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{trendingCities.slice(0, 10).map((city) => <button type="button" key={city.id} onClick={() => setSelectedCity(city.name)} className={`relative h-28 overflow-hidden rounded-2xl border text-left transition ${selectedCity === city.name ? 'border-orange-200/70 ring-2 ring-orange-200/20' : 'border-white/10 hover:border-white/30'}`}><img src={city.image} alt="" className="absolute inset-0 h-full w-full object-cover" /><span className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/35 to-transparent" /><span className="absolute bottom-3 left-3 font-semibold text-white">{city.name}</span><span className="absolute right-2 top-2 rounded-full bg-black/30 p-1.5 text-white/70 backdrop-blur" onClick={(event) => { event.stopPropagation(); toggleSaved(city.name); }}><Heart size={15} className={likedCities.includes(city.name) ? 'fill-orange-200 text-orange-200' : ''} /></span></button>)}</div></section>

        <section className="mt-14"><div className="mb-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="eyebrow">{selectedCity}</p><h2 className="section-title mt-2">Local guides <span className="text-white/40">({filteredLocals.length})</span></h2></div><label className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:max-w-sm"><Search size={18} className="shrink-0 text-white/40" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search names, interests, languages" className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35" /></label></div>
          {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((item) => <div key={item} className="h-72 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />)}</div> : filteredLocals.length === 0 ? <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.025] px-6 py-16 text-center"><MapPin size={26} className="mx-auto text-orange-200" /><h3 className="mt-4 text-xl font-semibold text-white">{loadError ? 'Guides are temporarily unavailable' : locals.length ? 'No guides match that search' : `No guides in ${selectedCity} just yet`}</h3><p className="mx-auto mt-2 max-w-lg text-white/50">{loadError ? 'We could not connect to the guide directory. Please try again in a moment.' : locals.length ? 'Try a different name, interest, or language.' : 'Pick another city or come back when more locals join.'}</p></div> : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filteredLocals.map((guide) => <article key={guide.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"><div className="relative h-36 bg-gradient-to-br from-[#244346] to-[#182531]"><div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 15% 20%, #f6ad7b 0, transparent 35%), radial-gradient(circle at 90% 80%, #a2d2bb 0, transparent 35%)' }} />{guide.image ? <img src={guide.image} alt={guide.name} className="absolute bottom-4 left-5 h-20 w-20 rounded-2xl border-2 border-white/20 object-cover" /> : <div className="absolute bottom-4 left-5 flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-white/20 bg-white/10"><UserRound size={32} className="text-white/80" /></div>}<span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/20 px-3 py-1 text-xs font-medium text-white/80"><ShieldCheck size={13} className="text-emerald-200" />Local guide</span></div><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-semibold text-white">{guide.name || 'Local guide'}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-white/50"><MapPin size={14} />{guide.location || selectedCity}</p></div><span className="inline-flex items-center gap-1 rounded-lg bg-white/[0.07] px-2 py-1 text-sm font-semibold text-white"><Star size={14} className="fill-orange-200 text-orange-200" />{guide.rating || 'New'}</span></div><p className="mt-4 line-clamp-2 min-h-10 text-sm leading-5 text-white/55">{guide.bio || 'A local ready to share their favorite corners of the city.'}</p><div className="mt-4 flex min-h-7 flex-wrap gap-2">{(guide.interests || []).slice(0, 3).map((interest) => <span key={interest} className="inline-flex items-center gap-1 rounded-full bg-white/[0.07] px-2.5 py-1 text-xs text-white/70"><Tag size={11} />{interest}</span>)}</div><div className="mt-5 grid grid-cols-2 gap-2"><Link to={`/profile/${guide.id}`} className="button-secondary w-full">View profile</Link><Link to={`/profile/${guide.id}`} className="button-primary w-full">Plan a visit</Link></div></div></article>)}</div>}
        </section>
      </div>
    </main>
  );
};

export default Explore;
