import { NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Property } from '@/lib/types'

export async function GET() {
  if (!db) {
    return NextResponse.json({ error: 'Database not initialized' }, { status: 500 })
  }

  try {
    const propertiesCol = collection(db, 'properties')
    const snapshot = await getDocs(propertiesCol)
    const properties = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Property[]

    return NextResponse.json(properties)
  } catch (error) {
    console.error('Error fetching properties:', error)
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    )
  }
}