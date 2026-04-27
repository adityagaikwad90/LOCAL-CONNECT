import React, { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, Users, ArrowLeft, Star, Tag, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trendingCities } from '../data/mockData';
import { GlassCard, GlassButton, Badge } from '../components/common/UIComponents';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

const fallbackImage = 'https://images.unsplash.com/photo-1480796927426-f609979314bd?auto=format&fit=crop&w=1920&q=80';

const CityPage = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();

  const [locals, setLocals] = useState([]);
  const [loadingLocals, setLoadingLocals] = useState(false);
  const [showLocals, setShowLocals] = useState(false);
  const localsSectionRef = useRef(null);

  // Find the city in mock data to get its image, or use fallback
  const cityData = trendingCities.find(c => c.name.toLowerCase() === cityName.toLowerCase()) || {
    name: cityName,
    country: 'Destination',
    image: fallbackImage,
    localsCount: 'Many',
    rating: 'New'
  };

  const handleSeeLocals = async () => {
    if (showLocals) {
      localsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    setShowLocals(true);
    setLoadingLocals(true);
    
    // Scroll down slightly so the user sees the section opening
    setTimeout(() => {
      localsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'local'),
        where('location', '==', cityData.name)
      );
      const querySnapshot = await getDocs(q);
      const localsData = [];
      querySnapshot.forEach((doc) => {
        localsData.push({ id: doc.id, ...doc.data() });
      });
      setLocals(localsData);
    } catch (err) {
      console.error("Error fetching locals:", err);
    } finally {
      setLoadingLocals(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      {/* Background Hero Image */}
      <div className="fixed inset-0 z-0">
        <img 
          src={cityData.image} 
          alt={cityData.name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1e1b4b] via-[#1e1b4b]/80 to-[#1e1b4b]/30" />
      </div>

      <div className="relative z-10 pt-32 pb-20 container mx-auto px-4 min-h-screen flex flex-col">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors w-fit mb-12 glass px-4 py-2 rounded-xl"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <motion.div 
          className="flex flex-col justify-center items-center text-center max-w-3xl mx-auto w-full mb-20 mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Badge variant="accent" className="mb-6 px-4 py-1.5 text-sm">{cityData.country}</Badge>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-6 tracking-tight drop-shadow-lg">
            {cityData.name}
          </h1>
          <p className="text-xl text-white/80 mb-6 max-w-2xl leading-relaxed">
            Discover the hidden gems, vibrant culture, and unforgettable experiences in {cityData.name} with the help of our verified local guides.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {cityData.topPlaces && cityData.topPlaces.map((place, index) => (
              <span 
                key={index}
                className="glass px-4 py-1.5 rounded-full text-sm text-white/90 border border-white/10"
              >
                {place}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md">
            <GlassButton 
              variant="accent" 
              className="flex-1 py-4 text-lg flex items-center justify-center gap-3"
              onClick={handleSeeLocals}
              disabled={loadingLocals && !showLocals}
            >
              <Users size={24} />
              {loadingLocals && !locals.length ? 'Loading...' : 'See Locals'}
            </GlassButton>
            
            <GlassButton 
              variant="outline" 
              className="flex-1 py-4 text-lg flex items-center justify-center gap-3 bg-white/5 backdrop-blur-md"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cityData.name + ', ' + cityData.country)}`, '_blank')}
            >
              <MapPin size={24} />
              Explore Map
            </GlassButton>
          </div>
        </motion.div>

        {/* Locals Section */}
        <div ref={localsSectionRef} className="scroll-mt-24 w-full">
          <AnimatePresence>
            {showLocals && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="py-8">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-white">
                      Locals in {cityData.name}
                    </h2>
                  </div>
                  
                  {loadingLocals ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
                    </div>
                  ) : locals.length === 0 ? (
                    <div className="text-center py-20 glass rounded-3xl">
                      <h3 className="text-2xl font-bold text-white mb-2">No locals found</h3>
                      <p className="text-white/50">There are currently no locals registered in {cityData.name}.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {locals.map((localUser, idx) => (
                        <motion.div
                          key={localUser.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <GlassCard className="p-0 overflow-hidden flex flex-col h-full bg-white/10 border-white/5 hover:bg-white/20 transition-all duration-300">
                            <div className="relative h-48 bg-gradient-to-br from-brand/40 to-brand-dark/40 flex items-center justify-center">
                              <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-lg">
                                <User size={40} className="text-white" />
                              </div>
                              <div className="absolute top-4 right-4">
                                <Badge variant="accent" className="backdrop-blur-md bg-brand/40 border-white/20">
                                  Local Guide
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="p-6 flex-1 flex flex-col">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h3 className="text-xl font-bold text-white mb-1">{localUser.name}</h3>
                                  <div className="flex items-center gap-1 text-white/40 text-xs">
                                    <MapPin size={12} />
                                    {localUser.location}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg">
                                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                  <span className="text-white text-xs font-bold">New</span>
                                </div>
                              </div>

                              <div className="mb-6 flex-1">
                                <p className="text-white/50 text-sm mb-3">Interests</p>
                                <div className="flex flex-wrap gap-2">
                                  {localUser.interests && localUser.interests.map((interest, i) => (
                                    <span key={i} className="flex items-center gap-1 text-xs bg-white/5 text-white/80 px-2 py-1 rounded-md border border-white/10">
                                      <Tag size={10} />
                                      {interest}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="mt-auto space-y-3">
                                <Link to={`/profile/${localUser.id}`}>
                                  <GlassButton className="w-full py-2.5 text-sm" variant="outline">
                                    View Profile
                                  </GlassButton>
                                </Link>
                                <Link to={`/chat/${localUser.id}`}>
                                  <GlassButton className="w-full py-2.5 text-sm" variant="accent">
                                    Message
                                  </GlassButton>
                                </Link>
                              </div>
                            </div>
                          </GlassCard>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CityPage;
