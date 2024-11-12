import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PropertyListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((index) => (
        <Card key={index} className="overflow-hidden">
          <div className="h-48 w-full bg-muted animate-pulse" />
          <CardHeader className="space-y-1">
            <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}