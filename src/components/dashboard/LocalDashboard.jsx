import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Star, MessageSquare, Settings, Check, X, ChevronRight, MapPin, Calendar, MessageCircle } from 'lucide-react';
import { GlassCard, GlassButton } from '../common/UIComponents';
import { motion } from 'framer-motion';
import DashboardStats from './DashboardStats';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsMenu from '../common/NotificationsMenu';
import { db } from '../../firebase/config';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';

const LocalDashboard = ({ userData, currentUser }) => {
  const userName = userData?.name || currentUser?.displayName || 'Local Guide';
  const navigate = useNavigate();
  const [travelers, setTravelers] = useState([]);
  const [loadingTravelers, setLoadingTravelers] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    // Query chats where the current local guide is a participant
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const travelerList = await Promise.all(chatsData.map(async (chat) => {
        const travelerId = chat.participants.find(id => id !== currentUser.uid);
        if (!travelerId) return null;

        // Fetch traveler profile
        const travelerDoc = await getDoc(doc(db, 'users', travelerId));
        if (travelerDoc.exists()) {
          const travelerData = travelerDoc.data();
          return {
            id: travelerId,
            chatId: chat.id,
            name: travelerData.name || 'Traveler',
            lastMessage: chat.lastMessage || 'Sent you a message',
            updatedAt: chat.updatedAt,
            image: travelerData.image,
            status: 'active'
          };
        }
        return null;
      }));

      // Filter out nulls and sort by updatedAt
      const filteredTravelers = travelerList
        .filter(t => t !== null)
        .sort((a, b) => {
          const timeA = a.updatedAt?.toMillis ? a.updatedAt.toMillis() : 0;
          const timeB = b.updatedAt?.toMillis ? b.updatedAt.toMillis() : 0;
          return timeB - timeA;
        });

      setTravelers(filteredTravelers);
      setLoadingTravelers(false);
    });

    return unsubscribe;
  }, [currentUser]);

  const localStats = [
    { label: 'Total Earnings', value: '$1,240', icon: DollarSign, color: 'text-green-400' },
    { label: 'Pending Requests', value: '3', icon: Users, color: 'text-blue-400' },
    { label: 'Avg Rating', value: '4.9', icon: Star, color: 'text-yellow-400' },
    { label: 'Active Chats', value: travelers.length.toString(), icon: MessageSquare, color: 'text-purple-400' },
  ];

  const recentReviews = [
    { id: 1, user: 'Sarah K.', rating: 5, comment: 'Amazing guide, showed us hidden gems!', date: 'Oct 15, 2023' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Guide Dashboard</h1>
          <p className="text-white/50">Manage your tours, earnings, and traveler requests.</p>
        </div>
        <div className="flex gap-4">
          <NotificationsMenu currentUser={currentUser} className="p-1 rounded-2xl glass hover:bg-white/10" />
          <GlassButton variant="outline" className="px-4 py-3">
            <Settings size={20} />
          </GlassButton>
        </div>
      </div>

      <DashboardStats stats={localStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Traveler Inquiries</h3>
              <Link to="/chat" className="text-brand-light text-sm hover:underline">View All Messages</Link>
            </div>
            
            <div className="space-y-4">
              {loadingTravelers ? (
                <div className="space-y-4">
                  {[1, 2].map(i => (
                    <GlassCard key={i} className="p-6 animate-pulse bg-white/5 h-24" />
                  ))}
                </div>
              ) : travelers.length > 0 ? (
                travelers.map((traveler) => (
                  <GlassCard key={traveler.chatId} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                      {traveler.image ? (
                        <img src={traveler.image} alt={traveler.name} className="w-14 h-14 rounded-2xl object-cover border border-white/10" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-white font-bold text-xl uppercase border border-white/10">
                          {traveler.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-white font-bold text-lg">{traveler.name}</h4>
                        <div className="flex items-center gap-4 text-white/40 text-xs mt-1">
                          <span className="flex items-center gap-1.5 line-clamp-1 italic">
                            <MessageCircle size={14} /> "{traveler.lastMessage}"
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                      <GlassButton 
                        variant="accent" 
                        className="flex-1 md:flex-none py-2.5 px-6 gap-2"
                        onClick={() => navigate(`/chat/${traveler.id}`)}
                      >
                        <MessageSquare size={18} />
                        Chat
                      </GlassButton>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <GlassCard className="p-12 text-center border-dashed border-white/10 bg-transparent">
                  <p className="text-white/30">No new traveler inquiries yet.</p>
                </GlassCard>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-white mb-6">Recent Reviews</h3>
            <div className="space-y-4">
              {recentReviews.map((review) => (
                <GlassCard key={review.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center text-brand-light font-bold text-sm">
                        {review.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{review.user}</p>
                        <p className="text-white/30 text-[10px] uppercase font-bold tracking-wider">{review.date}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/10'} />
                      ))}
                    </div>
                  </div>
                  <p className="text-white/70 text-sm italic leading-relaxed">"{review.comment}"</p>
                </GlassCard>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <GlassCard className="p-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/10 mx-auto bg-white/5 flex items-center justify-center">
                <Users size={48} className="text-white/20" />
              </div>
              <div className="absolute -top-2 -right-2 px-3 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg border-2 border-[#1e1b4b]">
                Active
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{userName}</h3>
            <p className="text-white/40 text-sm mb-6 flex items-center justify-center gap-1.5">
              <MapPin size={14} /> {userData?.location || 'Tokyo, Japan'}
            </p>
            
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
              <div className="text-center">
                <p className="text-white font-bold text-xl">4.9</p>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.2em]">Rating</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">124</p>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.2em]">Tours</p>
              </div>
            </div>

            <Link to="/profile">
              <GlassButton variant="accent" className="w-full mt-8 py-3.5 text-sm font-bold">
                Preview Public Profile
              </GlassButton>
            </Link>
          </GlassCard>

          <GlassCard className="p-8 border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                <DollarSign size={18} />
              </div>
              <h4 className="text-white font-bold">Earnings Tip</h4>
            </div>
            <p className="text-white/50 text-xs leading-relaxed mb-6">
              You're in the top 5% of guides this month! Keep responding quickly to maintain your status.
            </p>
            <button className="text-green-400 text-xs font-bold hover:underline uppercase tracking-widest">
              View Payouts →
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default LocalDashboard;
