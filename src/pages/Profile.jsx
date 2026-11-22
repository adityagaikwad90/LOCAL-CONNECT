import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Globe, MessageSquare, Calendar, ShieldCheck, Heart, Share2, ArrowLeft, Users, User } from 'lucide-react';
import { GlassCard, GlassButton, Badge } from '../components/common/UIComponents';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { trendingCities } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import ConnectionRequestModal from '../components/connections/ConnectionRequestModal';

const Profile = () => {
  const { id } = useParams();
  const { userData, currentUser, loading: authLoading } = useAuth();
  const [dbProfile, setDbProfile] = React.useState(null);
  const [dbLoading, setDbLoading] = React.useState(false);
  const [requestOpen, setRequestOpen] = React.useState(false);
  const [requestSent, setRequestSent] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (id) {
        setDbLoading(true);
        try {
          const docRef = doc(db, 'users', id);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setDbProfile(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setDbLoading(false);
        }
      }
    };
    fetchProfile();
  }, [id]);

  if (authLoading || dbLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no ID and no user logged in, redirect to login
  if (!id && !currentUser) {
    navigate('/login');
    return null;
  }

  const isMyProfile = !id || id === currentUser?.uid;
  
  const profileData = isMyProfile 
    ? (userData || {
        name: currentUser?.displayName || 'User',
        email: currentUser?.email,
        role: 'explorer',
        location: 'Global Traveler',
        interests: [],
        image: currentUser?.photoURL
      })
    : dbProfile;

  // If no profile data found (e.g. invalid ID), fallback or redirect
  if (!profileData) {
    return <div className="pt-28 text-center text-white">Profile not found.</div>;
  }

  const isExplorer = profileData.role === 'explorer';

  return (
    <div className="pt-28 pb-20 container mx-auto px-4 min-h-screen">
      <Link to="/explore" className="inline-flex items-center gap-2 text-white/50 hover:text-white mb-8 transition-colors group text-sm font-medium">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        Back to Explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-12">
          {/* Header Card */}
          <GlassCard className="p-8 border-white/5">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-56 h-56 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl bg-white/5 flex items-center justify-center">
                {profileData.image ? (
                  <img src={profileData.image} alt={profileData.name} className="w-full h-full object-cover" />
                ) : (
                  <User size={64} className="text-white/20" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold text-white tracking-tight">{profileData.name}</h1>
                      {profileData.role === 'local' && (
                        <Badge variant="accent" className="flex items-center gap-1">
                          <ShieldCheck size={12} /> Local Guide
                        </Badge>
                      )}
                      {isMyProfile && (
                        <Badge variant="white">My Profile</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-white/50">
                      <span className="flex items-center gap-1"><MapPin size={16} /> {profileData.location || 'Global Traveler'}</span>
                      {profileData.role === 'local' && (
                        <span className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400" /> {profileData.rating} ({profileData.reviews} reviews)</span>
                      )}
                    </div>
                  </div>
                  {!isMyProfile && (
                    <div className="flex gap-2">
                      <button className="p-3 rounded-2xl glass hover:bg-white/20 text-white transition-colors"><Heart size={20} /></button>
                      <button className="p-3 rounded-2xl glass hover:bg-white/20 text-white transition-colors"><Share2 size={20} /></button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {profileData.interests?.map(i => <Badge key={i} variant="white">{i}</Badge>)}
                </div>

                {profileData.role === 'local' && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider mb-1 font-bold">Languages</p>
                      <p className="text-white font-medium">{profileData.languages?.join(', ')}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider mb-1 font-bold">Availability</p>
                      <p className="text-white font-medium">{profileData.availability}</p>
                    </div>
                    <div>
                      <p className="text-white/30 text-xs uppercase tracking-wider mb-1 font-bold">Price</p>
                      <p className="text-brand-light font-bold text-lg">{profileData.price}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {isMyProfile && profileData.likedCities?.length > 0 && (
            <section>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Heart size={24} className="text-brand-light fill-brand-light" />
                My Liked Destinations
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {profileData.likedCities.map((cityName) => {
                  const city = trendingCities.find(c => c.name === cityName);
                  if (!city) return null;
                  return (
                    <motion.div
                      key={city.id}
                      whileHover={{ y: -5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <GlassCard className="p-0 overflow-hidden relative aspect-video group cursor-pointer" onClick={() => navigate(`/city/${city.name}`)}>
                        <img 
                          src={city.image} 
                          alt={city.name} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 flex flex-col justify-end">
                          <Badge variant="white" className="w-fit mb-2 text-[10px] py-0.5">{city.country}</Badge>
                          <h4 className="text-xl font-bold text-white">{city.name}</h4>
                        </div>
                      </GlassCard>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {/* About Section */}
          {profileData.role === 'local' && (
            <section>
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                About {profileData.name.split(' ')[0]}
              </h3>
              <GlassCard className="p-8 border-white/5 bg-white/5 leading-relaxed text-white/70">
                <p className="text-lg leading-8">{profileData.bio || `${profileData.name.split(' ')[0]} is looking forward to sharing a local perspective on ${profileData.location || 'their city'}. Send a request to start planning together.`}</p>
              </GlassCard>
            </section>
          )}

          {/* Reviews Section */}
          {profileData.role === 'local' && (
            <section>
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">Reviews</h3>
              </div>
              <GlassCard className="border-white/5 bg-white/5 p-6 text-white/55">Reviews will show here after travelers and local guides have completed experiences together.</GlassCard>
            </section>
          )}
        </div>

        {/* Right Column - Actions */}
        <div className="lg:col-span-1 space-y-8">
          {profileData.role === 'local' && !isMyProfile && (
            <GlassCard className="p-8 border-brand/20 bg-brand/10 sticky top-32">
              <h3 className="text-2xl font-bold text-white mb-6">Connect with {profileData.name.split(' ')[0]}</h3>
              <p className="text-white/60 text-sm mb-8">Share a preferred date and a little about your trip. If the guide accepts, you can work out the details in chat.</p>
              
              <div className="space-y-4">
                  <GlassButton variant="accent" className="w-full py-4 text-lg" onClick={() => {
                    if (!currentUser) {
                      navigate('/login', { state: { from: window.location.pathname } });
                    } else if (id && Number.isNaN(Number(id))) {
                      setRequestOpen(true);
                    }
                  }}>
                  <Calendar size={20} />
                    {requestSent ? 'Request sent' : 'Plan an experience'}
                </GlassButton>
                <Link to={id ? `/chat/${id}` : '/chat'} className="block">
                  <GlassButton variant="outline" className="w-full py-4 text-lg">
                    <MessageSquare size={20} />
                    Chat Now
                  </GlassButton>
                </Link>
              </div>

            </GlassCard>
          )}

          {profileData.role === 'local' && (
            <GlassCard className="p-8 border-white/5">
              <h4 className="text-white font-bold mb-4">Plan with a local</h4>
              <ul className="space-y-4 text-sm text-white/50">
                <li className="flex gap-3">
                  <ShieldCheck size={18} className="text-brand-light shrink-0" />
                  Talk directly with your guide
                </li>
                <li className="flex gap-3">
                  <Users size={18} className="text-brand-light shrink-0" />
                  Shape the plan around your interests
                </li>
                <li className="flex gap-3">
                  <Globe size={18} className="text-brand-light shrink-0" />
                  Discover the city through local knowledge
                </li>
              </ul>
            </GlassCard>
          )}

          {isMyProfile && (
            <GlassCard className="p-8 border-white/5 text-center">
              <h4 className="text-white font-bold mb-4">Your account</h4>
              <p className="text-white/50 text-sm mb-6">Review your saved destinations and connection requests.</p>

              <Link to="/dashboard" className="button-secondary w-full">Open my space</Link>
            </GlassCard>
          )}
        </div>
      </div>
      {requestOpen && <ConnectionRequestModal guide={{ ...profileData, id }} onClose={(sent) => { setRequestOpen(false); if (sent) setRequestSent(true); }} />}
    </div>
  );
};

export default Profile;
