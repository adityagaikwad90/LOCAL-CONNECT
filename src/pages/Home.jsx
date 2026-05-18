import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Search, MapPin, Star, ShieldCheck, Zap, Users, ArrowRight, PlayCircle, Globe, Sparkles } from 'lucide-react';
import { trendingCities as mockTrendingCities, testimonials } from '../data/mockData';
import { GlassCard, GlassButton, Badge, Magnetic } from '../components/common/UIComponents';
import CursorGlow from '../components/common/CursorGlow';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [trendingCities, setTrendingCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const yText = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacityText = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  useEffect(() => {
    const fetchLocalsCount = async () => {
      setIsLoading(true);
      try {
        const updatedCities = await Promise.all(
          mockTrendingCities.map(async (city) => {
            const q = query(
              collection(db, 'users'),
              where('role', '==', 'local'),
              where('location', '==', city.name)
            );
            const querySnapshot = await getDocs(q);
            return { ...city, localsCount: querySnapshot.size };
          })
        );
        setTrendingCities(updatedCities);
      } catch (error) {
        console.error("Error fetching locals count:", error);
        setTrendingCities(mockTrendingCities); // Fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocalsCount();
  }, []);

  return (
    <div className="relative min-h-screen bg-[#050510] overflow-hidden selection:bg-brand selection:text-white" ref={containerRef}>
      <CursorGlow />
      
      {/* Animated Mesh Gradient, Noise, & Grid Overlay */}
      <div className="fixed inset-0 z-0 mesh-gradient-bg pointer-events-none" />
      <div className="fixed inset-0 z-0 grid-overlay opacity-[0.2] pointer-events-none" />
      <div className="fixed inset-0 z-0 noise-bg opacity-[0.1] pointer-events-none mix-blend-overlay" />
      
      {/* Vibrant Floating Ambient Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen opacity-80">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -100, 0], scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand/30 blur-[150px]" 
        />
        <motion.div 
          animate={{ x: [0, -150, 0], y: [0, 150, 0], scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
          className="absolute top-[20%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-vibrant-orange/20 blur-[180px]" 
        />
        <motion.div 
          animate={{ y: [0, -50, 0], x: [0, 50, 0], rotate: [0, 15, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[10%] w-[45vw] h-[45vw] bg-vibrant-pink/20 blur-[150px] rounded-full"
        />
        <motion.div 
          animate={{ y: [0, 50, 0], x: [0, -50, 0] }}
          transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
          className="absolute top-[40%] left-[-10%] w-[35vw] h-[35vw] bg-accent/20 blur-[130px] rounded-full"
        />
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-48 pb-32 text-center z-10 min-h-screen flex items-center justify-center">
        {/* Floating Mini Cards */}
        <motion.div 
          animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
          className="hidden lg:flex absolute top-[25%] left-[5%] glass px-5 py-3 rounded-2xl border-white/20 items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-2xl"
        >
          <div className="p-2 bg-gradient-to-br from-brand to-accent rounded-full"><Star size={16} className="text-white fill-white" /></div>
          <div className="text-left">
            <p className="text-white font-black leading-tight">4.9/5</p>
            <p className="text-white/60 text-xs font-semibold">Average Rating</p>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, 20, 0], rotate: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
          className="hidden lg:flex absolute bottom-[20%] left-[10%] glass px-5 py-3 rounded-2xl border-white/20 items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-2xl"
        >
          <div className="p-2 bg-gradient-to-br from-vibrant-orange to-vibrant-pink rounded-full"><Globe size={16} className="text-white" /></div>
          <div className="text-left">
            <p className="text-white font-black leading-tight">120+</p>
            <p className="text-white/60 text-xs font-semibold">Active Cities</p>
          </div>
        </motion.div>

        <motion.div 
          animate={{ y: [0, -25, 0], rotate: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
          className="hidden lg:flex absolute top-[30%] right-[5%] glass px-5 py-3 rounded-2xl border-white/20 items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-2xl"
        >
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-[#12121a] bg-brand flex items-center justify-center text-xs font-bold text-white">A</div>
            <div className="w-8 h-8 rounded-full border-2 border-[#12121a] bg-vibrant-indigo flex items-center justify-center text-xs font-bold text-white">S</div>
            <div className="w-8 h-8 rounded-full border-2 border-[#12121a] bg-accent flex items-center justify-center text-xs font-bold text-white">+</div>
          </div>
          <div className="text-left ml-2">
            <p className="text-white font-black leading-tight">Verified</p>
            <p className="text-white/60 text-xs font-semibold">Local Guides</p>
          </div>
        </motion.div>

        <motion.div 
          style={{ y: yText, opacity: opacityText }} 
          className="max-w-5xl mx-auto relative z-10"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={fadeInUp} className="mb-10 flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-white/30 bg-white/10 backdrop-blur-3xl shadow-[0_0_40px_rgba(255,255,255,0.15)]">
              <Sparkles size={16} className="text-accent-light animate-pulse" /> 
              <span className="text-sm font-bold tracking-wider text-white uppercase">The new era of travel</span>
            </div>
          </motion.div>
          
          <motion.h1 variants={fadeInUp} className="text-6xl md:text-8xl lg:text-[7.5rem] font-black text-white mb-8 tracking-tighter leading-[1.05] drop-shadow-[0_0_40px_rgba(0,0,0,0.5)]">
            Explore Cities with <br />
            <span className="relative inline-block mt-2">
              <span className="absolute -inset-4 bg-gradient-to-r from-brand via-vibrant-orange to-accent-light blur-3xl opacity-50 animate-pulseGlow rounded-full"></span>
              <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70">
                Trusted Locals
              </span>
            </span>
          </motion.h1>
          
          <motion.p variants={fadeInUp} className="text-white/80 text-xl md:text-2xl max-w-2xl mx-auto mb-14 font-medium leading-relaxed drop-shadow-md">
            Skip the tourist traps. Experience authentic culture, hidden gems, and unforgettable moments with verified residents.
          </motion.p>
          
          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <Magnetic strength={0.2}>
              <Link to="/explore">
                <button className="liquid-button px-12 py-5 rounded-full bg-white text-black font-black text-lg hover:scale-105 transition-transform duration-500 shadow-[0_0_50px_rgba(255,255,255,0.6)] flex items-center gap-2 group">
                  Start Exploring <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>
      </section>

      {/* Trending Cities Showcase */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1 }}
        className="relative z-10 container mx-auto px-4 py-32"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">Trending Destinations</h2>
            <p className="text-white/50 text-xl font-medium">Discover where our community is heading next.</p>
          </div>
          <Link to="/explore" className="text-white font-bold flex items-center gap-2 group px-6 py-3 rounded-full glass hover:bg-white/10 transition-all">
            View all <Globe size={18} className="group-hover:rotate-45 transition-transform duration-500" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading 
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-white/5 border border-white/5 animate-shimmer"></div>
              ))
            : trendingCities.slice(0, 4).map((city, idx) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5, zIndex: 10 }}
                className="group relative cursor-pointer"
                style={{ perspective: 1000 }}
                onClick={() => navigate(`/city/${city.name}`)}
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-brand to-accent opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500 rounded-[3rem]" />
                <GlassCard className="relative p-0 overflow-hidden border border-white/10 rounded-[2.5rem] aspect-[3/4] h-full shadow-2xl transition-all duration-500 bg-black">
                  <img
                    src={city.image}
                    alt={city.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <Badge variant="accent" className="w-fit mb-4 bg-white/20 backdrop-blur-xl border-white/30 text-white shadow-lg">{city.country}</Badge>
                      <h3 className="text-4xl font-bold text-white mb-3 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">{city.name}</h3>
                      <div className="flex items-center gap-4 text-white/90 text-sm mb-6 font-semibold">
                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                          <Users size={14} className="text-white" /> {city.localsCount} locals
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                          <Star size={14} className="text-yellow-300 fill-yellow-300" /> {city.rating}
                        </span>
                      </div>
                      <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-500 overflow-hidden">
                        <button className="w-full bg-gradient-to-r from-white to-white/90 text-black py-3 rounded-xl font-black hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                          Explore City
                        </button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
        </div>
      </motion.section>

      {/* How it Works */}
      <section className="relative z-10 container mx-auto px-4 py-32 border-t border-white/5">
        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-black text-white mb-6"
          >
            How it Works
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/50 max-w-2xl mx-auto text-xl font-medium"
          >
            Three simple steps to experience your next destination like a true local, powered by our secure platform.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-16 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent -z-10" />

          {[
            { icon: Search, title: 'Discover', text: 'Browse verified locals based on your destination, interests, and preferred language.' },
            { icon: ShieldCheck, title: 'Connect', text: 'Chat securely through our platform to plan your personalized itinerary.' },
            { icon: MapPin, title: 'Experience', text: 'Meet up and explore hidden gems far away from the typical tourist crowds.' }
          ].map((step, idx) => (
            <motion.div 
              key={idx} 
              className="text-center group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.8, type: "spring" }}
            >
              <div className="w-32 h-32 rounded-[2.5rem] bg-white/5 backdrop-blur-xl flex items-center justify-center mx-auto mb-10 border border-white/20 group-hover:bg-white/10 group-hover:scale-110 group-hover:-translate-y-4 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.05)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand/40 to-vibrant-orange/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <step.icon size={48} className="text-white relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-white/70 leading-relaxed text-lg px-4">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Interactive CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-32 mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="relative rounded-[4rem] p-16 md:p-24 text-center border border-white/20 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.4)] backdrop-blur-3xl bg-white/5"
        >
          {/* Internal Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-3xl bg-gradient-to-r from-brand/40 via-vibrant-orange/40 to-vibrant-pink/40 blur-[120px] rounded-full pointer-events-none animate-pulseGlow" />
          
          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight drop-shadow-xl">
              Ready to see the world <br className="hidden md:block"/> differently?
            </h2>
            <p className="text-white/80 mb-12 max-w-2xl mx-auto text-xl leading-relaxed font-medium">
              Join thousands of travelers discovering cities through the eyes of the people who call them home. Your next adventure awaits.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Magnetic strength={0.2}>
                <Link to="/explore">
                  <button className="liquid-button px-12 py-5 rounded-full bg-white text-black font-black text-lg hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.5)] w-full sm:w-auto">
                    Start Exploring
                  </button>
                </Link>
              </Magnetic>
              <Magnetic strength={0.2}>
                <Link to="/register">
                  <button className="px-12 py-5 rounded-full glass border border-white/30 bg-white/10 text-white font-bold text-lg hover:bg-white/20 hover:border-white/50 hover:scale-105 transition-all w-full sm:w-auto shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                    Become a Local
                  </button>
                </Link>
              </Magnetic>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
