import React, { useEffect, useState } from 'react';
import { CalendarDays, Check, Clock3, MessageCircle, Users, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, doc, onSnapshot, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase/config';

const formatDate = (date) => date ? new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date flexible';

const ConnectionRequestsPanel = ({ currentUser, role }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [feedback, setFeedback] = useState('');
  const incoming = role === 'local';

  useEffect(() => {
    if (!currentUser) return undefined;
    const ownerField = incoming ? 'guideId' : 'travelerId';
    const q = query(collection(db, 'connectionRequests'), where(ownerField, '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const rows = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setRequests(rows);
      setLoading(false);
    }, (error) => {
      console.error('Connection request listener failed:', error);
      setFeedback('Requests could not be loaded. Check your connection and try again.');
      setLoading(false);
    });
    return unsubscribe;
  }, [currentUser, incoming]);

  const updateRequest = async (request, status) => {
    setWorkingId(request.id);
    setFeedback('');
    try {
      const batch = writeBatch(db);
      const requestRef = doc(db, 'connectionRequests', request.id);
      batch.update(requestRef, { status, updatedAt: serverTimestamp() });
      if (status === 'accepted') {
        const chatId = `request_${request.id}`;
        const chatRef = doc(db, 'chats', chatId);
        batch.set(chatRef, {
          participants: [request.travelerId, request.guideId],
          connectionRequestId: request.id,
          updatedAt: serverTimestamp(),
          lastMessage: 'Your experience request was accepted. Say hello!'
        }, { merge: true });
        batch.update(requestRef, { chatId });
        batch.set(doc(collection(db, 'notifications')), {
          userId: request.travelerId,
          title: `${request.guideName} accepted your request`,
          body: `Your plan for ${formatDate(request.date)} is ready to discuss.`,
          link: `/chat/${request.guideId}`,
          read: false,
          createdAt: serverTimestamp()
        });
      } else {
        batch.set(doc(collection(db, 'notifications')), {
          userId: request.travelerId,
          title: `${request.guideName} declined your request`,
          body: `Your request for ${formatDate(request.date)} was declined. You can explore other guides nearby.`,
          link: '/explore',
          read: false,
          createdAt: serverTimestamp()
        });
      }
      await batch.commit();
    } catch (error) {
      console.error('Unable to update connection request:', error);
      setFeedback('That update did not go through. Please try again.');
    } finally {
      setWorkingId('');
    }
  };

  const title = incoming ? 'Traveler requests' : 'Your experience requests';
  const description = incoming ? 'Review plans from travelers and accept the ones you would love to host.' : 'Keep track of your plans with local guides.';

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="eyebrow">Make it happen</p><h2 className="section-title">{title}</h2><p className="mt-1 text-white/55">{description}</p></div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/70">{requests.filter((request) => request.status === 'pending').length} pending</span>
      </div>
      {feedback && <p role="alert" className="rounded-xl bg-red-400/10 p-3 text-sm text-red-200">{feedback}</p>}
      {loading ? <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-white/50">Loading requests…</div> : requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-10 text-center">
          <CalendarDays className="mx-auto mb-3 text-orange-200" size={24} />
          <p className="font-semibold text-white">No requests yet</p>
          <p className="mt-1 text-sm text-white/50">{incoming ? 'When a traveler reaches out, their plan will appear here.' : 'Find a local and send them a plan for your trip.'}</p>
          {!incoming && <Link to="/explore" className="mt-4 inline-flex button-primary">Explore local guides</Link>}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{requests.map((request) => {
          const otherName = incoming ? request.travelerName : request.guideName;
          const statusColor = request.status === 'accepted' ? 'text-emerald-300 bg-emerald-300/10' : request.status === 'declined' ? 'text-rose-200 bg-rose-200/10' : 'text-amber-100 bg-amber-100/10';
          return <article key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-lg font-semibold text-white">{otherName}</p><p className="text-sm text-white/50">{request.city || 'Local experience'}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColor}`}>{request.status}</span></div>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/70"><span className="inline-flex items-center gap-2"><CalendarDays size={15} />{formatDate(request.date)}</span><span className="inline-flex items-center gap-2"><Clock3 size={15} />{request.time || 'Time flexible'}</span><span className="inline-flex items-center gap-2"><Users size={15} />{request.groupSize || 1} guests</span></div>
            {!!request.interests?.length && <div className="mt-3 flex flex-wrap gap-2">{request.interests.map((interest) => <span key={interest} className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-white/65">{interest}</span>)}</div>}
            {request.note && <p className="mt-3 rounded-xl bg-black/20 p-3 text-sm leading-relaxed text-white/70">“{request.note}”</p>}
            {incoming && request.status === 'pending' && <div className="mt-4 flex gap-2"><button disabled={!!workingId} onClick={() => updateRequest(request, 'accepted')} className="button-primary flex-1 disabled:opacity-50">{workingId === request.id ? 'Updating…' : <><Check size={16} />Accept & open chat</>}</button><button disabled={!!workingId} onClick={() => updateRequest(request, 'declined')} className="button-secondary disabled:opacity-50"><X size={16} />Decline</button></div>}
            {request.status === 'accepted' && <Link to={`/chat/${incoming ? request.travelerId : request.guideId}`} className="mt-4 inline-flex button-secondary"><MessageCircle size={16} />Open chat</Link>}
          </article>;
        })}</div>
      )}
    </section>
  );
};

export default ConnectionRequestsPanel;
