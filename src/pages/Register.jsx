import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, User, MapPin, Tag, UserPlus, AlertCircle } from 'lucide-react';
import { GlassCard, GlassButton } from '../components/common/UIComponents';
import { trendingCities } from '../data/mockData';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, getDocs } from 'firebase/firestore';

const INTERESTS_OPTIONS = [
  "Food", "History", "Nightlife", "Nature", "Art", 
  "Culture", "Photography", "Music", "Sports", "Shopping"
];

const Register = () => {
  const [role, setRole] = useState('explorer'); // 'explorer' or 'local'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
  });
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLocations = async () => {
      if (role !== 'local') return;
      
      setLoadingLocations(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'locations'));
        const locData = [];
        querySnapshot.forEach((doc) => {
          locData.push({ id: doc.id, ...doc.data() });
        });
        setLocations(locData);
      } catch (err) {
        console.error("Error fetching locations:", err);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (role === 'local' && !formData.location) {
      setError('Please select a location.');
      return;
    }

    if (role === 'local' && selectedInterests.length === 0) {
      setError('Please select at least one interest.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Auth Profile
      await updateProfile(user, { displayName: formData.name });

      // 3. Save additional data to Firestore
      const userData = {
        name: formData.name,
        email: formData.email,
        role: role,
        createdAt: new Date().toISOString()
      };

      if (role === 'local') {
        userData.location = formData.location;
        userData.interests = selectedInterests;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      // 4. Redirect
      if (role === 'local') {
        navigate('/dashboard');
      } else {
        navigate('/explore');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create an account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 min-h-screen container mx-auto px-4 pb-20 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/50">Join our community of global travelers</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-white/5 rounded-2xl p-1 mb-8">
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                role === 'explorer' 
                  ? 'bg-brand text-white shadow-lg' 
                  : 'text-white/50 hover:text-white'
              }`}
              onClick={() => setRole('explorer')}
            >
              Traveler
            </button>
            <button
              type="button"
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                role === 'local' 
                  ? 'bg-brand text-white shadow-lg' 
                  : 'text-white/50 hover:text-white'
              }`}
              onClick={() => setRole('local')}
            >
              Local Guide
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 text-sm">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-white/70 text-sm font-medium px-1">Full Name</label>
              <div className="glass p-1 px-4 flex items-center gap-3 rounded-2xl">
                <User size={18} className="text-white/40" />
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe" 
                  className="bg-transparent border-none outline-none text-white py-3 w-full text-sm"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-white/70 text-sm font-medium px-1">Email Address</label>
              <div className="glass p-1 px-4 flex items-center gap-3 rounded-2xl">
                <Mail size={18} className="text-white/40" />
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="hello@example.com" 
                  className="bg-transparent border-none outline-none text-white py-3 w-full text-sm"
                  required
                />
              </div>
            </div>

            {role === 'local' && (
              <>
                <div className="space-y-1">
                  <label className="text-white/70 text-sm font-medium px-1">Your Location</label>
                  <div className="glass p-1 px-4 flex items-center gap-3 rounded-2xl">
                    <MapPin size={18} className="text-white/40" />
                    <select
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="bg-transparent border-none outline-none text-white py-3 w-full text-sm appearance-none"
                      required
                    >
                      <option value="" disabled className="text-gray-800">Select a location</option>
                      {loadingLocations ? (
                        <option value="" disabled className="text-gray-800">Loading...</option>
                      ) : (
                        [...new Set([
                          ...trendingCities.map(c => c.name),
                          ...locations.map(loc => loc.name || loc.id)
                        ])].map((locName) => (
                          <option key={locName} value={locName} className="text-gray-800">
                            {locName}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-white/70 text-sm font-medium px-1">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {INTERESTS_OPTIONS.map((interest) => {
                      const isSelected = selectedInterests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            isSelected 
                              ? 'bg-brand text-white' 
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-white/70 text-sm font-medium px-1">Password</label>
              <div className="glass p-1 px-4 flex items-center gap-3 rounded-2xl">
                <Lock size={18} className="text-white/40" />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••" 
                  className="bg-transparent border-none outline-none text-white py-3 w-full text-sm"
                  required
                />
              </div>
            </div>

            <GlassButton 
              variant="accent" 
              className="w-full py-4 mt-6 flex justify-center items-center gap-2 disabled:opacity-50"
              disabled={loading}
            >
              <UserPlus size={18} />
              {loading ? 'Creating Account...' : 'Create Account'}
            </GlassButton>
          </form>

          <div className="mt-6 text-center text-sm text-white/50">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-light hover:underline font-medium">
              Log in
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Register;
