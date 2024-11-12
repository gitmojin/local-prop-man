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
import { Unit } from "@/lib/types"

interface UnitFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (unit: Omit<Unit, "id" | "maintenanceHistory">) => void
  initialData?: Unit
}

export function UnitForm({ open, onClose, onSubmit, initialData }: UnitFormProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    number: initialData?.number || "",
    floor: initialData?.floor || 1,
    tenant: {
      name: initialData?.tenant.name || "",
      phone: initialData?.tenant.phone || "",
      email: initialData?.tenant.email || "",
    },
    appliances: initialData?.appliances.join(", ") || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.number || !formData.tenant.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    onSubmit({
      number: formData.number,
      floor: formData.floor,
      tenant: formData.tenant,
      appliances: formData.appliances.split(",").map(item => item.trim()),
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit" : "Add"} Unit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Unit Number*</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input
                id="floor"
                type="number"
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tenant-name">Tenant Name*</Label>
            <Input
              id="tenant-name"
              value={formData.tenant.name}
              onChange={(e) => setFormData({
                ...formData,
                tenant: { ...formData.tenant, name: e.target.value }
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tenant-phone">Phone</Label>
              <Input
                id="tenant-phone"
                value={formData.tenant.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  tenant: { ...formData.tenant, phone: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenant-email">Email</Label>
              <Input
                id="tenant-email"
                value={formData.tenant.email}
                onChange={(e) => setFormData({
                  ...formData,
                  tenant: { ...formData.tenant, email: e.target.value }
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appliances">Appliances (comma-separated)</Label>
            <Input
              id="appliances"
              value={formData.appliances}
              onChange={(e) => setFormData({ ...formData, appliances: e.target.value })}
              placeholder="Refrigerator, Dishwasher, HVAC"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {initialData ? "Save Changes" : "Add Unit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}