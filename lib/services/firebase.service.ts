import { firebase } from '../firebase';
import { FirebaseError } from 'firebase/app';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot,
  DocumentReference,
  WriteBatch,
  writeBatch,
  onSnapshot,
  Unsubscribe
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { FirebaseError } from 'firebase/app';
import { QueryResult, FirebaseServiceError } from '../types/firebase.types';

export class FirebaseService {
  private static instance: FirebaseService;
  private subscriptions: Map<string, Unsubscribe> = new Map();
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    if (!firebase.db) throw new Error('Firebase not initialized');
  }

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  private handleError(error: unknown, operation: string): never {
    console.error(`Firebase ${operation} error:`, error);
    if (error instanceof FirebaseError) {
      throw new FirebaseServiceError(error.code, error.message, operation);
    }
    throw new FirebaseServiceError('unknown', 'An unknown error occurred', operation);
  }

  private getCached<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data as T;
    }
    return null;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  async queryCollection<T>(
    collectionName: string,
    queryConstraints: any[] = [],
    pageSize: number = 20,
    lastDoc?: QueryDocumentSnapshot<DocumentData>
  ): Promise<QueryResult<T>> {
    try {
      const baseQuery = query(
        collection(firebase.db!, collectionName),
        ...queryConstraints,
        limit(pageSize)
      );

      const finalQuery = lastDoc 
        ? query(baseQuery, startAfter(lastDoc))
        : baseQuery;

      const snapshot = await getDocs(finalQuery);
      
      return {
        items: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T)),
        lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: snapshot.docs.length === pageSize
      };
    } catch (error) {
      this.handleError(error, 'query collection');
    }
  }

  async uploadFile(
    path: string,
    file: File,
    metadata?: any
  ): Promise<string> {
    try {
      const storageRef = ref(firebase.storage!, path);
      const result = await uploadBytes(storageRef, file, metadata);
      return await getDownloadURL(result.ref);
    } catch (error) {
      this.handleError(error, 'upload file');
    }
  }

  subscribeToDocument<T>(
    collectionName: string,
    documentId: string,
    callback: (data: T) => void
  ): () => void {
    const docRef = doc(firebase.db!, collectionName, documentId);
    const subscriptionKey = `${collectionName}/${documentId}`;
    
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as T);
      }
    }, (error) => {
      console.error('Document subscription error:', error);
    });

    this.subscriptions.set(subscriptionKey, unsubscribe);
    return () => this.unsubscribe(subscriptionKey);
  }

  private unsubscribe(key: string): void {
    const unsubscribe = this.subscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  unsubscribeAll(): void {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
  }

  async batchOperation<T>(
    items: T[],
    operation: (batch: WriteBatch, item: T, ref: DocumentReference) => void,
    collectionName: string
  ): Promise<void> {
    const BATCH_SIZE = 500;
    const batches: WriteBatch[] = [];
    
    try {
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        batches.push(writeBatch(firebase.db!));
      }

      items.forEach((item, i) => {
        const batchIndex = Math.floor(i / BATCH_SIZE);
        const ref = doc(collection(firebase.db!, collectionName));
        operation(batches[batchIndex], item, ref);
      });

      await Promise.all(batches.map(batch => batch.commit()));
    } catch (error) {
      this.handleError(error, 'batch operation');
    }
  }
}