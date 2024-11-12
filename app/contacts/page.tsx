"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search, User, Phone, Mail, Tag, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { ContactForm } from "@/components/forms/ContactForm"
import { Contact, ContactType } from "@/lib/types"
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
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function ContactsPage() {
  const { toast } = useToast()
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isContactFormOpen, setIsContactFormOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | undefined>()
  const [deletingContact, setDeletingContact] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<ContactType | "all">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchContacts() {
      if (!db) {
        setError("Database connection not available")
        setLoading(false)
        return
      }

      try {
        const querySnapshot = await getDocs(collection(db, "contacts"))
        const contactsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Contact[]
        setContacts(contactsData)
        setError(null)
      } catch (err) {
        console.error("Error fetching contacts:", err)
        setError("Failed to load contacts. Please try again.")
        toast({
          title: "Error",
          description: "Failed to load contacts. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [toast])

  const filteredContacts = contacts.filter(contact => {
    if (!contact) return false
    
    const matchesSearch = 
      (contact.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (contact.phone?.includes(searchQuery) || false)
    
    const matchesTab = activeTab === "all" || contact.type === activeTab
    return matchesSearch && matchesTab
  })

  const handleAddContact = async (contactData: Omit<Contact, "id">) => {
    if (!db) {
      toast({
        title: "Error",
        description: "Database connection not available",
        variant: "destructive",
      })
      return
    }

    try {
      const docRef = await addDoc(collection(db, "contacts"), contactData)
      const newContact: Contact = {
        ...contactData,
        id: docRef.id,
      }
      setContacts(prev => [...prev, newContact])
      toast({
        title: "Success",
        description: "Contact added successfully",
      })
    } catch (error) {
      console.error("Error adding contact:", error)
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      })
    }
  }

  const handleEditContact = async (contactData: Omit<Contact, "id">) => {
    if (!editingContact || !db) return
    
    try {
      const contactRef = doc(db, "contacts", editingContact.id)
      await updateDoc(contactRef, contactData)
      
      setContacts(prev => prev.map(contact =>
        contact.id === editingContact.id
          ? { ...contact, ...contactData }
          : contact
      ))
      setEditingContact(undefined)
      toast({
        title: "Success",
        description: "Contact updated successfully",
      })
    } catch (error) {
      console.error("Error updating contact:", error)
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContact = async (contactId: string) => {
    if (!db) return

    try {
      await deleteDoc(doc(db, "contacts", contactId))
      setContacts(prev => prev.filter(contact => contact.id !== contactId))
      setDeletingContact(null)
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-muted rounded w-1/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              </div>
            </CardContent>
          </Card>
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
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Contacts</h1>
        <Button onClick={() => setIsContactFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContactType | "all")} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tenant">Tenants</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No contacts found
            </div>
          ) : (
            filteredContacts.map(contact => (
              <Card key={contact.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{contact.name}</span>
                        <span className="text-sm text-muted-foreground capitalize">({contact.type})</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{contact.email}</span>
                        </div>
                      </div>
                      {contact.unit && (
                        <p className="text-sm text-muted-foreground">Unit: {contact.unit}</p>
                      )}
                      {contact.specialty && (
                        <p className="text-sm text-muted-foreground">Specialty: {contact.specialty}</p>
                      )}
                      {contact.tags?.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {contact.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setEditingContact(contact)
                          setIsContactFormOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setDeletingContact(contact.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <ContactForm
        open={isContactFormOpen}
        onClose={() => {
          setIsContactFormOpen(false)
          setEditingContact(undefined)
        }}
        onSubmit={editingContact ? handleEditContact : handleAddContact}
        initialData={editingContact}
      />

      <AlertDialog open={!!deletingContact} onOpenChange={() => setDeletingContact(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the contact.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingContact && handleDeleteContact(deletingContact)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}