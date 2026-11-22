import React, { useEffect } from 'react';
import { Compass, MapPin, UserRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConnectionRequestsPanel from '../components/connections/ConnectionRequestsPanel';

const Dashboard = () => {
  const { userData, currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) navigate('/login');
  }, [currentUser, loading, navigate]);

  if (loading || !currentUser) return <div className="page-shell flex min-h-[70vh] items-center justify-center text-white/60">Loading your dashboard…</div>;
  const isLocal = userData.role === 'local';

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <div><p className="eyebrow">Your space</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">Good to see you, {userData.name?.split(' ')[0] || 'there'}.</h1><p className="mt-3 max-w-xl text-lg text-white/55">{isLocal ? 'Your next great connection starts with a traveler’s plan.' : 'Keep your local connections and trip plans in one place.'}</p></div>
          <Link to={isLocal ? '/profile' : '/explore'} className="button-secondary">{isLocal ? <><UserRound size={17} />View your profile</> : <><Compass size={17} />Find a local</>}</Link>
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-sm text-white/45">Your role</p><p className="mt-2 text-xl font-semibold capitalize text-white">{isLocal ? 'Local guide' : 'Traveler'}</p></div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5"><p className="text-sm text-white/45">{isLocal ? 'Based in' : 'Saved destinations'}</p><p className="mt-2 flex items-center gap-2 text-xl font-semibold text-white">{isLocal ? <><MapPin size={18} className="text-orange-200" />{userData.location || 'Add your city'}</> : `${userData.likedCities?.length || 0} saved`}</p></div>
        </div>
        <ConnectionRequestsPanel currentUser={currentUser} role={userData.role} />
      </div>
    </main>
  );
};

export default Dashboard;
