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

  const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff"]

  // If there's no data, show placeholder data for demonstration
  const hasData = people.length > 0

  const placeholderFamilyData = [
    { name: "Aduana", value: 12 },
    { name: "Asona", value: 8 },
    { name: "Bretuo", value: 6 },
    { name: "Oyoko", value: 4 },
    { name: "Agona", value: 3 },
  ]

  const placeholderAgeData = [
    { name: "0-17", value: 5 },
    { name: "18-24", value: 15 },
    { name: "25-34", value: 25 },
    { name: "35-44", value: 18 },
    { name: "45-54", value: 10 },
    { name: "55+", value: 7 },
  ]

  const placeholderCitizenshipData = [
    { name: "Citizens", value: 65 },
    { name: "Non-Citizens", value: 15 },
  ]

  const placeholderGenderData = [
    { name: "Male", value: 45 },
    { name: "Female", value: 35 },
    { name: "Other", value: 5 },
  ]

  // Use actual data if available, otherwise use placeholder data
  const displayFamilyData = hasData && familyData.length > 0 ? familyData : placeholderFamilyData
  const displayAgeData = hasData && ageRangeData.length > 0 ? ageRangeData : placeholderAgeData
  const displayCitizenshipData = hasData && citizenshipData.length > 0 ? citizenshipData : placeholderCitizenshipData
  const displayGenderData = hasData && genderData.length > 0 ? genderData : placeholderGenderData

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
            <div className="text-2xl font-bold">{hasData ? totalAudience : "80"}</div>
            {!hasData && <div className="text-xs text-muted-foreground">(Demo data)</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Families/Clans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hasData ? familiesCount : "5"}</div>
            {!hasData && <div className="text-xs text-muted-foreground">(Demo data)</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hometowns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hasData ? hometownsCount : "12"}</div>
            {!hasData && <div className="text-xs text-muted-foreground">(Demo data)</div>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hasData ? newThisMonth : "15"}</div>
            {!hasData && <div className="text-xs text-muted-foreground">(Demo data)</div>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Family/Clan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayFamilyData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
            {!hasData && <div className="text-xs text-center text-muted-foreground mt-2">(Demo data)</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Range Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayAgeData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
            {!hasData && <div className="text-xs text-center text-muted-foreground mt-2">(Demo data)</div>}
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
                  data={displayCitizenshipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {displayCitizenshipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {!hasData && <div className="text-xs text-center text-muted-foreground mt-2">(Demo data)</div>}
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
                  data={displayGenderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {displayGenderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            {!hasData && <div className="text-xs text-center text-muted-foreground mt-2">(Demo data)</div>}
          </CardContent>
        </Card>
      </div>
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