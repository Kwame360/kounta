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
import { peopleService } from "@/lib/database"

const clanOptions = ["Aduana", "Agona", "Asakyiri", "Asene", "Asona", "Bretuo", "Ekuona", "Oyoko", "Others"]

export default function AudiencePage() {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddingPerson, setIsAddingPerson] = useState(false)
  const [isBatchRegistering, setIsBatchRegistering] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterClan, setFilterClan] = useState("all")
  const [filterCitizenship, setFilterCitizenship] = useState("all")
  const [filterHometown, setFilterHometown] = useState("all")
  const [isEditingPerson, setIsEditingPerson] = useState(false)
  const [editingPerson, setEditingPerson] = useState(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState({ isOpen: false, personId: null })

  // Load people from database
  useEffect(() => {
    loadPeople()
  }, [])

  const loadPeople = async () => {
    try {
      setLoading(true)
      const data = await peopleService.getAll()
      setPeople(data || [])
    } catch (error) {
      console.error('Error loading people:', error)
      // Fallback to localStorage
      const storedPeople = JSON.parse(localStorage.getItem("people") || "[]")
      setPeople(storedPeople)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPerson = async (newPersonData) => {
    try {
      const personToCreate = {
        first_name: newPersonData.firstName,
        last_name: newPersonData.lastName,
        middle_name: newPersonData.middleName || null,
        gender: newPersonData.gender || null,
        date_of_birth: newPersonData.dateOfBirth || null,
        place_of_birth: newPersonData.placeOfBirth || null,
        citizenship: newPersonData.citizenship || null,
        hometown: newPersonData.hometown || null,
        region: newPersonData.region || null,
        district: newPersonData.district || null,
        electoral_area: newPersonData.electoralArea || null,
        marital_status: newPersonData.maritalStatus || null,
        number_of_children: newPersonData.numberOfChildren || 0,
        residential_address: newPersonData.residentialAddress || null,
        gps_address: newPersonData.gpsAddress || null,
        home_type: newPersonData.homeType || null,
        landlord_name: newPersonData.landlordName || null,
        landlord_contact: newPersonData.landlordContact || null,
        family_clan: newPersonData.familyClan || null,
        clan_head: newPersonData.clanHead || null,
        contact_number: newPersonData.contactNumber || null,
        father_name: newPersonData.fatherName || null,
        mother_name: newPersonData.motherName || null,
        id_type: newPersonData.idType || null,
        id_number: newPersonData.idNumber || null,
        occupation: newPersonData.occupation || null,
        place_of_work: newPersonData.placeOfWork || null,
        education_level: newPersonData.educationLevel || null,
        school_name: newPersonData.schoolName || null,
        photo_url: newPersonData.photoUrl || null,
      }

      const createdPerson = await peopleService.create(personToCreate)
      setPeople(prev => [createdPerson, ...prev])

      await addNotification({
        type: "create",
        message: `Added new profile for ${createdPerson.name}`,
        details: `New individual registered with ID: ${createdPerson.id}`,
      })

      setIsAddingPerson(false)
    } catch (error) {
      console.error('Error adding person:', error)
      alert('Failed to add person. Please try again.')
    }
  }

  const handleBatchRegister = async (csvData) => {
    try {
      const peopleToCreate = csvData.map((row) => {
        const values = Object.values(row)
        return {
          first_name: (row.firstName || row.name?.split(" ")[0] || values[0] || "Unknown").trim(),
          last_name: (row.lastName || row.name?.split(" ").slice(1).join(" ") || "").trim() || "Unknown",
          family_clan: row.familyClan || row["Family/Clan"] || values[1] || null,
          hometown: row.hometown || row.Hometown || values[2] || null,
          citizenship: row.citizenship || row.Citizenship || values[3] || null,
          photo_url: row.photoUrl || row.PhotoUrl || values[4] || null,
        }
      })

      const createdPeople = await peopleService.createBatch(peopleToCreate)
      setPeople(prev => [...createdPeople, ...prev])

      await addNotification({
        type: "create",
        message: `Batch registered ${createdPeople.length} people`,
        details: `Added ${createdPeople.length} people from CSV import`,
      })

      setIsBatchRegistering(false)
      alert(`Successfully added ${createdPeople.length} people`)
    } catch (error) {
      console.error('Error batch registering:', error)
      alert('Failed to batch register people. Please try again.')
    }
  }

  const handleEditPerson = async (updatedPersonData) => {
    try {
      const personToUpdate = {
        first_name: updatedPersonData.firstName,
        last_name: updatedPersonData.lastName,
        middle_name: updatedPersonData.middleName || null,
        gender: updatedPersonData.gender || null,
        date_of_birth: updatedPersonData.dateOfBirth || null,
        place_of_birth: updatedPersonData.placeOfBirth || null,
        citizenship: updatedPersonData.citizenship || null,
        hometown: updatedPersonData.hometown || null,
        region: updatedPersonData.region || null,
        district: updatedPersonData.district || null,
        electoral_area: updatedPersonData.electoralArea || null,
        marital_status: updatedPersonData.maritalStatus || null,
        number_of_children: updatedPersonData.numberOfChildren || 0,
        residential_address: updatedPersonData.residentialAddress || null,
        gps_address: updatedPersonData.gpsAddress || null,
        home_type: updatedPersonData.homeType || null,
        landlord_name: updatedPersonData.landlordName || null,
        landlord_contact: updatedPersonData.landlordContact || null,
        family_clan: updatedPersonData.familyClan || null,
        clan_head: updatedPersonData.clanHead || null,
        contact_number: updatedPersonData.contactNumber || null,
        father_name: updatedPersonData.fatherName || null,
        mother_name: updatedPersonData.motherName || null,
        id_type: updatedPersonData.idType || null,
        id_number: updatedPersonData.idNumber || null,
        occupation: updatedPersonData.occupation || null,
        place_of_work: updatedPersonData.placeOfWork || null,
        education_level: updatedPersonData.educationLevel || null,
        school_name: updatedPersonData.schoolName || null,
        photo_url: updatedPersonData.photoUrl || null,
      }

      const updatedPerson = await peopleService.update(updatedPersonData.id, personToUpdate)
      setPeople(prev => prev.map(person => person.id === updatedPerson.id ? updatedPerson : person))

      await addNotification({
        type: "update",
        message: `Updated profile for ${updatedPerson.name}`,
        details: `Profile information was modified`,
      })

      setIsEditingPerson(false)
      setEditingPerson(null)
    } catch (error) {
      console.error('Error updating person:', error)
      alert('Failed to update person. Please try again.')
    }
  }

  const handleDeletePerson = async () => {
    if (deleteConfirmation.personId) {
      try {
        const personToDelete = people.find((person) => person.id === deleteConfirmation.personId)
        
        await peopleService.delete(deleteConfirmation.personId)
        setPeople(prev => prev.filter((person) => person.id !== deleteConfirmation.personId))

        if (personToDelete) {
          await addNotification({
            type: "delete",
            message: `Deleted profile for ${personToDelete.name}`,
            details: `Profile was permanently removed from the system`,
          })
        }

        setDeleteConfirmation({ isOpen: false, personId: null })
      } catch (error) {
        console.error('Error deleting person:', error)
        alert('Failed to delete person. Please try again.')
      }
    }
  }

  const filteredPeople = people.filter(
    (person) =>
      person.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (filterClan === "all" || person.family_clan === filterClan) &&
      (filterCitizenship === "all" || person.citizenship === filterCitizenship) &&
      (filterHometown === "all" || person.hometown === filterHometown),
  )

  const hometowns = [...new Set(people.map(p => p.hometown).filter(Boolean))]

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading people...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

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
            {hometowns.map((hometown) => (
              <SelectItem key={hometown} value={hometown}>
                {hometown}
              </SelectItem>
            ))}
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
                      <AvatarImage src={person.photo_url} alt={person.name} />
                      <AvatarFallback>{person.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>{person.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.family_clan}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.hometown}</TableCell>
                  <TableCell className="hidden md:table-cell">{person.citizenship}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPerson({
                            id: person.id,
                            firstName: person.first_name,
                            lastName: person.last_name,
                            middleName: person.middle_name || "",
                            gender: person.gender || "",
                            dateOfBirth: person.date_of_birth || "",
                            placeOfBirth: person.place_of_birth || "",
                            citizenship: person.citizenship || "",
                            hometown: person.hometown || "",
                            region: person.region || "",
                            district: person.district || "",
                            electoralArea: person.electoral_area || "",
                            maritalStatus: person.marital_status || "",
                            numberOfChildren: person.number_of_children || 0,
                            residentialAddress: person.residential_address || "",
                            gpsAddress: person.gps_address || "",
                            homeType: person.home_type || "",
                            landlordName: person.landlord_name || "",
                            landlordContact: person.landlord_contact || "",
                            familyClan: person.family_clan || "",
                            clanHead: person.clan_head || "",
                            contactNumber: person.contact_number || "",
                            fatherName: person.father_name || "",
                            motherName: person.mother_name || "",
                            idType: person.id_type || "",
                            idNumber: person.id_number || "",
                            occupation: person.occupation || "",
                            placeOfWork: person.place_of_work || "",
                            educationLevel: person.education_level || "",
                            schoolName: person.school_name || "",
                            photoUrl: person.photo_url || "",
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
          <AddPersonForm onSuccess={handleAddPerson} />
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