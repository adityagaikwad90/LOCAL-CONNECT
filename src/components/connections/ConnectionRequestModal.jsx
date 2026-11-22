import React, { useState } from 'react';
import { CalendarDays, Clock3, Users, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createConnectionRequest } from '../../services/connectionRequests';

const localNow = new Date();
localNow.setMinutes(localNow.getMinutes() - localNow.getTimezoneOffset());
const today = localNow.toISOString().slice(0, 10);

const ConnectionRequestModal = ({ guide, onClose }) => {
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ date: '', time: '', groupSize: '2', interests: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    if (userData?.role === 'local') {
      setError('Only traveler accounts can request a local experience.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createConnectionRequest({
        travelerId: currentUser.uid,
        travelerName: userData?.name || currentUser.displayName || 'Traveler',
        guideId: guide.id,
        guideName: guide.name || 'Local guide',
        city: guide.location || '',
        date: form.date,
        time: form.time,
        groupSize: Number(form.groupSize),
        interests: form.interests.split(',').map((interest) => interest.trim()).filter(Boolean),
        note: form.note.trim(),
      });
      onClose(true);
    } catch (err) {
      setError(err.message || 'We could not send your request. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" onMouseDown={(event) => event.target === event.currentTarget && onClose(false)}>
      <section role="dialog" aria-modal="true" aria-labelledby="request-title" className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#111a24] p-6 text-white shadow-2xl sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-orange-300">Plan an experience</p>
            <h2 id="request-title" className="text-2xl font-bold">Meet {guide.name}</h2>
            <p className="mt-1 text-white/60">Send a request for {guide.location || 'your destination'}.</p>
          </div>
          <button type="button" aria-label="Close" onClick={() => onClose(false)} className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-white/80">Preferred date
              <span className="relative block"><CalendarDays size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input required min={today} type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className="field-control pl-10" /></span>
            </label>
            <label className="space-y-2 text-sm font-medium text-white/80">Start time
              <span className="relative block"><Clock3 size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><input required type="time" value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} className="field-control pl-10" /></span>
            </label>
          </div>
          <label className="block space-y-2 text-sm font-medium text-white/80">Group size
            <span className="relative block"><Users size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" /><select value={form.groupSize} onChange={(event) => setForm({ ...form, groupSize: event.target.value })} className="field-control pl-10">{[1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'person' : 'people'}</option>)}</select></span>
          </label>
          <label className="block space-y-2 text-sm font-medium text-white/80">What are you into? <span className="font-normal text-white/40">(optional)</span>
            <input value={form.interests} onChange={(event) => setForm({ ...form, interests: event.target.value })} placeholder="Street food, architecture, markets" className="field-control" />
          </label>
          <label className="block space-y-2 text-sm font-medium text-white/80">A note for {guide.name.split(' ')[0]} <span className="font-normal text-white/40">(optional)</span>
            <textarea rows="3" maxLength="600" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} placeholder="Tell them what kind of day you have in mind…" className="field-control resize-y" />
          </label>
          {error && <p role="alert" className="rounded-xl border border-red-300/20 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
          <div className="flex flex-col-reverse gap-3 pt-1 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => onClose(false)} className="button-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="button-primary disabled:cursor-wait disabled:opacity-60">{saving ? 'Sending request…' : 'Send request'}</button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ConnectionRequestModal;
