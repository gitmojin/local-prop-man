export interface Unit {
  id: string
  number: string
  floor: number
  tenant: {
    name: string
    phone: string
    email: string
  }
  appliances: string[]
  maintenanceHistory: {
    date: string
    description: string
    images: string[]
  }[]
}

export interface Property {
  id: string
  address: string
  image: string
  units: Unit[]
}

export interface Task {
  id: string
  title: string
  description: string
  propertyId: string
  unitId: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  assignedTo?: string
  completedDate?: string
  notes?: string
}

export type ContactType = 'tenant' | 'maintenance' | 'admin' | 'other'

export interface Contact {
  id: string
  name: string
  type: ContactType
  phone: string
  email: string
  unit?: string
  specialty?: string
  notes?: string
  tags: string[]
}