import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore as _getFirestore, Firestore, connectFirestoreEmulator, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth as _getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage as _getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let firebaseApp: FirebaseApp | undefined;
let firestoreDb: Firestore | undefined;

export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    if (!firebaseApp) {
      firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    }

    if (!firestoreDb) {
      firestoreDb = _getFirestore(firebaseApp);
      
      // Enable offline persistence
      enableIndexedDbPersistence(firestoreDb).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
        } else if (err.code === 'unimplemented') {
          console.warn('The current browser doesn\'t support persistence.');
        }
      });
      
      // Connect to emulators in development
      if (process.env.NODE_ENV === 'development') {
        if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
          connectFirestoreEmulator(firestoreDb, 'localhost', 8080);
          const auth = _getAuth(firebaseApp);
          connectAuthEmulator(auth, 'http://localhost:9099');
          const storage = _getStorage(firebaseApp);
          connectStorageEmulator(storage, 'localhost', 9199);
        }
      }
    }

    return {
      app: firebaseApp,
      db: firestoreDb,
      auth: _getAuth(firebaseApp),
      storage: _getStorage(firebaseApp)
    };
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    return null;
  }
}

export function getDb() {
  const firebase = initializeFirebase();
  return firebase?.db;
}

export function getFirebaseAuth() {
  const firebase = initializeFirebase();
  return firebase?.auth;
}

export function getFirebaseStorage() {
  const firebase = initializeFirebase();
  return firebase?.storage;
}

// Initialize and export instances
const firebase = initializeFirebase();
export const db = firebase?.db;
export const auth = firebase?.auth;
export const storage = firebase?.storage;