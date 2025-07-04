"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MainLayout } from "@/components/layout/main-layout"
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts"
import { peopleService } from "@/lib/database"

export default function DashboardPage() {
  const router = useRouter()
  const [people, setPeople] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated")
    if (authStatus !== "true") {
      router.push("/login")
    } else {
      loadPeople()
    }
  }, [router])

  const loadPeople = async () => {
    try {
      setIsLoading(true)
      const data = await peopleService.getAll()
      setPeople(data || [])
    } catch (error) {
      console.error('Error loading people:', error)
      // Fallback to localStorage
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      setPeople(storedPeople)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate statistics
  const totalAudience = people.length
  const familiesCount = new Set(people.map((p) => p.family_clan).filter(Boolean)).size
  const hometownsCount = new Set(people.map((p) => p.hometown).filter(Boolean)).size
  const newThisMonth = people.filter((p) => {
    if (!p.created_at) return false
    const createdAt = new Date(p.created_at)
    const now = new Date()
    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear()
  }).length

  // Prepare data for charts
  const citizenshipData = [
    { name: "Citizens", value: people.filter((p) => p.citizenship === "Ghanaian").length || 0 },
    { name: "Non-Citizens", value: people.filter((p) => p.citizenship !== "Ghanaian" && p.citizenship).length || 0 },
  ].filter((item) => item.value > 0)

  // Process family data and ensure it has values
  const familyDataRaw = people.reduce((acc, p) => {
    if (p.family_clan) {
      acc[p.family_clan] = (acc[p.family_clan] || 0) + 1
    }
    return acc
  }, {})

  const familyData = Object.entries(familyDataRaw)
    .map(([name, value]) => ({ name, value }))
    .filter((item) => item.name && item.value > 0)
    .slice(0, 5) // Limit to top 5 for better visualization

  const ageRangeData = [
    { name: "0-17", value: people.filter((p) => p.date_of_birth && calculateAge(p.date_of_birth) < 18).length },
    {
      name: "18-24",
      value: people.filter(
        (p) => p.date_of_birth && calculateAge(p.date_of_birth) >= 18 && calculateAge(p.date_of_birth) < 25,
      ).length,
    },
    {
      name: "25-34",
      value: people.filter(
        (p) => p.date_of_birth && calculateAge(p.date_of_birth) >= 25 && calculateAge(p.date_of_birth) < 35,
      ).length,
    },
    {
      name: "35-44",
      value: people.filter(
        (p) => p.date_of_birth && calculateAge(p.date_of_birth) >= 35 && calculateAge(p.date_of_birth) < 45,
      ).length,
    },
    {
      name: "45-54",
      value: people.filter(
        (p) => p.date_of_birth && calculateAge(p.date_of_birth) >= 45 && calculateAge(p.date_of_birth) < 55,
      ).length,
    },
    { name: "55+", value: people.filter((p) => p.date_of_birth && calculateAge(p.date_of_birth) >= 55).length },
  ].filter((item) => item.value > 0)

  const genderData = [
    { name: "Male", value: people.filter((p) => p.gender === "male").length },
    { name: "Female", value: people.filter((p) => p.gender === "female").length },
    { name: "Other", value: people.filter((p) => p.gender === "other").length },
  ].filter((item) => item.value > 0)

  const COLORS = ["#000000", "#404040", "#808080", "#a0a0a0", "#c0c0c0", "#e0e0e0"]

  // Show actual data or empty state
  const hasData = people.length > 0

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAudience}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Families/Clans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{familiesCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hometowns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hometownsCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      {hasData ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Family/Clan Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={familyData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#000000" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Age Range Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ageRangeData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#404040" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Citizenship Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={citizenshipData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {citizenshipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gender Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="mt-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-[400px]">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                <p className="text-muted-foreground mb-4">Start by adding people to see dashboard analytics</p>
                <button 
                  onClick={() => router.push('/audience')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add People
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </MainLayout>
  )
}

function calculateAge(birthDate) {
  if (!birthDate) return 0

  const today = new Date()
  const birthDateObj = new Date(birthDate)
  let age = today.getFullYear() - birthDateObj.getFullYear()
  const monthDiff = today.getMonth() - birthDateObj.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--
  }
  return age
}