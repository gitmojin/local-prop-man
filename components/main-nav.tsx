import Link from "next/link"
import { Building2, ClipboardList, Users } from "lucide-react"

export function MainNav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link 
            href="/" 
            className="flex items-center space-x-2 text-xl font-bold"
          >
            <Building2 className="h-6 w-6" />
            <span>Property Manager</span>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link
              href="/tasks"
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <ClipboardList className="h-5 w-5" />
              <span>Tasks</span>
            </Link>
            <Link
              href="/contacts"
              className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Users className="h-5 w-5" />
              <span>Contacts</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}