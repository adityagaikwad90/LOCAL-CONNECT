import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, MapPin, Star, ShieldCheck, Zap, Users, ArrowRight } from 'lucide-react';
import { trendingCities as mockTrendingCities, testimonials } from '../data/mockData';
import { GlassCard, GlassButton, Badge, Magnetic } from '../components/common/UIComponents';
import CursorGlow from '../components/common/CursorGlow';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [trendingCities, setTrendingCities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { scrollYProgress } = useScroll();
  const yText = useTransform(scrollYProgress, [0, 1], [0, -100]);

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
    <div className="relative min-h-screen overflow-hidden">
      <CursorGlow />
      {/* Background Animated Blobs */}
      <div className="absolute top-0 left-0 w-full h-screen overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-brand/20 blur-[120px]" 
        />
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 100, 0] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-vibrant-pink/20 blur-[100px]" 
        />
        <motion.div 
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute top-[15%] left-[10%] w-32 h-32 bg-accent/10 blur-3xl rounded-full"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], rotate: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 7, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[15%] w-48 h-48 bg-brand/10 blur-3xl rounded-full"
        />
      </div>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 pt-40 pb-24 text-center">
        <motion.div style={{ y: yText }} className="max-w-4xl mx-auto z-10 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8 flex justify-center"
          >
            <Badge variant="accent" className="bg-brand/10 text-brand-light border-brand/20 px-4 py-2 text-sm backdrop-blur-md">
              <Zap size={14} className="inline mr-1" /> Experience the World Authentically
            </Badge>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[1.1]"
          >
            Explore Cities with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-vibrant-orange to-accent-light animate-gradient-x drop-shadow-[0_0_30px_rgba(244,114,182,0.3)]">
              Trusted Locals
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/60 text-xl md:text-2xl max-w-2xl mx-auto mb-12 font-light"
          >
            Skip the tourist traps. Connect with verified residents who share your interests for personalized guidance.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Magnetic strength={0.3}>
              <Link to="/explore">
                <button className="px-8 py-4 rounded-full bg-gradient-to-r from-brand to-vibrant-pink text-white font-bold text-lg shadow-[0_0_30px_rgba(225,29,72,0.5)] hover:shadow-[0_0_50px_rgba(225,29,72,0.8)] transition-all duration-300">
                  Explore Now
                </button>
              </Link>
            </Magnetic>
            <Magnetic strength={0.3}>
              <Link to="/register">
                <button className="px-8 py-4 rounded-full glass border border-white/20 text-white font-bold text-lg hover:bg-white/10 transition-all duration-300">
                  Become a Local
                </button>
              </Link>
            </Magnetic>
          </motion.div>
        </motion.div>
      </section>

      {/* Trending Cities (Horizontal Scroll + 3D Tilt + Shimmer) */}
      <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 py-20"
      >
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Trending Cities</h2>
            <p className="text-white/50 text-lg">Most popular destinations this month</p>
          </div>
          <Link to="/explore" className="text-brand-light hover:text-white transition-colors font-medium flex items-center gap-1 group">
            View all cities <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide">
          {isLoading 
            ? Array(4).fill(0).map((_, i) => (
                <div key={i} className="min-w-[280px] md:min-w-[320px] aspect-[4/5] rounded-3xl bg-white/5 border border-white/5 animate-shimmer snap-center shrink-0"></div>
              ))
            : trendingCities.map((city, idx) => (
              <motion.div
                key={city.id}
                whileHover={{ scale: 1.03, rotateY: 5, rotateX: -5 }}
                className="min-w-[280px] md:min-w-[320px] snap-center shrink-0"
                style={{ perspective: 1000 }}
              >
                <GlassCard
                  className="group cursor-pointer p-0 overflow-hidden border-none aspect-[4/5] relative h-full shadow-2xl hover:shadow-[0_0_30px_rgba(225,29,72,0.3)] transition-all duration-500"
                  onClick={() => navigate(`/city/${city.name}`)}
                >
                  <img
                    src={city.image}
                    alt={city.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 flex flex-col justify-end">
                    <Badge variant="accent" className="w-fit mb-3 bg-white/20 backdrop-blur-md border-white/30 text-white shadow-lg">{city.country}</Badge>
                    <h3 className="text-3xl font-bold text-white mb-2 drop-shadow-md">{city.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {city.topPlaces && city.topPlaces.slice(0, 2).map((place, i) => (
                        <span key={i} className="text-xs bg-white/10 backdrop-blur-md text-white/80 px-2 py-1 rounded-md border border-white/10">
                          {place}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/10">
                      <div className="flex items-center gap-4 text-white/70 text-sm">
                        <span className="flex items-center gap-1">
                          <Users size={16} className="text-brand-light" /> <span className="font-medium text-white">{city.localsCount}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Star size={16} className="text-accent-light fill-accent-light" /> <span className="font-medium text-white">{city.rating}</span>
                        </span>
                      </div>
                      <button className="bg-brand hover:bg-brand-light text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors shadow-lg">
                        Connect
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
        </div>
      </motion.section>


      {/* How it Works (Animated Steps) */}
      <section className="container mx-auto px-4 py-20 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-[100px] rounded-full -z-10" />
        
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">How it Works</h2>
          <p className="text-white/50 max-w-xl mx-auto text-lg">Three simple steps to experience your next destination like a true local.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative max-w-5xl mx-auto">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent -z-10" />

          {[
            { icon: Search, title: 'Find your guide', text: 'Browse verified locals based on your destination and shared interests.' },
            { icon: ShieldCheck, title: 'Connect safely', text: 'Chat with locals, ask questions, and book your experience through our secure platform.' },
            { icon: MapPin, title: 'Explore together', text: 'Meet your guide and discover hidden gems and stories away from the crowds.' }
          ].map((step, idx) => (
            <motion.div 
              key={idx} 
              className="text-center group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.3, duration: 0.6 }}
            >
              <div className="w-24 h-24 rounded-[2rem] glass flex items-center justify-center mx-auto mb-8 border border-white/10 group-hover:bg-gradient-to-tr group-hover:from-brand group-hover:to-vibrant-pink group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_30px_rgba(225,29,72,0.4)] relative">
                <step.icon size={36} className="text-white relative z-10" />
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-[2rem] bg-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-white/50 leading-relaxed">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials (Infinite Marquee) */}
      <section className="py-20 overflow-hidden relative">
        <h2 className="text-4xl font-bold text-white text-center mb-16">What our Travelers Say</h2>
        
        {/* Gradients to fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0a0a] to-transparent z-10"></div>

        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...testimonials, ...testimonials, ...testimonials, ...testimonials].map((t, idx) => (
            <div key={idx} className="w-[400px] shrink-0 px-4">
              <GlassCard className="p-8 border-white/5 h-full relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/10 rounded-full blur-2xl group-hover:bg-accent/20 transition-colors" />
                <Star className="text-accent-light fill-accent-light mb-6 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" size={24} />
                <p className="text-lg text-white/80 italic mb-8 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand to-accent p-0.5 shadow-lg">
                    <div className="w-full h-full bg-[#171717] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {t.author.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{t.author}</h4>
                    <p className="text-brand-light text-sm">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 mb-20">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-dark rounded-[3rem] p-12 md:p-20 text-center border-brand/20 relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] backdrop-blur-3xl"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand/10 to-transparent pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight drop-shadow-md">Ready to see the world <br className="hidden md:block"/> differently?</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto text-lg leading-relaxed">Join thousands of travelers who are discovering cities through the eyes of the people who call them home.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/explore">
              <button className="px-10 py-4 rounded-full bg-white text-black font-bold text-lg hover:bg-white/90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                Start Exploring
              </button>
            </Link>
            <Link to="/register">
              <button className="px-10 py-4 rounded-full glass border border-white/20 text-white font-bold text-lg hover:bg-white/10 hover:scale-105 transition-all">
                Become a Local
              </button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
