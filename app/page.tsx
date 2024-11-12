import { Suspense } from "react";
import PropertyList from "@/components/property/PropertyList";
import { PropertyListSkeleton } from "@/components/property/PropertyListSkeleton";

export default function HomePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Properties</h1>
      <Suspense fallback={<PropertyListSkeleton />}>
        <PropertyList />
      </Suspense>
    </div>
  );
}