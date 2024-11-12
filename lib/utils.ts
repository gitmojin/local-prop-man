import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Property, Unit, Contact, Task } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Validation functions
export function isValidProperty(property: any): property is Property {
  return (
    property &&
    typeof property === 'object' &&
    typeof property.id === 'string' &&
    typeof property.address === 'string' &&
    Array.isArray(property.units)
  );
}

export function isValidUnit(unit: any): unit is Unit {
  return (
    unit &&
    typeof unit === 'object' &&
    typeof unit.id === 'string' &&
    typeof unit.number === 'string' &&
    typeof unit.floor === 'number' &&
    isValidTenant(unit.tenant) &&
    Array.isArray(unit.appliances) &&
    Array.isArray(unit.maintenanceHistory)
  );
}

export function isValidTenant(tenant: any): boolean {
  return (
    tenant &&
    typeof tenant === 'object' &&
    typeof tenant.name === 'string' &&
    typeof tenant.phone === 'string' &&
    typeof tenant.email === 'string'
  );
}

export function isValidContact(contact: any): contact is Contact {
  return (
    contact &&
    typeof contact === 'object' &&
    typeof contact.id === 'string' &&
    typeof contact.name === 'string' &&
    typeof contact.type === 'string' &&
    ['tenant', 'maintenance', 'admin', 'other'].includes(contact.type) &&
    typeof contact.phone === 'string' &&
    typeof contact.email === 'string' &&
    Array.isArray(contact.tags)
  );
}

export function isValidTask(task: any): task is Task {
  return (
    task &&
    typeof task === 'object' &&
    typeof task.id === 'string' &&
    typeof task.title === 'string' &&
    typeof task.description === 'string' &&
    typeof task.propertyId === 'string' &&
    typeof task.unitId === 'string' &&
    ['pending', 'completed'].includes(task.status) &&
    ['low', 'medium', 'high'].includes(task.priority) &&
    typeof task.dueDate === 'string'
  );
}

// Sanitization functions
export function sanitizeProperty(property: any): Property {
  if (!property) return createEmptyProperty();
  
  return {
    id: property.id || '',
    address: property.address || '',
    image: property.image || '/placeholder-property.jpg',
    units: Array.isArray(property.units) 
      ? property.units.filter(isValidUnit).map(sanitizeUnit)
      : []
  };
}

export function sanitizeUnit(unit: any): Unit {
  if (!unit) return createEmptyUnit();

  return {
    id: unit.id || '',
    number: unit.number || '',
    floor: typeof unit.floor === 'number' ? unit.floor : 1,
    tenant: sanitizeTenant(unit.tenant),
    appliances: Array.isArray(unit.appliances) ? unit.appliances : [],
    maintenanceHistory: Array.isArray(unit.maintenanceHistory) 
      ? unit.maintenanceHistory.map(sanitizeMaintenanceRecord)
      : []
  };
}

export function sanitizeTenant(tenant: any) {
  if (!tenant) return createEmptyTenant();

  return {
    name: tenant.name || '',
    phone: tenant.phone || '',
    email: tenant.email || ''
  };
}

export function sanitizeMaintenanceRecord(record: any) {
  if (!record) return createEmptyMaintenanceRecord();

  return {
    date: record.date || new Date().toISOString(),
    description: record.description || '',
    images: Array.isArray(record.images) ? record.images : []
  };
}

export function sanitizeContact(contact: any): Contact {
  if (!contact) return createEmptyContact();

  return {
    id: contact.id || '',
    name: contact.name || '',
    type: ['tenant', 'maintenance', 'admin', 'other'].includes(contact.type) 
      ? contact.type 
      : 'other',
    phone: contact.phone || '',
    email: contact.email || '',
    unit: contact.unit || undefined,
    specialty: contact.specialty || undefined,
    notes: contact.notes || undefined,
    tags: Array.isArray(contact.tags) ? contact.tags : []
  };
}

export function sanitizeTask(task: any): Task {
  if (!task) return createEmptyTask();

  return {
    id: task.id || '',
    title: task.title || '',
    description: task.description || '',
    propertyId: task.propertyId || '',
    unitId: task.unitId || '',
    status: ['pending', 'completed'].includes(task.status) ? task.status : 'pending',
    priority: ['low', 'medium', 'high'].includes(task.priority) ? task.priority : 'medium',
    dueDate: task.dueDate || new Date().toISOString(),
    assignedTo: task.assignedTo || undefined,
    completedDate: task.completedDate || undefined,
    notes: task.notes || undefined
  };
}

// Empty object creators
export function createEmptyProperty(): Property {
  return {
    id: '',
    address: '',
    image: '/placeholder-property.jpg',
    units: []
  };
}

export function createEmptyUnit(): Unit {
  return {
    id: '',
    number: '',
    floor: 1,
    tenant: createEmptyTenant(),
    appliances: [],
    maintenanceHistory: []
  };
}

export function createEmptyTenant() {
  return {
    name: '',
    phone: '',
    email: ''
  };
}

export function createEmptyMaintenanceRecord() {
  return {
    date: new Date().toISOString(),
    description: '',
    images: []
  };
}

export function createEmptyContact(): Contact {
  return {
    id: '',
    name: '',
    type: 'other',
    phone: '',
    email: '',
    tags: []
  };
}

export function createEmptyTask(): Task {
  return {
    id: '',
    title: '',
    description: '',
    propertyId: '',
    unitId: '',
    status: 'pending',
    priority: 'medium',
    dueDate: new Date().toISOString()
  };
}