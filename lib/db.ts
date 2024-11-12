import { getFirebaseInstance } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  DocumentData,
  QuerySnapshot,
  DocumentReference
} from 'firebase/firestore';
import { Property } from './types';
import { isValidProperty, sanitizeProperty } from './utils';

export async function getProperties(): Promise<Property[]> {
  const { db } = getFirebaseInstance();
  
  try {
    const propertiesCol = collection(db, 'properties');
    const snapshot: QuerySnapshot<DocumentData> = await getDocs(propertiesCol);
    
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
  const { db } = getFirebaseInstance();
  const sanitizedProperty = sanitizeProperty({ ...property, id: '' });
  const { id, ...propertyWithoutId } = sanitizedProperty;
  
  try {
    const propertiesCol = collection(db, 'properties');
    const docRef = await addDoc(propertiesCol, propertyWithoutId);
    return docRef.id;
  } catch (error) {
    console.error('Error adding property:', error);
    throw new Error('Failed to add property');
  }
}

export async function updateProperty(id: string, property: Partial<Property>): Promise<void> {
  const { db } = getFirebaseInstance();
  
  try {
    const propertyRef: DocumentReference = doc(db, 'properties', id);
    const sanitizedUpdate = sanitizeProperty({ ...property, id });
    const updateData: DocumentData = {
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
  const { db } = getFirebaseInstance();
  
  try {
    const propertyRef = doc(db, 'properties', id);
    await deleteDoc(propertyRef);
  } catch (error) {
    console.error('Error deleting property:', error);
    throw new Error('Failed to delete property');
  }
}