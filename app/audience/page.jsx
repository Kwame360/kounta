"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { AddPersonForm } from "./add-person-form"
import { BatchRegisterForm } from "./batch-register-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { CSVExportButton } from "./csv-export-button"
import { IndividualExportButton } from "./individual-export-button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { addNotification } from "@/utils/notification-service"

const mockData = [
  {
    id: 1,
    name: "Janet Adebayo",
    familyClan: "Aduana",
    hometown: "Koforidua",
    citizenship: "Ghanaian",
    photoUrl: "/placeholder.svg",
  },
  {
    id: 2,
    name: "Kwame Nkrumah",
    familyClan: "Asona",
    hometown: "Nkroful",
    citizenship: "Ghanaian",
    photoUrl: "/placeholder.svg",
  },
  {
    id: 3,
    name: "Yaa Asantewaa",
    familyClan: "Bretuo",
    hometown: "Kumasi",
    citizenship: "Ghanaian",
    photoUrl: "/placeholder.svg",
  },
]

const clanOptions = ["Aduana", "Agona", "Asakyiri", "Asene", "Asona", "Bretuo", "Ekuona", "Oyoko", "Others"]

export default function AudiencePage() {
  const [people, setPeople] = useState(mockData)
  const [isAddingPerson, setIsAddingPerson] = useState(false)
  const [isBatchRegistering, setIsBatchRegistering] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterClan, setFilterClan] = useState("all")
  const [filterCitizenship, setFilterCitizenship] = useState("all")
  const [filterHometown, setFilterHometown] = useState("all")
  const [isEditingPerson, setIsEditingPerson] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, personId: null })

  useEffect(() => {
    localStorage.setItem("people", JSON.stringify(people))
  }, [people])

  const handleBatchRegister = (csvData) => {
    console.log("Raw CSV data:", csvData) // Debug log

    const newPeople = csvData.map((row, index) => {
      // Check if the row has the expected properties
      if (!row.name && !row.familyClan && !row.hometown && !row.citizenship) {
        console.log("Row data format:", Object.keys(row)) // Debug log
        // Try to map based on CSV column order if headers don't match
        const values = Object.values(row)
        return {
          id: Date.now() + index,
          name: values[0] || "Unknown",
          familyClan: values[1] || "Unknown",
          hometown: values[2] || "Unknown",
          citizenship: values[3] || "Unknown",
          photoUrl: values[4] || "/placeholder.svg",
          createdAt: new Date().toISOString(),
        }
      }

      // If headers match, use the standard mapping
      return {
        id: Date.now() + index,
        name: row.name || row.Name || "Unknown",
        familyClan: row.familyClan || row["Family/Clan"] || "Unknown",
        hometown: row.hometown || row.Hometown || "Unknown",
        citizenship: row.citizenship || row.Citizenship || "Unknown",
        photoUrl: row.photoUrl || row.PhotoUrl || "/placeholder.svg",
        createdAt: new Date().toISOString(),
      }
    })

    console.log("Processed people data:", newPeople) // Debug log

    setPeople((currentPeople) => [...currentPeople, ...newPeople])
    setIsBatchRegistering(false)

    // Add notification for batch registration
    addNotification({
      type: "create",
      message: `Batch registered ${newPeople.length} people`,
      details: `Added ${newPeople.length} people from CSV import`,
    })

    alert(`Successfully added ${newPeople.length} people`)
  }

  const handleEditPerson = (updatedPerson) => {
    setPeople((prevPeople) =>
      prevPeople.map((person) =>
        person.id === updatedPerson.id
          ? {
              ...person,
              ...updatedPerson,
              // Ensure the name is properly updated from first/last name
              name: `${updatedPerson.firstName} ${updatedPerson.lastName}`.trim(),
            }
          : person,
      ),
    )

    // Add notification for update
    addNotification({
      type: "update",
      message: `Updated profile for ${updatedPerson.firstName} ${updatedPerson.lastName}`,
      details: `Profile information was modified`,
    })

    setIsEditingPerson(false)
    setEditingPerson(null)
  }

  const handleDeletePerson = () => {
    if (deleteConfirmation.personId) {
      // Find the person before deleting for the notification
      const personToDelete = people.find((person) => person.id === deleteConfirmation.personId)

      setPeople((prevPeople) => prevPeople.filter((person) => person.id !== deleteConfirmation.personId))

      // Add notification for deletion
      if (personToDelete) {
        addNotification({
          type: "delete",
          message: `Deleted profile for ${personToDelete.name}`,
          details: `Profile was permanently removed from the system`,
        })
      }

      setDeleteConfirmation({ isOpen: false, personId: null })
    }
  }

  const filteredPeople = people.filter(
    (person) =>
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterClan === "all" || person.familyClan === filterClan) &&
      (filterCitizenship === "all" || person.citizenship === filterCitizenship) &&
      (filterHometown === "all" || person.hometown === filterHometown),
  )

  return (
    <MainLayout>
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="space-y-1 mb-4 sm:mb-0">
          <h2 className="text-2xl font-semibold tracking-tight">Audience Summary</h2>
          <p className="text-sm text-muted-foreground">Manage and view all registered individuals</p>
        </div>
        <div className="flex gap-2">
          <CSVExportButton data={filteredPeople} />
          <Button onClick={() => setIsAddingPerson(true)}>Add Individual</Button>
          <Button onClick={() => setIsBatchRegistering(true)}>Batch Register</Button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
        <Input
          placeholder="Search individuals..."
          className="w-full sm:w-[200px] mb-2 sm:mb-0"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={filterClan} onValueChange={setFilterClan}>
          <SelectTrigger className="w-full sm:w-[180px] mb-2 sm:mb-0">
            <SelectValue placeholder="Filter by Clan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clans</SelectItem>
            {clanOptions.map((clan) => (
              <SelectItem key={clan} value={clan}>
                {clan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCitizenship} onValueChange={setFilterCitizenship}>
          <SelectTrigger className="w-full sm:w-[180px] mb-2 sm:mb-0">
            <SelectValue placeholder="Filter by Citizenship" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Citizens</SelectItem>
            <SelectItem value="Ghanaian">Ghanaian</SelectItem>
            <SelectItem value="Non-Ghanaian">Non-Ghanaian</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterHometown} onValueChange={setFilterHometown}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filter by Hometown" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Hometowns</SelectItem>
            <SelectItem value="Koforidua">Koforidua</SelectItem>
            <SelectItem value="Nkroful">Nkroful</SelectItem>
            <SelectItem value="Kumasi">Kumasi</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 overflow-hidden rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Family/Clan</TableHead>
                <TableHead className="hidden md:table-cell">Hometown</TableHead>
                <TableHead className="hidden md:table-cell">Citizenship</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={person.photoUrl} alt={person.name} />
                      <AvatarFallback>{person.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{person.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.familyClan}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.hometown}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.citizenship}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          console.log("Editing person:", person) // Debug log
                          setEditingPerson({
                            id: person.id,
                            name: person.name,
                            familyClan: person.familyClan,
                            hometown: person.hometown,
                            citizenship: person.citizenship,
                            photoUrl: person.photoUrl,
                            firstName: person.firstName || person.name.split(" ")[0],
                            lastName: person.lastName || person.name.split(" ").slice(1).join(" "),
                            middleName: person.middleName || "",
                            gender: person.gender || "",
                            dateOfBirth: person.dateOfBirth || "",
                            placeOfBirth: person.placeOfBirth || "",
                            maritalStatus: person.maritalStatus || "",
                            numberOfChildren: person.numberOfChildren || 0,
                            residentialAddress: person.residentialAddress || "",
                            gpsAddress: person.gpsAddress || "",
                            homeType: person.homeType || "",
                            clanHead: person.clanHead || "",
                            contactNumber: person.contactNumber || "",
                            fatherName: person.fatherName || "",
                            motherName: person.motherName || "",
                            idType: person.idType || "",
                            idNumber: person.idNumber || "",
                            occupation: person.occupation || "",
                            placeOfWork: person.placeOfWork || "",
                            educationLevel: person.educationLevel || "",
                            schoolName: person.schoolName || "",
                          })
                          setIsEditingPerson(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => setDeleteConfirmation({ isOpen: true, personId: person.id })}
                      >
                        Delete
                      </Button>
                      <IndividualExportButton person={person} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={isAddingPerson} onOpenChange={setIsAddingPerson}>
        <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Individual</DialogTitle>
            <DialogDescription>Fill in the details to add a new person to the audience.</DialogDescription>
          </DialogHeader>
          <AddPersonForm
            onSuccess={(newPerson) => {
              const personWithId = {
                ...newPerson,
                id: Date.now(),
                createdAt: new Date().toISOString(),
              }
              setPeople([...people, personWithId])

              // Add notification for new person
              addNotification({
                type: "create",
                message: `Added new profile for ${personWithId.name}`,
                details: `New individual registered with ID: ${personWithId.id}`,
              })

              setIsAddingPerson(false)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isEditingPerson}
        onOpenChange={(open) => {
          setIsEditingPerson(open)
          if (!open) setEditingPerson(null)
        }}
      >
        <DialogContent className="max-h-[90vh] w-full max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Individual</DialogTitle>
            <DialogDescription>Update the details of the selected person.</DialogDescription>
          </DialogHeader>
          {editingPerson && <AddPersonForm onSuccess={handleEditPerson} initialData={editingPerson} />}
        </DialogContent>
      </Dialog>

      <Dialog open={isBatchRegistering} onOpenChange={setIsBatchRegistering}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Batch Register</DialogTitle>
            <DialogDescription>Upload a CSV file to register multiple people at once.</DialogDescription>
          </DialogHeader>
          <BatchRegisterForm onSuccess={handleBatchRegister} />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteConfirmation.isOpen}
        onOpenChange={(isOpen) => setDeleteConfirmation((prev) => ({ ...prev, isOpen }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this person?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the person's data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmation({ isOpen: false, personId: null })}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePerson}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  )
}
