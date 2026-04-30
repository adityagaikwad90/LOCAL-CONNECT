import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, User, Tag, ChevronDown, Users, Heart } from 'lucide-react';
import { trendingCities as mockTrendingCities } from '../data/mockData';
import { GlassCard, GlassButton, Badge } from '../components/common/UIComponents';
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

  return (
    <div className="pt-28 min-h-screen container mx-auto px-4 pb-20">
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
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Popular Destinations</h2>
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
                className={`group cursor-pointer p-0 overflow-hidden aspect-[4/5] relative border-2 transition-all duration-300 ${selectedLocation === city.name ? 'border-brand' : 'border-transparent'}`}
                onClick={() => navigate(`/city/${city.name}`)}
              >
                <img 
                  src={city.image} 
                  alt={city.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4 z-20">
                  <button 
                    onClick={(e) => toggleLikeCity(e, city.name)}
                    className={`p-2.5 rounded-xl backdrop-blur-md border transition-all duration-300 ${
                      userData?.likedCities?.includes(city.name) 
                      ? 'bg-brand/60 border-brand text-white shadow-lg shadow-brand/20' 
                      : 'bg-black/20 border-white/10 text-white/70 hover:bg-black/40 hover:text-white'
                    }`}
                  >
                    <Heart size={18} className={userData?.likedCities?.includes(city.name) ? 'fill-current' : ''} />
                  </button>
                </div>
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
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {selectedLocation ? `Locals in ${selectedLocation}` : 'All Locals'}
          </h2>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
          </div>
        ) : locals.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-2">No locals found</h3>
            <p className="text-white/50">There are currently no locals registered in {selectedLocation}.</p>
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
                    {/* Placeholder Avatar */}
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
    </div>
  );
};

export default Explore;
