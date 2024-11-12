import { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase/firestore';

export interface QueryResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
}

export class FirebaseServiceError extends Error {
  constructor(
    public code: string,
    message: string,
    public operation: string
  ) {
    super(message);
    this.name = 'FirebaseServiceError';
  }
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface FirebaseInstance {
  app: any;
  db: any;
  auth: any;
  storage: any;
  analytics: Promise<any> | null;
}