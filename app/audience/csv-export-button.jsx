"use client"

import { Button } from "@/components/ui/button"

export function CSVExportButton({ data }) {
  const exportToCSV = () => {
    const headers = [
      "Name",
      "Family/Clan",
      "Hometown",
      "Citizenship",
      "Gender",
      "Date of Birth",
      "Place of Birth",
      "Region",
      "District",
      "Electoral Area",
      "Marital Status",
      "Number of Children",
      "Residential Address",
      "GPS Address",
      "Home Type",
      "Clan Head",
      "Contact Number",
      "Father's Name",
      "Mother's Name",
      "ID Type",
      "ID Number",
      "Occupation",
      "Place of Work",
      "Education Level",
      "School Name",
    ]
    const csvContent = [
      headers.join(","),
      ...data.map((person) =>
        [
          person.name,
          person.familyClan,
          person.hometown,
          person.citizenship,
          person.gender,
          person.dateOfBirth,
          person.placeOfBirth,
          person.region,
          person.district,
          person.electoralArea,
          person.maritalStatus,
          person.numberOfChildren,
          person.residentialAddress,
          person.gpsAddress,
          person.homeType,
          person.clanHead,
          person.contactNumber,
          person.fatherName,
          person.motherName,
          person.idType,
          person.idNumber,
          person.occupation,
          person.placeOfWork,
          person.educationLevel,
          person.schoolName,
        ]
          .map((field) => `"${field || ""}"`)
          .join(","),
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute("href", url)
      link.setAttribute("download", "audience_summary.csv")
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return <Button onClick={exportToCSV}>Export all as CSV</Button>
}
