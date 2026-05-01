import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ExplorerDashboard from '../components/dashboard/ExplorerDashboard';
import LocalDashboard from '../components/dashboard/LocalDashboard';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { userData, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!currentUser) {
        navigate('/login');
      } else if (userData?.role === 'explorer') {
        navigate('/explore');
      }
    }
  }, [currentUser, userData, loading, navigate]);
  
  if (loading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If we have a user but no userData yet, we might still be fetching role
  if (currentUser && !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isExplorer = userData?.role === 'explorer';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pt-28 pb-20 container mx-auto px-4 min-h-screen"
    >
      {isExplorer ? (
        <ExplorerDashboard userData={userData} currentUser={currentUser} />
      ) : (
        <LocalDashboard userData={userData} currentUser={currentUser} />
      )}
    </motion.div>
  );
};

export default Dashboard;
