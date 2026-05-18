import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Star, User, Tag, ChevronDown, Users, Heart, Search, Filter } from 'lucide-react';
import { trendingCities as mockTrendingCities } from '../data/mockData';
import { GlassCard, GlassButton, Badge, Magnetic } from '../components/common/UIComponents';
import CursorGlow from '../components/common/CursorGlow';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

const Explore = () => {
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [locals, setLocals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [trendingCities, setTrendingCities] = useState(mockTrendingCities);
  const locationState = useLocation();
  const navigate = useNavigate();
  const { userData, updateUserData, currentUser } = useAuth();

  const toggleLikeCity = async (e, cityName) => {
    e.stopPropagation(); // Prevent navigation to city page
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const currentLikedCities = userData?.likedCities || [];
    const isLiked = currentLikedCities.includes(cityName);
    
    let newLikedCities;
    if (isLiked) {
      newLikedCities = currentLikedCities.filter(city => city !== cityName);
    } else {
      newLikedCities = [...currentLikedCities, cityName];
    }

    try {
      await updateUserData({ likedCities: newLikedCities });
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Fetch locations on mount
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

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'locations'));
        const locData = [];
        querySnapshot.forEach((doc) => {
          locData.push({ id: doc.id, ...doc.data() });
        });
        
        const requestedCity = locationState.state?.selectedCity;
        if (requestedCity && !locData.some(loc => (loc.name || loc.id) === requestedCity)) {
          locData.push({ id: requestedCity, name: requestedCity });
        }
        
        // Ensure default Indian cities are always present
        const defaultCities = ['Mumbai', 'Jaipur', 'Surat', 'Nashik', 'Vadodara'];
        defaultCities.forEach(city => {
          if (!locData.some(loc => (loc.name || loc.id) === city)) {
            locData.push({ id: city, name: city });
          }
        });
        
        setLocations(locData);
        
        if (requestedCity) {
          setSelectedLocation(requestedCity);
        } else if (locData.length > 0) {
          setSelectedLocation(locData[0].name || locData[0].id);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle subsequent navigation changes while already on the Explore page
  useEffect(() => {
    if (locationState.state?.selectedCity && !loadingLocations) {
      const requestedCity = locationState.state.selectedCity;
      setSelectedLocation(requestedCity);
      setLocations(prev => {
        if (!prev.some(loc => (loc.name || loc.id) === requestedCity)) {
          return [...prev, { id: requestedCity, name: requestedCity }];
        }
        return prev;
      });
    }
  }, [locationState.state?.selectedCity, loadingLocations]);



  // Fetch locals when selectedLocation changes
  useEffect(() => {
    if (!selectedLocation) return;

    const fetchLocals = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'users'),
          where('role', '==', 'local'),
          where('location', '==', selectedLocation)
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
        setLoading(false);
      }
    };

    fetchLocals();
  }, [selectedLocation]);

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="relative min-h-screen bg-[#050510] overflow-hidden selection:bg-brand selection:text-white">
      <CursorGlow />

      {/* Animated Mesh Gradient, Noise, & Grid Overlay */}
      <div className="fixed inset-0 z-0 mesh-gradient-bg pointer-events-none" />
      <div className="fixed inset-0 z-0 grid-overlay opacity-[0.2] pointer-events-none" />
      <div className="fixed inset-0 z-0 noise-bg opacity-[0.1] pointer-events-none mix-blend-overlay" />
      
      {/* Vibrant Floating Ambient Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none mix-blend-screen opacity-80">
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 100, 0], scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
          className="absolute top-[10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-vibrant-indigo/20 blur-[160px]" 
        />
        <motion.div 
          animate={{ x: [0, 150, 0], y: [0, -150, 0], scale: [1, 1.4, 1] }}
          transition={{ repeat: Infinity, duration: 28, ease: "easeInOut" }}
          className="absolute bottom-[20%] left-[-20%] w-[55vw] h-[55vw] rounded-full bg-brand/20 blur-[180px]" 
        />
        <motion.div 
          animate={{ y: [0, 50, 0], x: [0, -50, 0], rotate: [0, -15, 0] }}
          transition={{ repeat: Infinity, duration: 15, ease: "easeInOut" }}
          className="absolute top-[40%] right-[20%] w-[35vw] h-[35vw] bg-accent/20 blur-[140px] rounded-full"
        />
      </div>

      <div className="relative z-10 pt-40 min-h-screen container mx-auto px-4 pb-32">
        {/* Header & Filter Area */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 mb-20"
        >
          <div className="max-w-2xl">
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/20 bg-white/5 backdrop-blur-xl shadow-[0_0_30px_rgba(255,255,255,0.05)] mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-light animate-pulse"></span>
              <span className="text-xs font-bold tracking-widest text-white uppercase">Live Network</span>
            </motion.div>
            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light via-white to-white/60">Locals</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-white/60 text-xl font-medium leading-relaxed">
              Find local experts in your destination and start connecting to uncover hidden gems.
            </motion.p>
          </div>
          
          <motion.div variants={fadeInUp} className="w-full lg:w-auto relative z-20">
            <div className="glass p-3 pr-4 flex items-center gap-4 rounded-full border border-white/20 bg-white/5 backdrop-blur-3xl shadow-[0_0_50px_rgba(0,0,0,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] transition-all duration-500 w-full lg:w-[450px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              
              <div className="p-3 bg-white/10 rounded-full border border-white/10">
                <Search size={20} className="text-white" />
              </div>
              
              <div className="flex-1 relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-transparent border-none outline-none text-white py-2 w-full text-lg font-bold appearance-none cursor-pointer placeholder-white/30"
                  disabled={loadingLocations}
                >
                  {loadingLocations ? (
                    <option value="" disabled className="text-black">Loading locations...</option>
                  ) : (
                    <>
                      <option value="" disabled className="text-black">Select a destination</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.name || loc.id} className="text-black font-medium">
                          {loc.name || loc.id}
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                <button className="p-2 text-white/50 hover:text-white transition-colors">
                  <Filter size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Explore Locals</h1>
          <p className="text-white/50">Find local experts in your destination and start connecting.</p>
        </div>
        
        <div className="flex flex-col w-full md:w-auto gap-4">
          <div className="flex w-full md:w-96 relative">
            <div className="flex-1 glass p-2 px-5 flex items-center gap-3 rounded-2xl relative">
              <MapPin size={20} className="text-white/50" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="bg-transparent border-none outline-none text-white py-2 w-full text-base appearance-none cursor-pointer"
                disabled={loadingLocations}
              >
                {loadingLocations ? (
                  <option value="" disabled className="text-gray-800">Loading locations...</option>
                ) : (
                  <>
                    <option value="" disabled className="text-gray-800">Select a location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.name || loc.id} className="text-gray-800">
                        {loc.name || loc.id}
                      </option>
                    ))}
                  </>
                )}
              </select>
              <ChevronDown size={20} className="text-white/50 absolute right-4 pointer-events-none" />
            </div>
          </div>


        </div>
      </div>

        {/* Popular Destinations */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 relative"
        >
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">Trending Spots</h2>
            <Link to="#" className="text-brand-light font-bold hover:text-white transition-colors flex items-center gap-1 group">
              View Map <ChevronDown size={16} className="-rotate-90 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingCities.map((city, idx) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.02, rotateY: 5, rotateX: -5, zIndex: 10 }}
                className="group cursor-pointer relative"
                style={{ perspective: 1000 }}
                onClick={() => navigate(`/city/${city.name}`)}
              >
                <div className="absolute -inset-0.5 bg-gradient-to-br from-brand to-accent opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500 rounded-[2.5rem]" />
                
                <GlassCard className={`p-0 overflow-hidden aspect-[4/5] relative h-full rounded-[2.5rem] border transition-all duration-500 shadow-2xl ${selectedLocation === city.name ? 'border-brand shadow-[0_0_30px_rgba(225,29,72,0.3)]' : 'border-white/10'}`}>
                  <img 
                    src={city.image} 
                    alt={city.name} 
                    className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 ease-out"
                  />
                  
                  {/* Floating Like Button */}
                  <div className="absolute top-5 right-5 z-20">
                    <button 
                      onClick={(e) => toggleLikeCity(e, city.name)}
                      className={`p-3 rounded-2xl backdrop-blur-xl border transition-all duration-500 ${
                        userData?.likedCities?.includes(city.name) 
                        ? 'bg-brand/80 border-brand text-white shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-pulseGlow' 
                        : 'bg-white/10 border-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Heart size={20} className={`${userData?.likedCities?.includes(city.name) ? 'fill-current scale-110' : ''} transition-transform`} />
                    </button>
                  </div>

                  {/* Gradient Overlay & Content */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent p-6 flex flex-col justify-end">
                    <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <Badge variant="white" className="w-fit mb-3 bg-white/20 backdrop-blur-md border-white/30 text-white">{city.country}</Badge>
                      <h3 className="text-3xl font-black text-white mb-2 drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] tracking-tight">{city.name}</h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {city.topPlaces && city.topPlaces.slice(0, 2).map((place, i) => (
                          <span key={i} className="text-xs font-bold bg-white/10 backdrop-blur-md text-white/90 px-2 py-1 rounded-md border border-white/10 shadow-sm">
                            {place}
                          </span>
                        ))}
                        {city.topPlaces && city.topPlaces.length > 2 && (
                          <span className="text-xs font-bold bg-white/5 backdrop-blur-md text-white/50 px-2 py-1 rounded-md">
                            +{city.topPlaces.length - 2}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-white font-semibold text-sm">
                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                          <Users size={14} className="text-white" /> {city.localsCount}
                        </span>
                        <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" /> {city.rating}
                        </span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* All Locals Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-md">
              {selectedLocation ? `Guides in ${selectedLocation}` : 'All Local Guides'}
            </h2>
            {selectedLocation && (
              <span className="px-4 py-1.5 rounded-full bg-brand/20 text-brand-light font-bold text-sm border border-brand/30">
                {locals.length} available
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-32">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-white/10"></div>
                <div className="absolute inset-0 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
                <div className="absolute inset-2 rounded-full border-4 border-accent border-b-transparent animate-spin-slow"></div>
              </div>
            </div>
          ) : locals.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-32 glass rounded-[3rem] border-white/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-brand/5 to-transparent pointer-events-none" />
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6 border border-white/10">
                <Search size={40} className="text-white/30" />
              </div>
              <h3 className="text-3xl font-black text-white mb-3">No guides found</h3>
              <p className="text-white/50 text-lg max-w-md mx-auto">We couldn't find any locals registered in {selectedLocation}. Try selecting a different destination.</p>
            </motion.div>
          ) : (
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {locals.map((localUser) => (
                <motion.div
                  key={localUser.id}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                >
                  <GlassCard className="p-0 overflow-hidden flex flex-col h-full bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 rounded-[2rem] shadow-xl group">
                    <div className="relative h-40 bg-gradient-to-br from-brand/40 via-vibrant-indigo/40 to-accent/40 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-white/5 noise-bg mix-blend-overlay" />
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/60" />
                      
                      {/* Avatar */}
                      <div className="relative z-10 w-20 h-20 rounded-full bg-black/40 backdrop-blur-xl border-2 border-white/40 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500">
                        <User size={36} className="text-white drop-shadow-md" />
                      </div>
                      
                      <div className="absolute top-4 right-4 z-10">
                        <Badge variant="accent" className="backdrop-blur-xl bg-white/20 border-white/30 text-white font-bold shadow-lg">
                          Guide
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col bg-black/40 backdrop-blur-3xl">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-black text-white mb-1 drop-shadow-sm">{localUser.name}</h3>
                          <div className="flex items-center gap-1.5 text-white/50 text-sm font-semibold">
                            <MapPin size={14} className="text-brand-light" />
                            {localUser.location}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg border border-white/5 shadow-inner">
                          <Star size={12} className="fill-yellow-400 text-yellow-400" />
                          <span className="text-white text-xs font-bold">New</span>
                        </div>
                      </div>

                      <div className="mb-8 flex-1">
                        <p className="text-white/40 text-xs font-bold uppercase tracking-wider mb-3">Expertise</p>
                        <div className="flex flex-wrap gap-2">
                          {localUser.interests && localUser.interests.map((interest, i) => (
                            <span key={i} className="flex items-center gap-1 text-xs font-bold bg-white/10 text-white px-2.5 py-1.5 rounded-md border border-white/10 shadow-sm hover:bg-brand/20 transition-colors cursor-default">
                              <Tag size={10} className="text-brand-light" />
                              {interest}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-auto space-y-3 relative z-20">
                        <Link to={`/profile/${localUser.id}`}>
                          <button className="w-full py-3 rounded-xl bg-white/10 text-white font-bold text-sm border border-white/20 hover:bg-white/20 transition-all shadow-lg">
                            View Profile
                          </button>
                        </Link>
                        <Link to={`/chat/${localUser.id}`}>
                          <button className="liquid-button w-full py-3 rounded-xl bg-white text-black font-black text-sm hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            Message Guide
                          </button>
                        </Link>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Explore;
