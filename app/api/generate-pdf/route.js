import { NextResponse } from "next/server"
import PDFDocument from "pdfkit"

export async function POST(request) {
  try {
    const { person } = await request.json()

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50 })

    // Set up the document
    const buffers = []
    doc.on("data", buffers.push.bind(buffers))

    // Add content to the PDF
    generatePDFContent(doc, person)

    // Finalize the PDF
    doc.end()

    // Combine the PDF buffers
    const pdfData = Buffer.concat(buffers)

    // Return the PDF as a response
    return new NextResponse(pdfData, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${person.name.replace(/\s+/g, "_")}_profile.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 })
  }
}

function generatePDFContent(doc, person) {
  // Add title
  doc.fontSize(25).text("Individual Profile", { align: "center" })
  doc.moveDown()

  // Add person name
  doc.fontSize(20).text(person.name, { align: "center" })
  doc.moveDown()

  // Add generation date
  doc.fontSize(12).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: "center" })
  doc.moveDown(2)

  // Group fields into sections
  const sections = {
    "Personal Information": [
      "firstName",
      "lastName",
      "middleName",
      "gender",
      "dateOfBirth",
      "placeOfBirth",
      "citizenship",
    ],
    "Location Information": [
      "hometown",
      "region",
      "district",
      "electoralArea",
      "residentialAddress",
      "gpsAddress",
      "homeType",
    ],
    "Family Information": ["familyClan", "clanHead", "fatherName", "motherName", "maritalStatus", "numberOfChildren"],
    "Contact Information": ["contactNumber", "idType", "idNumber"],
    "Work & Education": ["occupation", "placeOfWork", "educationLevel", "schoolName"],
  }

  // Add each section
  Object.entries(sections).forEach(([sectionTitle, fields]) => {
    doc.fontSize(16).text(sectionTitle, { underline: true })
    doc.moveDown()

    fields.forEach((field) => {
      if (person[field] !== undefined && person[field] !== null) {
        const label = field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())

        let value = person[field]

        // Format dates
        if (field === "dateOfBirth" && value) {
          try {
            value = new Date(value).toLocaleDateString()
          } catch (e) {
            // Keep original value if date parsing fails
          }
        }

        doc.fontSize(12).text(`${label}: ${value}`)
        doc.moveDown(0.5)
      }
    })

    doc.moveDown()
  })

  // Add footer
  doc.fontSize(10).text("Kounta Ghana Census System - Confidential Information", { align: "center" })
}
