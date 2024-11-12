"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Property } from "@/lib/types"

interface PropertyFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (property: Omit<Property, "id" | "units">) => void
  initialData?: Property
}

export function PropertyForm({ open, onClose, onSubmit, initialData }: PropertyFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    address: initialData?.address || "",
    image: initialData?.image || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.address) {
      toast({
        title: "Error",
        description: "Please enter a property address",
        variant: "destructive",
      })
      return
    }

    // Set a default image if none provided
    const propertyData = {
      ...formData,
      image: formData.image || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914",
    }

    onSubmit(propertyData)
    setFormData({ address: "", image: "" }) // Reset form
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Property</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Address*</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main St, City"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image">Image URL</Label>
            <Input
              id="image"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty to use a default image
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Add Property"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}