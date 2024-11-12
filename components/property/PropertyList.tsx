"use client"

import { useEffect, useState } from "react"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { PropertyCard } from "./PropertyCard"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { PropertyForm } from "@/components/forms/PropertyForm"
import { Property } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"

export default function PropertyList() {
  const { toast } = useToast()
  const [properties, setProperties] = useState<Property[]>([])
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async () => {
    try {
      if (!db) {
        throw new Error("Firebase not initialized")
      }

      const querySnapshot = await getDocs(collection(db, "properties"))
      const propertiesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Property[]
      
      setProperties(propertiesData)
      setError(null)
    } catch (err) {
      console.error("Error fetching properties:", err)
      setError("Failed to load properties. Please try again.")
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [toast])

  const handleAddProperty = async (propertyData: Omit<Property, "id" | "units">) => {
    try {
      if (!db) {
        throw new Error("Firebase not initialized")
      }

      // Create new property with empty units array
      const newPropertyData = {
        ...propertyData,
        units: []
      }

      // Add to Firestore
      const docRef = await addDoc(collection(db, "properties"), newPropertyData)
      
      // Update local state
      const newProperty: Property = {
        ...newPropertyData,
        id: docRef.id
      }
      
      setProperties(prev => [...prev, newProperty])
      setIsPropertyFormOpen(false)
      
      toast({
        title: "Success",
        description: "Property added successfully",
      })
    } catch (error) {
      console.error("Error adding property:", error)
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <div key={index} className="animate-pulse">
            <div className="h-48 bg-muted rounded-t-lg" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">{error}</p>
        <Button 
          variant="outline" 
          onClick={() => fetchProperties()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => setIsPropertyFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Property
        </Button>
      </div>
      
      {properties.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No properties found. Add your first property to get started.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      <PropertyForm
        open={isPropertyFormOpen}
        onClose={() => setIsPropertyFormOpen(false)}
        onSubmit={handleAddProperty}
      />
    </div>
  )
}