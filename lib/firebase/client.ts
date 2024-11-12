import { getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

// Initialize Firebase only on the client side
export const initFirebase = () => {
  if (typeof window === 'undefined') return null;
  
  const apps = getApps();
  const app = apps.length === 0 ? initializeApp(firebaseConfig) : apps[0];
  const db = getFirestore(app);
  
  return { app, db };
};

// Get Firebase instance with error handling
export const getFirebaseInstance = () => {
  try {
    return initFirebase();
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
};