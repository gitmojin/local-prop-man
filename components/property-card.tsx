"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Property } from "@/lib/types"

interface PropertyCardProps {
  property: Property
}

export function PropertyCard({ property }: PropertyCardProps) {
  const router = useRouter()

  if (!property) {
    return null
  }

  const handleClick = () => {
    router.push(`/property/${property.id}`)
  }

  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={handleClick}
    >
      <div className="relative h-48 w-full">
        <Image
          src={property.image || "/placeholder-property.jpg"}
          alt={`Property at ${property.address}`}
          fill
          className="object-cover"
          unoptimized={process.env.NODE_ENV === 'development'}
        />
      </div>
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-semibold">{property.address}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {property.units?.length || 0} unit{(property.units?.length || 0) !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  )
}