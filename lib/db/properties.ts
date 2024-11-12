import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseInstance } from '../firebase/client';
import { Property } from '../types';
import { isValidProperty, sanitizeProperty } from '../utils';

export async function getProperties(): Promise<Property[]> {
  const firebase = getFirebaseInstance();
  if (!firebase?.db) return [];
  
  try {
    const propertiesCol = collection(firebase.db, 'properties');
    const snapshot = await getDocs(propertiesCol);
    
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Property))
      .filter(isValidProperty)
      .map(sanitizeProperty);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export async function addProperty(property: Omit<Property, "id">): Promise<string> {
  const firebase = getFirebaseInstance();
  if (!firebase?.db) throw new Error('Firebase not initialized');

  const sanitizedProperty = sanitizeProperty({ ...property, id: '' });
  const { id, ...propertyWithoutId } = sanitizedProperty;
  
  try {
    const propertiesCol = collection(firebase.db, 'properties');
    const docRef = await addDoc(propertiesCol, propertyWithoutId);
    return docRef.id;
  } catch (error) {
    console.error('Error adding property:', error);
    throw new Error('Failed to add property');
  }
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<void> {
  const firebase = getFirebaseInstance();
  if (!firebase?.db) throw new Error('Firebase not initialized');

  try {
    const propertyRef = doc(firebase.db, 'properties', id);
    const sanitizedUpdate = sanitizeProperty({ ...property, id });
    const updateData = {
      address: sanitizedUpdate.address,
      image: sanitizedUpdate.image,
      units: sanitizedUpdate.units
    };
    await updateDoc(propertyRef, updateData);
  } catch (error) {
    console.error('Error updating property:', error);
    throw new Error('Failed to update property');
  }
}

export async function deleteProperty(id: string): Promise<void> {
  const firebase = getFirebaseInstance();
  if (!firebase?.db) throw new Error('Firebase not initialized');

  try {
    const propertyRef = doc(firebase.db, 'properties', id);
    await deleteDoc(propertyRef);
  } catch (error) {
    console.error('Error deleting property:', error);
    throw new Error('Failed to delete property');
  }
}