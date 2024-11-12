import { useState, useEffect } from 'react';
import { FirebaseService } from '../services/firebase.service';
import { QueryResult } from '../types/firebase.types';

export function useFirebaseQuery<T>(
  collectionName: string,
  queryConstraints: any[] = [],
  pageSize: number = 20
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const firebaseService = FirebaseService.getInstance();

  const loadMore = async () => {
    try {
      setLoading(true);
      const result = await firebaseService.queryCollection<T>(
        collectionName,
        queryConstraints,
        pageSize,
        lastDoc
      );
      
      setData(prev => [...prev, ...result.items]);
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMore();
    return () => {
      firebaseService.unsubscribeAll();
    };
  }, []);

  return { data, loading, error, hasMore, loadMore };
}

export function useFirebaseDocument<T>(
  collectionName: string,
  documentId: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const firebaseService = FirebaseService.getInstance();
    
    try {
      const unsubscribe = firebaseService.subscribeToDocument<T>(
        collectionName,
        documentId,
        (newData) => {
          setData(newData);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setLoading(false);
    }
  }, [collectionName, documentId]);

  return { data, loading, error };
}