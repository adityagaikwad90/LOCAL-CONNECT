import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, ShieldCheck, Zap, Users } from 'lucide-react';
import { trendingCities as mockTrendingCities, testimonials } from '../data/mockData';
import { GlassCard, GlassButton, Badge } from '../components/common/UIComponents';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const Home = () => {
  const navigate = useNavigate();
  const [trendingCities, setTrendingCities] = useState(mockTrendingCities);

  useEffect(() => {
    const fetchLocalsCount = async () => {
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
      }
    };

    fetchLocalsCount();
  }, []);
  return (
    <div className="pt-24 min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="accent" className="bg-vibrant-pink/20 text-vibrant-pink border-vibrant-pink/30">Experience the World Authentically</Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mt-6 mb-8 tracking-tight leading-tight">
            Explore Cities with <br />
            <span className="text-gradient">Trusted Locals</span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Skip the tourist traps. Connect with verified residents who share your interests for personalized guidance and unique experiences. <br />
            <br />
            <p> presented by - Aditya ,Manish ,Vaishnavi, Mayur</p>
          </p>


        </motion.div>
      </section>

      {/* Trending Cities */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Trending Cities</h2>
            <p className="text-white/50">Most popular destinations this month</p>
          </div>
          <button className="text-blue-400 hover:text-blue-300 transition-colors font-medium text-sm">View all cities →</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingCities.map((city, idx) => (
            <motion.div
              key={city.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard
                className="group cursor-pointer p-0 overflow-hidden border-none aspect-[4/5] relative"
                onClick={() => navigate(`/city/${city.name}`)}
              >
                <img
                  src={city.image}
                  alt={city.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end">
                  <Badge variant="white" className="w-fit mb-3">{city.country}</Badge>
                  <h3 className="text-2xl font-bold text-white mb-1">{city.name}</h3>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {city.topPlaces && city.topPlaces.slice(0, 2).map((place, i) => (
                      <span key={i} className="text-[10px] bg-white/10 text-white/60 px-1.5 py-0.5 rounded border border-white/5">
                        {place}
                      </span>
                    ))}
                    {city.topPlaces && city.topPlaces.length > 2 && (
                      <span className="text-[10px] text-white/40 px-1.5 py-0.5">+{city.topPlaces.length - 2} more</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-white/70 text-sm">
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {city.localsCount} Locals
                    </span>
                    <span className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-400 fill-yellow-400" /> {city.rating}
                    </span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass rounded-[3rem] p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-[100px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/10 blur-[100px] rounded-full -ml-48 -mb-48" />

          <div className="relative text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">How it Works</h2>
            <p className="text-white/50 max-w-xl mx-auto">Three simple steps to experience your next destination like a local.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {[
              { icon: Search, title: 'Find your guide', text: 'Browse verified locals based on your destination and shared interests.' },
              { icon: ShieldCheck, title: 'Connect safely', text: 'Chat with locals, ask questions, and book your experience through our secure platform.' },
              { icon: MapPin, title: 'Explore together', text: 'Meet your guide and discover hidden gems and stories away from the crowds.' }
            ].map((step, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10 group-hover:bg-gradient-to-tr group-hover:from-brand group-hover:to-accent group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-brand/20">
                  <step.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">What our Travelers Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <GlassCard key={t.id} className="p-10 border-white/5">
              <Star className="text-yellow-400 fill-yellow-400 mb-6" size={24} />
              <p className="text-xl text-white/80 italic mb-8 leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-brand to-accent" />
                <div>
                  <h4 className="text-white font-bold">{t.author}</h4>
                  <p className="text-white/40 text-sm">{t.role}</p>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass-dark rounded-[3rem] p-12 text-center border-brand/20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to see the world differently?</h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto text-lg">Join thousands of travelers who are discovering cities through the eyes of the people who call them home.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <GlassButton variant="accent" className="px-12 py-4 text-lg">Start Exploring</GlassButton>
            <GlassButton variant="outline" className="px-12 py-4 text-lg">Become a Local</GlassButton>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
