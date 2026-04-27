import React from 'react';
import { Calendar, MessageSquare, Star, MapPin, User, Settings, Bell, ChevronRight } from 'lucide-react';
import { GlassCard, GlassButton } from '../common/UIComponents';
import { motion } from 'framer-motion';
import DashboardStats from './DashboardStats';
import { Link } from 'react-router-dom';

const ExplorerDashboard = ({ userData, currentUser }) => {
  const userName = userData?.name || currentUser?.displayName || 'Traveler';

  const explorerStats = [
    { label: 'Upcoming Trips', value: '1', icon: Calendar, color: 'text-green-400' },
    { label: 'Saved Locals', value: '4', icon: Star, color: 'text-yellow-400' },
    { label: 'Total Reviews', value: '2', icon: MessageSquare, color: 'text-blue-400' },
    { label: 'Active Chats', value: '3', icon: MessageSquare, color: 'text-purple-400' },
  ];

  const upcomingTrips = [
    { id: 1, name: 'Yuki Tanaka', date: 'Nov 12, 2023', city: 'Tokyo', status: 'confirmed', image: 'Y' },
  ];

  const recentActivity = [
    { id: 1, type: 'save', text: 'You saved Marco Rossi to favorites', date: 'Oct 20, 2023' },
    { id: 2, type: 'chat', text: 'New message from Yuki Tanaka', date: 'Oct 19, 2023' },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {userName}!</h1>
          <p className="text-white/50">Your next adventure is just a click away.</p>
        </div>
        <div className="flex gap-4">
          <button className="p-3 rounded-2xl glass hover:bg-white/10 text-white relative group transition-all">
            <Bell size={20} className="group-hover:scale-110 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full border-2 border-[#1e1b4b]" />
          </button>
          <GlassButton variant="outline" className="px-4 py-3">
            <Settings size={20} />
          </GlassButton>
        </div>
      </div>

      <DashboardStats stats={explorerStats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">Upcoming Trips</h3>
              <Link to="/explore" className="text-brand-light text-sm hover:underline flex items-center gap-1">
                Explore more <ChevronRight size={14} />
              </Link>
            </div>
            
            <div className="space-y-4">
              {upcomingTrips.length > 0 ? (
                upcomingTrips.map((trip) => (
                  <GlassCard key={trip.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 group">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand to-accent flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-105 transition-transform">
                        {trip.image}
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xl">{trip.name}</h4>
                        <div className="flex items-center gap-4 text-white/40 text-sm mt-1">
                          <span className="flex items-center gap-1.5"><Calendar size={14} /> {trip.date}</span>
                          <span className="flex items-center gap-1.5"><MapPin size={14} /> {trip.city}</span>
                        </div>
                      </div>
                    </div>
                    
                    <GlassButton variant="accent" className="w-full md:w-auto px-8">
                      View Details
                    </GlassButton>
                  </GlassCard>
                ))
              ) : (
                <GlassCard className="p-12 text-center border-dashed border-white/10 bg-transparent hover:bg-white/5">
                  <p className="text-white/30 mb-4">No upcoming trips planned yet.</p>
                  <Link to="/explore">
                    <GlassButton variant="outline">Start Exploring</GlassButton>
                  </Link>
                </GlassCard>
              )}
            </div>
          </section>

          <section>
            <h3 className="text-2xl font-bold text-white mb-6">Recent Activity</h3>
            <GlassCard className="p-0 overflow-hidden">
              <div className="divide-y divide-white/5">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="p-5 px-8 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className={`w-2.5 h-2.5 rounded-full ${activity.type === 'save' ? 'bg-purple-400' : 'bg-blue-400'} group-hover:scale-125 transition-transform`} />
                      <div>
                        <p className="text-white text-sm font-medium">{activity.text}</p>
                        <p className="text-white/30 text-xs mt-0.5">{activity.date}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-white/20 group-hover:text-white transition-colors" />
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <GlassCard className="p-8 text-center">
            <div className="relative inline-block mb-6">
              <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-white/10 mx-auto bg-white/5 flex items-center justify-center shadow-2xl">
                <User size={48} className="text-white/20" />
              </div>
              <button className="absolute bottom-1 right-1 w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center shadow-xl border-4 border-[#1e1b4b] hover:scale-110 transition-transform">
                <Settings size={18} />
              </button>
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{userName}</h3>
            <p className="text-white/40 text-sm mb-6">Verified Traveler</p>
            
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/5">
              <div className="text-center">
                <p className="text-white font-bold text-xl">2</p>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.2em]">Reviews</p>
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-xl">1</p>
                <p className="text-white/30 text-[10px] uppercase font-black tracking-[0.2em]">Trips</p>
              </div>
            </div>

            <GlassButton variant="outline" className="w-full mt-8 py-3.5 text-sm font-bold">
              Edit Profile
            </GlassButton>
          </GlassCard>

          <GlassCard className="p-8 bg-gradient-to-br from-brand/20 to-accent/10 border-brand/20 relative overflow-hidden group">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-brand/20 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
            <h4 className="text-white font-bold mb-3 relative z-10">Discover Tokyo</h4>
            <p className="text-white/60 text-xs leading-relaxed mb-6 relative z-10">
              New locals just joined in Tokyo! Connect with them for an authentic experience.
            </p>
            <Link to="/city/Tokyo" className="text-brand-light text-xs font-black uppercase tracking-widest hover:underline relative z-10">
              Explore Now →
            </Link>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default ExplorerDashboard;
