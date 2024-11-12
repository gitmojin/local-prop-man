"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Property } from "@/lib/types"
import PropertyDetails from "@/components/property/PropertyDetails"
import { useToast } from "@/components/ui/use-toast"

export default function PropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProperty() {
      try {
        if (!db) {
          throw new Error("Firebase not initialized")
        }

        const docRef = doc(db, "properties", params.id)
        const docSnap = await getDoc(docRef)
        
        if (!docSnap.exists()) {
          router.push("/404")
          return
        }
        
        setProperty({ id: docSnap.id, ...docSnap.data() } as Property)
      } catch (error) {
        console.error("Error fetching property:", error)
        toast({
          title: "Error",
          description: "Failed to load property. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [params.id, router, toast])

  if (loading) {
    return (
      <div className="container mx-auto p-8">
        <div className="animate-pulse">
          <div className="h-8 w-64 bg-muted rounded mb-4" />
          <div className="h-64 w-full bg-muted rounded mb-8" />
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded" />
            <div className="h-32 bg-muted rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!property) {
    return null
  }

  return <PropertyDetails property={property} />
}