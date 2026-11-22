import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';

export const createConnectionRequest = async (request) => {
  if (!request.travelerId || !request.guideId) throw new Error('Please sign in to send a request.');
  if (request.travelerId === request.guideId) throw new Error('You cannot request an experience from your own account.');
  const batch = writeBatch(db);
  const requestRef = doc(collection(db, 'connectionRequests'));
  batch.set(requestRef, {
    ...request,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(collection(db, 'notifications')), {
    userId: request.guideId,
    title: `New experience request from ${request.travelerName}`,
    body: `${request.city || 'Your city'} · ${request.date} at ${request.time}`,
    link: '/dashboard',
    read: false,
    createdAt: serverTimestamp(),
  });
  await batch.commit();
  return requestRef;
};
