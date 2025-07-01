"use client"
import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer"

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: "1 solid #333",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  photo: {
    width: 150,
    height: 150,
    borderRadius: 75,
    objectFit: "cover",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
    padding: 5,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    borderBottom: "0.5 solid #eee",
    paddingBottom: 5,
  },
  label: {
    width: 150,
    fontWeight: "bold",
    fontSize: 12,
  },
  value: {
    flex: 1,
    fontSize: 12,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
    borderTop: "1 solid #eee",
    paddingTop: 10,
  },
})

// Format field names for display
const formatFieldName = (key) => {
  // Skip these fields in the PDF
  if (["id", "photoUrl", "createdAt"].includes(key)) return null

  // Format camelCase to Title Case with spaces
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
}

// Format field values for display
const formatFieldValue = (key, value) => {
  if (value === undefined || value === null) return "N/A"

  // Format dates
  if (key === "dateOfBirth" && value) {
    try {
      return new Date(value).toLocaleDateString()
    } catch (e) {
      return value
    }
  }

  // Format boolean values
  if (typeof value === "boolean") {
    return value ? "Yes" : "No"
  }

  return value.toString()
}

// Group fields into sections
const groupFields = (person) => {
  const personalInfo = ["firstName", "lastName", "middleName", "gender", "dateOfBirth", "placeOfBirth", "citizenship"]
  const locationInfo = [
    "hometown",
    "region",
    "district",
    "electoralArea",
    "residentialAddress",
    "gpsAddress",
    "homeType",
  ]
  const familyInfo = ["familyClan", "clanHead", "fatherName", "motherName", "maritalStatus", "numberOfChildren"]
  const contactInfo = ["contactNumber", "idType", "idNumber"]
  const workInfo = ["occupation", "placeOfWork", "educationLevel", "schoolName"]

  return {
    personalInfo: Object.entries(person).filter(([key]) => personalInfo.includes(key)),
    locationInfo: Object.entries(person).filter(([key]) => locationInfo.includes(key)),
    familyInfo: Object.entries(person).filter(([key]) => familyInfo.includes(key)),
    contactInfo: Object.entries(person).filter(([key]) => contactInfo.includes(key)),
    workInfo: Object.entries(person).filter(([key]) => workInfo.includes(key)),
    // Include any fields not explicitly categorized
    otherInfo: Object.entries(person).filter(
      ([key]) =>
        !personalInfo.includes(key) &&
        !locationInfo.includes(key) &&
        !familyInfo.includes(key) &&
        !contactInfo.includes(key) &&
        !workInfo.includes(key) &&
        !["id", "photoUrl", "createdAt", "name"].includes(key),
    ),
  }
}

const IndividualPDF = ({ person }) => {
  const groups = groupFields(person)
  const today = new Date().toLocaleDateString()

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{person.name}</Text>
          <Text style={styles.subtitle}>Individual Profile - Generated on {today}</Text>
        </View>

        <View style={styles.photoContainer}>
          {person.photoUrl && <Image style={styles.photo} src={person.photoUrl || "/placeholder.svg"} />}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {groups.personalInfo.map(([key, value]) => {
            const fieldName = formatFieldName(key)
            if (!fieldName) return null

            return (
              <View style={styles.row} key={key}>
                <Text style={styles.label}>{fieldName}:</Text>
                <Text style={styles.value}>{formatFieldValue(key, value)}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          {groups.locationInfo.map(([key, value]) => {
            const fieldName = formatFieldName(key)
            if (!fieldName) return null

            return (
              <View style={styles.row} key={key}>
                <Text style={styles.label}>{fieldName}:</Text>
                <Text style={styles.value}>{formatFieldValue(key, value)}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Family Information</Text>
          {groups.familyInfo.map(([key, value]) => {
            const fieldName = formatFieldName(key)
            if (!fieldName) return null

            return (
              <View style={styles.row} key={key}>
                <Text style={styles.label}>{fieldName}:</Text>
                <Text style={styles.value}>{formatFieldValue(key, value)}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {groups.contactInfo.map(([key, value]) => {
            const fieldName = formatFieldName(key)
            if (!fieldName) return null

            return (
              <View style={styles.row} key={key}>
                <Text style={styles.label}>{fieldName}:</Text>
                <Text style={styles.value}>{formatFieldValue(key, value)}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Work & Education</Text>
          {groups.workInfo.map(([key, value]) => {
            const fieldName = formatFieldName(key)
            if (!fieldName) return null

            return (
              <View style={styles.row} key={key}>
                <Text style={styles.label}>{fieldName}:</Text>
                <Text style={styles.value}>{formatFieldValue(key, value)}</Text>
              </View>
            )
          })}
        </View>

        {groups.otherInfo.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            {groups.otherInfo.map(([key, value]) => {
              const fieldName = formatFieldName(key)
              if (!fieldName) return null

              return (
                <View style={styles.row} key={key}>
                  <Text style={styles.label}>{fieldName}:</Text>
                  <Text style={styles.value}>{formatFieldValue(key, value)}</Text>
                </View>
              )
            })}
          </View>
        )}

        <View style={styles.footer}>
          <Text>Kounta Ghana Census System - Confidential Information</Text>
        </View>
      </Page>
    </Document>
  )
}

export default IndividualPDF
