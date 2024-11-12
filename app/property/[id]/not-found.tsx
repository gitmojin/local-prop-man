export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
      <p className="text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
    </div>
  )
}