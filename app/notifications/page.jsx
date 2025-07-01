"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // Load notifications from localStorage
    const storedNotifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    setNotifications(storedNotifications)
  }, [])

  const clearAllNotifications = () => {
    localStorage.setItem("notifications", "[]")
    setNotifications([])
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "create":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "update":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "print":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case "create":
        return "Created"
      case "update":
        return "Updated"
      case "delete":
        return "Deleted"
      case "print":
        return "Printed"
      default:
        return "Action"
    }
  }

  const filteredNotifications =
    activeTab === "all" ? notifications : notifications.filter((notification) => notification.type === activeTab)

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Notifications</h2>
            <p className="text-sm text-muted-foreground">View all system activity and notifications</p>
          </div>
          <Button variant="outline" size="sm" onClick={clearAllNotifications} disabled={notifications.length === 0}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="create">Created</TabsTrigger>
            <TabsTrigger value="update">Updated</TabsTrigger>
            <TabsTrigger value="delete">Deleted</TabsTrigger>
            <TabsTrigger value="print">Printed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>
                  {filteredNotifications.length} {activeTab === "all" ? "total" : activeTab} notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredNotifications.length > 0 ? (
                  <ScrollArea className="h-[60vh]">
                    <div className="space-y-4">
                      {filteredNotifications.map((notification, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={getTypeColor(notification.type)}>
                                {getTypeLabel(notification.type)}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="font-medium">{notification.message}</p>
                            {notification.details && (
                              <p className="text-sm text-muted-foreground mt-1">{notification.details}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No notifications found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
