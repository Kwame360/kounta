"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Save, Download, Trash2, Shield, Bell, User, Database } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { addNotification } from "@/utils/notification-service"

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    notifications: true,
    autoBackup: false,
    dataRetention: "1year",
    exportFormat: "csv",
    theme: "light",
    language: "english",
  })

  const [adminProfile, setAdminProfile] = useState({
    username: "kwame",
    email: "admin@kounta.gh",
    fullName: "Kwame Administrator",
    role: "System Administrator",
  })

  const [systemStats, setSystemStats] = useState({
    totalRecords: 0,
    storageUsed: "0 MB",
    lastBackup: "Never",
    systemVersion: "1.0.0",
  })

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("systemSettings")
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Calculate system stats
    const people = JSON.parse(localStorage.getItem("people") || "[]")
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    const storageSize = (JSON.stringify(people).length + JSON.stringify(notifications).length) / 1024 // KB

    setSystemStats({
      totalRecords: people.length,
      storageUsed: storageSize > 1024 ? `${(storageSize / 1024).toFixed(2)} MB` : `${storageSize.toFixed(2)} KB`,
      lastBackup: localStorage.getItem("lastBackup") || "Never",
      systemVersion: "1.0.0",
    })
  }, [])

  const saveSettings = () => {
    localStorage.setItem("systemSettings", JSON.stringify(settings))
    addNotification({
      type: "update",
      message: "System settings updated",
      details: "Settings have been saved successfully",
    })
    alert("Settings saved successfully!")
  }

  const exportData = () => {
    const people = JSON.parse(localStorage.getItem("people") || "[]")
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")

    const exportData = {
      people,
      notifications,
      settings,
      exportedAt: new Date().toISOString(),
      version: systemStats.systemVersion,
    }

    const dataStr = JSON.stringify(exportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `kounta-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()

    // Update last backup time
    localStorage.setItem("lastBackup", new Date().toISOString())

    addNotification({
      type: "create",
      message: "Data backup created",
      details: "Full system backup exported successfully",
    })
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)

        if (importedData.people) {
          localStorage.setItem("people", JSON.stringify(importedData.people))
        }
        if (importedData.notifications) {
          localStorage.setItem("notifications", JSON.stringify(importedData.notifications))
        }
        if (importedData.settings) {
          localStorage.setItem("systemSettings", JSON.stringify(importedData.settings))
          setSettings(importedData.settings)
        }

        addNotification({
          type: "create",
          message: "Data imported successfully",
          details: `Imported ${importedData.people?.length || 0} records`,
        })

        alert("Data imported successfully! Please refresh the page to see changes.")
      } catch (error) {
        alert("Error importing data. Please check the file format.")
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    localStorage.removeItem("people")
    localStorage.removeItem("notifications")
    localStorage.removeItem("systemSettings")
    localStorage.removeItem("lastBackup")

    addNotification({
      type: "delete",
      message: "All data cleared",
      details: "System has been reset to default state",
    })

    alert("All data has been cleared! Please refresh the page.")
  }

  const changePassword = () => {
    // In a real application, this would involve proper authentication
    const newPassword = prompt("Enter new password:")
    if (newPassword && newPassword.length >= 6) {
      addNotification({
        type: "update",
        message: "Password changed",
        details: "Administrator password updated successfully",
      })
      alert("Password changed successfully!")
    } else if (newPassword) {
      alert("Password must be at least 6 characters long.")
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
          <p className="text-sm text-muted-foreground">Manage system settings and preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="data">Data Management</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for system activities</p>
                  </div>
                  <Switch
                    checked={settings.notifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">Automatically backup data daily</p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>Customize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Data Retention Period</Label>
                    <Select
                      value={settings.dataRetention}
                      onValueChange={(value) => setSettings({ ...settings, dataRetention: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6months">6 Months</SelectItem>
                        <SelectItem value="1year">1 Year</SelectItem>
                        <SelectItem value="2years">2 Years</SelectItem>
                        <SelectItem value="5years">5 Years</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Default Export Format</Label>
                    <Select
                      value={settings.exportFormat}
                      onValueChange={(value) => setSettings({ ...settings, exportFormat: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={saveSettings} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Administrator Profile
                </CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Username</Label>
                    <Input value={adminProfile.username} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      value={adminProfile.email}
                      onChange={(e) => setAdminProfile({ ...adminProfile, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={adminProfile.fullName}
                      onChange={(e) => setAdminProfile({ ...adminProfile, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{adminProfile.role}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security
                </CardTitle>
                <CardDescription>Manage security settings</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={changePassword} variant="outline">
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Management
                </CardTitle>
                <CardDescription>Import, export, and manage your data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Export Data</Label>
                    <p className="text-sm text-muted-foreground">Download a complete backup of all data</p>
                    <Button onClick={exportData} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label>Import Data</Label>
                    <p className="text-sm text-muted-foreground">Upload a backup file to restore data</p>
                    <div className="flex items-center gap-2">
                      <Input type="file" accept=".json" onChange={importData} className="flex-1" />
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-red-600">Danger Zone</Label>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete all data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete all registered individuals,
                          notifications, and system settings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllData} className="bg-red-600 hover:bg-red-700">
                          Yes, delete everything
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>View system statistics and information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Total Records</Label>
                    <p className="text-2xl font-bold">{systemStats.totalRecords}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Storage Used</Label>
                    <p className="text-2xl font-bold">{systemStats.storageUsed}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Last Backup</Label>
                    <p className="text-sm">
                      {systemStats.lastBackup === "Never"
                        ? "Never"
                        : new Date(systemStats.lastBackup).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>System Version</Label>
                    <Badge variant="outline">{systemStats.systemVersion}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Current system status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Database Connection</span>
                    <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Storage Status</span>
                    <Badge className="bg-green-100 text-green-800">Normal</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>System Performance</span>
                    <Badge className="bg-green-100 text-green-800">Optimal</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  )
}
