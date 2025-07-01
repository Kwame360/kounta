"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from "recharts"
import { Download, Users, MapPin, UserCheck } from "lucide-react"

export default function ReportsPage() {
  const [people, setPeople] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [selectedRegion, setSelectedRegion] = useState("all")

  useEffect(() => {
    const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
    setPeople(storedPeople)
  }, [])

  // Filter data based on selected period and region
  const filteredPeople = people.filter((person) => {
    let periodMatch = true
    let regionMatch = true

    // Period filter
    if (selectedPeriod !== "all" && person.createdAt) {
      const createdDate = new Date(person.createdAt)
      const now = new Date()

      switch (selectedPeriod) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          periodMatch = createdDate >= weekAgo
          break
        case "month":
          periodMatch = createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear()
          break
        case "quarter":
          const currentQuarter = Math.floor(now.getMonth() / 3)
          const personQuarter = Math.floor(createdDate.getMonth() / 3)
          periodMatch = personQuarter === currentQuarter && createdDate.getFullYear() === now.getFullYear()
          break
        case "year":
          periodMatch = createdDate.getFullYear() === now.getFullYear()
          break
      }
    }

    // Region filter
    if (selectedRegion !== "all") {
      regionMatch = person.region === selectedRegion
    }

    return periodMatch && regionMatch
  })

  // Calculate statistics
  const totalRegistered = filteredPeople.length
  const maleCount = filteredPeople.filter((p) => p.gender === "male").length
  const femaleCount = filteredPeople.filter((p) => p.gender === "female").length
  const citizensCount = filteredPeople.filter((p) => p.citizenship === "Ghanaian").length
  const nonCitizensCount = filteredPeople.filter((p) => p.citizenship === "Non-Ghanaian").length

  // Age distribution
  const ageGroups = [
    { name: "0-17", count: filteredPeople.filter((p) => p.dateOfBirth && calculateAge(p.dateOfBirth) < 18).length },
    {
      name: "18-35",
      count: filteredPeople.filter(
        (p) => p.dateOfBirth && calculateAge(p.dateOfBirth) >= 18 && calculateAge(p.dateOfBirth) <= 35,
      ).length,
    },
    {
      name: "36-50",
      count: filteredPeople.filter(
        (p) => p.dateOfBirth && calculateAge(p.dateOfBirth) >= 36 && calculateAge(p.dateOfBirth) <= 50,
      ).length,
    },
    { name: "51+", count: filteredPeople.filter((p) => p.dateOfBirth && calculateAge(p.dateOfBirth) > 50).length },
  ]

  // Education distribution
  const educationData = filteredPeople.reduce((acc, person) => {
    if (person.educationLevel) {
      acc[person.educationLevel] = (acc[person.educationLevel] || 0) + 1
    }
    return acc
  }, {})

  const educationChartData = Object.entries(educationData).map(([level, count]) => ({
    name: level,
    value: count,
  }))

  // Regional distribution
  const regionalData = filteredPeople.reduce((acc, person) => {
    if (person.region) {
      acc[person.region] = (acc[person.region] || 0) + 1
    }
    return acc
  }, {})

  const regionalChartData = Object.entries(regionalData).map(([region, count]) => ({
    name: region,
    value: count,
  }))

  // Clan distribution
  const clanData = filteredPeople.reduce((acc, person) => {
    if (person.familyClan) {
      acc[person.familyClan] = (acc[person.familyClan] || 0) + 1
    }
    return acc
  }, {})

  const clanChartData = Object.entries(clanData)
    .map(([clan, count]) => ({
      name: clan,
      value: count,
    }))
    .slice(0, 8) // Top 8 clans

  const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff", "#f3f4f6", "#9ca3af"]

  const generateReport = () => {
    const reportData = {
      period: selectedPeriod,
      region: selectedRegion,
      totalRegistered,
      demographics: {
        male: maleCount,
        female: femaleCount,
        citizens: citizensCount,
        nonCitizens: nonCitizensCount,
      },
      ageGroups,
      education: educationChartData,
      regional: regionalChartData,
      clans: clanChartData,
      generatedAt: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(reportData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `census-report-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const regions = [...new Set(people.map((p) => p.region).filter(Boolean))]

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h2>
            <p className="text-sm text-muted-foreground">Generate detailed reports and view analytics</p>
          </div>
          <Button onClick={generateReport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registered</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegistered}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gender Split</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {maleCount}M / {femaleCount}F
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Citizens</CardTitle>
              <Badge variant="secondary">{((citizensCount / totalRegistered) * 100).toFixed(1)}%</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{citizensCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regions Covered</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{regions.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="demographics" className="space-y-4">
          <TabsList>
            <TabsTrigger value="demographics">Demographics</TabsTrigger>
            <TabsTrigger value="education">Education</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
            <TabsTrigger value="clans">Clans</TabsTrigger>
          </TabsList>

          <TabsContent value="demographics" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Age Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageGroups}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gender & Citizenship</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Male", value: maleCount },
                          { name: "Female", value: femaleCount },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {[
                          { name: "Male", value: maleCount },
                          { name: "Female", value: femaleCount },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="education" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Education Level Distribution</CardTitle>
                <CardDescription>Distribution of education levels among registered individuals</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={educationChartData}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366f1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Regional Distribution</CardTitle>
                <CardDescription>Number of registered individuals by region</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={regionalChartData}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#818cf8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clans" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Clan Distribution</CardTitle>
                <CardDescription>Distribution of the most represented clans</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clanChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {clanChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
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
