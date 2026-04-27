import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, MapPin, Globe, MessageSquare, Calendar, ShieldCheck, Heart, Share2, ArrowLeft, Users } from 'lucide-react';
import { locals } from '../data/mockData';
import { GlassCard, GlassButton, Badge } from '../components/common/UIComponents';
import { motion } from 'framer-motion';

const Profile = () => {
  const { id } = useParams();
  const local = locals.find(l => l.id === parseInt(id)) || locals[0];

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
              <div className="w-full md:w-56 h-56 rounded-[2rem] overflow-hidden border-4 border-white/10 shadow-2xl">
                <img src={local.image} alt={local.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-4xl font-bold text-white tracking-tight">{local.name}</h1>
                      <Badge variant="accent" className="flex items-center gap-1">
                        <ShieldCheck size={12} /> Verified
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-white/50">
                      <span className="flex items-center gap-1"><MapPin size={16} /> {local.location}</span>
                      <span className="flex items-center gap-1"><Star size={16} className="text-yellow-400 fill-yellow-400" /> {local.rating} ({local.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-3 rounded-2xl glass hover:bg-white/20 text-white transition-colors"><Heart size={20} /></button>
                    <button className="p-3 rounded-2xl glass hover:bg-white/20 text-white transition-colors"><Share2 size={20} /></button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8">
                  {local.interests.map(i => <Badge key={i} variant="white">{i}</Badge>)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-white/5">
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1 font-bold">Languages</p>
                    <p className="text-white font-medium">{local.languages.join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1 font-bold">Availability</p>
                    <p className="text-white font-medium">{local.availability}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs uppercase tracking-wider mb-1 font-bold">Price</p>
                    <p className="text-brand-light font-bold text-lg">{local.price}</p>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* About Section */}
          <section>
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              About {local.name.split(' ')[0]}
            </h3>
            <GlassCard className="p-8 border-white/5 bg-white/5 leading-relaxed text-white/70">
              <p className="text-lg italic mb-6">"{local.bio}"</p>
              <p className="mb-4">
                "I believe that truly seeing a city means going beyond the monuments. While I love the icons, my passion is showing my guests the small details—the pastry shop that's been there for 60 years, the community art project in a back alley, or the best place to watch the sunset away from the crowds."
              </p>
              <p>
                Whether you're looking for a deep dive into urban history, a food tour of my favorite neighborhoods, or just someone to help navigate the subway and point you toward the soul of the city, I'm here to make your visit unforgettable.
              </p>
            </GlassCard>
          </section>

          {/* Reviews Section */}
          <section>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">Reviews</h3>
              <button className="text-brand-light text-sm font-bold">Write a review</button>
            </div>
            <div className="space-y-6">
              {[1, 2].map(r => (
                <GlassCard key={r} className="p-6 border-white/5 bg-white/5">
                  <div className="flex gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-white/10" />
                    <div>
                      <h4 className="text-white font-bold">Reviewer {r}</h4>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} size={10} className="fill-yellow-400 text-yellow-400" />)}
                        <span className="text-white/30 text-[10px] ml-2 font-bold uppercase tracking-wider">2 weeks ago</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-white/60 text-sm leading-relaxed">
                    "Had an absolutely amazing time with {local.name.split(' ')[0]}! We saw things we never would have found on our own. Highly recommend the sunset walking tour."
                  </p>
                </GlassCard>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - Actions */}
        <div className="lg:col-span-1 space-y-8">
          <GlassCard className="p-8 border-brand/20 bg-brand/10 sticky top-32">
            <h3 className="text-2xl font-bold text-white mb-6">Connect with {local.name.split(' ')[0]}</h3>
            <p className="text-white/50 text-sm mb-8">Ready to plan your experience? Send a request or chat now to discuss details.</p>
            
            <div className="space-y-4">
              <GlassButton variant="accent" className="w-full py-4 text-lg">
                <Calendar size={20} />
                Send Connection Request
              </GlassButton>
              <Link to="/chat" className="block">
                <GlassButton variant="outline" className="w-full py-4 text-lg">
                  <MessageSquare size={20} />
                  Chat Now
                </GlassButton>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
              <div className="flex items-center justify-between text-sm text-white/50">
                <span>Response Rate</span>
                <span className="text-white font-medium">98%</span>
              </div>
              <div className="flex items-center justify-between text-sm text-white/50">
                <span>Response Time</span>
                <span className="text-white font-medium">&lt; 1 hour</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8 border-white/5">
            <h4 className="text-white font-bold mb-4">Why book with a local?</h4>
            <ul className="space-y-4 text-sm text-white/50">
              <li className="flex gap-3">
                <ShieldCheck size={18} className="text-brand-light shrink-0" />
                Verified & Background Checked
              </li>
              <li className="flex gap-3">
                <Users size={18} className="text-brand-light shrink-0" />
                Personalized experiences
              </li>
              <li className="flex gap-3">
                <Globe size={18} className="text-brand-light shrink-0" />
                Support local communities
              </li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;
