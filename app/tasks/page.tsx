"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, CheckCircle2, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { TaskForm } from "@/components/forms/TaskForm"
import { Task, Property } from "@/lib/types"
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function TasksPage() {
  const { toast } = useToast()
  const [tasks, setTasks] = useState<Task[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!db) throw new Error("Firebase not initialized")

        // Fetch tasks
        const tasksSnapshot = await getDocs(collection(db, "tasks"))
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[]

        // Fetch properties for reference
        const propertiesSnapshot = await getDocs(collection(db, "properties"))
        const propertiesData = propertiesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Property[]

        setTasks(tasksData)
        setProperties(propertiesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load tasks. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleAddTask = async (taskData: Omit<Task, "id" | "status" | "completedDate">) => {
    try {
      if (!db) throw new Error("Firebase not initialized")

      const newTask = {
        ...taskData,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, "tasks"), newTask)
      setTasks([...tasks, { ...newTask, id: docRef.id }])

      toast({
        title: "Success",
        description: "Task added successfully",
      })
    } catch (error) {
      console.error("Error adding task:", error)
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      if (!db) throw new Error("Firebase not initialized")

      const taskRef = doc(db, "tasks", taskId)
      const updateData = {
        status: "completed",
        completedDate: new Date().toISOString()
      }

      await updateDoc(taskRef, updateData)

      setTasks(tasks.map(task => 
        task.id === taskId
          ? { ...task, ...updateData }
          : task
      ))

      toast({
        title: "Success",
        description: "Task marked as completed",
      })
    } catch (error) {
      console.error("Error completing task:", error)
      toast({
        title: "Error",
        description: "Failed to complete task. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getPropertyAndUnit = (task: Task) => {
    const property = properties.find(p => p.id === task.propertyId)
    const unit = property?.units.find(u => u.id === task.unitId)
    return {
      propertyName: property?.address || "Unknown Property",
      unitNumber: unit?.number || "Unknown Unit",
    }
  }

  const getPriorityIcon = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Maintenance Tasks</h1>
        <Button onClick={() => setIsTaskFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </TabsTrigger>
          <TabsTrigger value="completed" className="space-x-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Completed</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {tasks
            .filter(task => task.status === "pending")
            .map(task => {
              const { propertyName, unitNumber } = getPropertyAndUnit(task)
              return (
                <Card key={task.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getPriorityIcon(task.priority)}
                      {task.title}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Complete
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">{task.description}</p>
                      <div className="flex flex-wrap gap-4">
                        <p><span className="font-medium">Property:</span> {propertyName}</p>
                        <p><span className="font-medium">Unit:</span> {unitNumber}</p>
                        <p><span className="font-medium">Due:</span> {new Date(task.dueDate).toLocaleDateString()}</p>
                        {task.assignedTo && (
                          <p><span className="font-medium">Assigned to:</span> {task.assignedTo}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          {tasks.filter(task => task.status === "pending").length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No pending tasks
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {tasks
            .filter(task => task.status === "completed")
            .map(task => {
              const { propertyName, unitNumber } = getPropertyAndUnit(task)
              return (
                <Card key={task.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <p className="text-muted-foreground">{task.description}</p>
                      <div className="flex flex-wrap gap-4">
                        <p><span className="font-medium">Property:</span> {propertyName}</p>
                        <p><span className="font-medium">Unit:</span> {unitNumber}</p>
                        <p><span className="font-medium">Completed:</span> {task.completedDate && new Date(task.completedDate).toLocaleDateString()}</p>
                        {task.assignedTo && (
                          <p><span className="font-medium">Completed by:</span> {task.assignedTo}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          {tasks.filter(task => task.status === "completed").length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No completed tasks
            </div>
          )}
        </TabsContent>
      </Tabs>

      <TaskForm
        open={isTaskFormOpen}
        onClose={() => setIsTaskFormOpen(false)}
        onSubmit={handleAddTask}
        properties={properties}
      />
    </div>
  )
}