"use client"

import { Button } from "@/components/ui/button"
import { Printer } from "lucide-react"
import { addNotification } from "@/utils/notification-service"

export function IndividualExportButton({ person }) {
  const handlePrint = () => {
    // Create a new window
    const printWindow = window.open("", "_blank")

    // Write the HTML directly to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${person.name} - Profile</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 10px;
            border-bottom: 1px solid #ddd;
          }
          .photo-container {
            text-align: center;
            margin-bottom: 30px;
          }
          .profile-photo {
            width: 150px;
            height: 150px;
            border-radius: 50%;
            object-fit: cover;
            border: 4px solid #eee;
          }
          .section {
            margin-bottom: 30px;
          }
          .section-title {
            background-color: #f5f5f5;
            padding: 8px;
            margin-bottom: 15px;
            font-size: 18px;
            font-weight: bold;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .info-item {
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
          }
          .label {
            font-weight: bold;
          }
          .footer {
            text-align: center;
            margin-top: 50px;
            padding-top: 10px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777;
          }
          @media print {
            body {
              font-size: 12pt;
            }
            .no-print {
              display: none;
            }
            @page {
              size: A4;
              margin: 2cm;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 20px;">
          <button onclick="window.print();" style="padding: 8px 16px; cursor: pointer;">Print</button>
        </div>
        
        <div class="header">
          <h1>${person.name}</h1>
          <p>Individual Profile - Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div class="photo-container">
          <img src="${person.photoUrl || "/placeholder.svg"}" alt="${person.name}" class="profile-photo">
        </div>
        
        <div class="section">
          <div class="section-title">Personal Information</div>
          <div class="info-grid">
            ${person.firstName ? `<div class="info-item"><span class="label">First Name:</span> ${person.firstName}</div>` : ""}
            ${person.lastName ? `<div class="info-item"><span class="label">Last Name:</span> ${person.lastName}</div>` : ""}
            ${person.middleName ? `<div class="info-item"><span class="label">Middle Name:</span> ${person.middleName}</div>` : ""}
            ${person.gender ? `<div class="info-item"><span class="label">Gender:</span> ${person.gender}</div>` : ""}
            ${person.dateOfBirth ? `<div class="info-item"><span class="label">Date of Birth:</span> ${new Date(person.dateOfBirth).toLocaleDateString()}</div>` : ""}
            ${person.placeOfBirth ? `<div class="info-item"><span class="label">Place of Birth:</span> ${person.placeOfBirth}</div>` : ""}
            ${person.citizenship ? `<div class="info-item"><span class="label">Citizenship:</span> ${person.citizenship}</div>` : ""}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Location Information</div>
          <div class="info-grid">
            ${person.hometown ? `<div class="info-item"><span class="label">Hometown:</span> ${person.hometown}</div>` : ""}
            ${person.region ? `<div class="info-item"><span class="label">Region:</span> ${person.region}</div>` : ""}
            ${person.district ? `<div class="info-item"><span class="label">District:</span> ${person.district}</div>` : ""}
            ${person.electoralArea ? `<div class="info-item"><span class="label">Electoral Area:</span> ${person.electoralArea}</div>` : ""}
            ${person.residentialAddress ? `<div class="info-item"><span class="label">Residential Address:</span> ${person.residentialAddress}</div>` : ""}
            ${person.gpsAddress ? `<div class="info-item"><span class="label">GPS Address:</span> ${person.gpsAddress}</div>` : ""}
            ${person.homeType ? `<div class="info-item"><span class="label">Home Type:</span> ${person.homeType}</div>` : ""}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Family Information</div>
          <div class="info-grid">
            ${person.familyClan ? `<div class="info-item"><span class="label">Family/Clan:</span> ${person.familyClan}</div>` : ""}
            ${person.clanHead ? `<div class="info-item"><span class="label">Clan Head:</span> ${person.clanHead}</div>` : ""}
            ${person.fatherName ? `<div class="info-item"><span class="label">Father's Name:</span> ${person.fatherName}</div>` : ""}
            ${person.motherName ? `<div class="info-item"><span class="label">Mother's Name:</span> ${person.motherName}</div>` : ""}
            ${person.maritalStatus ? `<div class="info-item"><span class="label">Marital Status:</span> ${person.maritalStatus}</div>` : ""}
            ${person.numberOfChildren !== undefined ? `<div class="info-item"><span class="label">Number of Children:</span> ${person.numberOfChildren}</div>` : ""}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Contact Information</div>
          <div class="info-grid">
            ${person.contactNumber ? `<div class="info-item"><span class="label">Contact Number:</span> ${person.contactNumber}</div>` : ""}
            ${person.idType ? `<div class="info-item"><span class="label">ID Type:</span> ${person.idType}</div>` : ""}
            ${person.idNumber ? `<div class="info-item"><span class="label">ID Number:</span> ${person.idNumber}</div>` : ""}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Work & Education</div>
          <div class="info-grid">
            ${person.occupation ? `<div class="info-item"><span class="label">Occupation:</span> ${person.occupation}</div>` : ""}
            ${person.placeOfWork ? `<div class="info-item"><span class="label">Place of Work:</span> ${person.placeOfWork}</div>` : ""}
            ${person.educationLevel ? `<div class="info-item"><span class="label">Education Level:</span> ${person.educationLevel}</div>` : ""}
            ${person.schoolName ? `<div class="info-item"><span class="label">School Name:</span> ${person.schoolName}</div>` : ""}
          </div>
        </div>
        
        <div class="footer">
          <p>Kounta Ghana Census System - Confidential Information</p>
        </div>
        
        <script>
          // Auto-print after a short delay
          setTimeout(() => {
            window.print();
          }, 1000);
        </script>
      </body>
      </html>
    `)

    // Finish writing and focus the new window
    printWindow.document.close()
    printWindow.focus()

    // Add notification
    addNotification({
      type: "print",
      message: `Printed profile for ${person.name}`,
      details: `Profile printed on ${new Date().toLocaleString()}`,
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={handlePrint}>
      <Printer className="h-4 w-4 mr-1" />
      Print Profile
    </Button>
  )
}
