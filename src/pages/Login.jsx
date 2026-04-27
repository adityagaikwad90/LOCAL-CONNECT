import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react';
import { GlassCard, GlassButton } from '../components/common/UIComponents';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [role, setRole] = useState('explorer'); // 'explorer' or 'local'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      // Optionally check if the user role matches the selected role
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== role) {
          // You can choose to warn them, or simply redirect them based on their actual role
          console.warn(`User signed in as ${role} but account is registered as ${userData.role}`);
        }
      }

      if (role === 'local') {
        navigate('/dashboard');
      } else {
        navigate('/explore');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to log in. Please check your email and password.');
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
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/50">Log in to continue your journey</p>
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

            <div className="flex justify-end pt-1">
              <a href="#" className="text-sm text-brand-light hover:underline">Forgot password?</a>
            </div>

            <GlassButton 
              variant="accent" 
              className="w-full py-4 mt-4 flex justify-center items-center gap-2 disabled:opacity-50"
              disabled={loading}
            >
              <LogIn size={18} />
              {loading ? 'Logging in...' : `Login as ${role === 'explorer' ? 'Traveler' : 'Local Guide'}`}
            </GlassButton>
          </form>

          <div className="mt-6 text-center text-sm text-white/50">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-light hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default Login;
