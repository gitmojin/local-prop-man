"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Building2, Phone, Plus, Edit, Trash2 } from "lucide-react"
import { Property, Unit } from "@/lib/types"
import { UnitForm } from "@/components/forms/UnitForm"
import { PropertyForm } from "@/components/forms/PropertyForm"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import Image from "next/image"

interface PropertyDetailsProps {
  property: Property
}

export default function PropertyDetails({ property }: PropertyDetailsProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [units, setUnits] = useState<Unit[]>([])
  const [isUnitFormOpen, setIsUnitFormOpen] = useState(false)
  const [isPropertyFormOpen, setIsPropertyFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>()
  const [deletingUnit, setDeletingUnit] = useState<string | null>(null)

  useEffect(() => {
    setUnits(property.units || [])
  }, [property.units])

  const handleContactTenant = (tenant: Unit["tenant"]) => {
    toast({
      title: "Contact Information",
      description: `${tenant.name}: ${tenant.phone}`,
    })
  }

  const updatePropertyUnits = async (newUnits: Unit[]) => {
    try {
      const propertyRef = doc(db, "properties", property.id)
      await updateDoc(propertyRef, { units: newUnits })
      setUnits(newUnits)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update units",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleAddUnit = async (unitData: Omit<Unit, "id" | "maintenanceHistory">) => {
    try {
      const newUnit: Unit = {
        ...unitData,
        id: Date.now().toString(),
        maintenanceHistory: [],
      }
      await updatePropertyUnits([...units, newUnit])
      toast({
        title: "Success",
        description: "Unit added successfully",
      })
    } catch (error) {
      // Error is already handled in updatePropertyUnits
    }
  }

  const handleEditUnit = async (unitData: Omit<Unit, "id" | "maintenanceHistory">) => {
    if (!editingUnit) return
    try {
      const updatedUnits = units.map(unit => 
        unit.id === editingUnit.id 
          ? { ...unit, ...unitData, maintenanceHistory: unit.maintenanceHistory }
          : unit
      )
      await updatePropertyUnits(updatedUnits)
      setEditingUnit(undefined)
      toast({
        title: "Success",
        description: "Unit updated successfully",
      })
    } catch (error) {
      // Error is already handled in updatePropertyUnits
    }
  }

  const handleDeleteUnit = async (unitId: string) => {
    try {
      const updatedUnits = units.filter(unit => unit.id !== unitId)
      await updatePropertyUnits(updatedUnits)
      setDeletingUnit(null)
      toast({
        title: "Success",
        description: "Unit deleted successfully",
      })
    } catch (error) {
      // Error is already handled in updatePropertyUnits
    }
  }

  const handleEditProperty = async (propertyData: Omit<Property, "id" | "units">) => {
    try {
      const propertyRef = doc(db, "properties", property.id)
      await updateDoc(propertyRef, propertyData)
      
      // Update local state and refresh the page to show updated data
      toast({
        title: "Success",
        description: "Property updated successfully",
      })
      router.refresh()
    } catch (error) {
      console.error("Error updating property:", error)
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      })
    }
  }

  const renderImage = (src: string) => {
    try {
      return (
        <Image 
          src={src}
          alt="Property"
          fill
          className="object-cover rounded-lg"
          unoptimized={process.env.NODE_ENV === 'development'}
        />
      )
    } catch (error) {
      return (
        <Image 
          src="/placeholder-property.jpg"
          alt="Property"
          fill
          className="object-cover rounded-lg"
          unoptimized={process.env.NODE_ENV === 'development'}
        />
      )
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">{property.address}</h1>
          <Button
            variant="outline"
            onClick={() => setIsPropertyFormOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Property
          </Button>
        </div>
        <div className="relative w-full h-64">
          {renderImage(property.image || "/placeholder-property.jpg")}
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Units</h2>
        <Button onClick={() => setIsUnitFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <div className="grid gap-6">
        {units.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No units found. Add your first unit to get started.
          </div>
        ) : (
          units.map((unit) => (
            <Card key={unit.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  <h2 className="text-xl font-semibold">Unit {unit.number}</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleContactTenant(unit.tenant)}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Tenant
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingUnit(unit)
                      setIsUnitFormOpen(true)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setDeletingUnit(unit.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>

              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium mb-2">Tenant Information</h3>
                  <div className="space-y-1 text-sm">
                    <p>Name: {unit.tenant.name}</p>
                    <p>Phone: {unit.tenant.phone}</p>
                    <p>Email: {unit.tenant.email}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Appliances</h3>
                  <div className="flex gap-2 flex-wrap">
                    {unit.appliances.map((appliance) => (
                      <span
                        key={appliance}
                        className="px-3 py-1 bg-secondary rounded-full text-sm"
                      >
                        {appliance}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Maintenance History</h3>
                  {unit.maintenanceHistory.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No maintenance history</p>
                  ) : (
                    unit.maintenanceHistory.map((record, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg mb-2"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">
                            {new Date(record.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm">{record.description}</p>
                        </div>
                        {record.images?.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative w-24 h-24">
                            {renderImage(image)}
                          </div>
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <UnitForm
        open={isUnitFormOpen}
        onClose={() => {
          setIsUnitFormOpen(false)
          setEditingUnit(undefined)
        }}
        onSubmit={editingUnit ? handleEditUnit : handleAddUnit}
        initialData={editingUnit}
      />

      <PropertyForm
        open={isPropertyFormOpen}
        onClose={() => setIsPropertyFormOpen(false)}
        onSubmit={handleEditProperty}
        initialData={property}
      />

      <AlertDialog open={!!deletingUnit} onOpenChange={() => setDeletingUnit(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the unit
              and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUnit && handleDeleteUnit(deletingUnit)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}