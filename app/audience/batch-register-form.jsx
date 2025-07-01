"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Papa from 'papaparse'

export function BatchRegisterForm({ onSuccess }) {
  const [file, setFile] = useState(null)

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!file) {
      alert("Please select a CSV file")
      return
    }

    Papa.parse(file, {
      complete: function(results) {
        console.log("Papa Parse results:", results); // Debug log
        onSuccess(results.data)
      },
      header: true,
      skipEmptyLines: true,
      transformHeader: function(header) {
        // Transform headers to match our expected format
        const headerMap = {
          'Name': 'name',
          'Family/Clan': 'familyClan',
          'Hometown': 'hometown',
          'Citizenship': 'citizenship',
          'Photo URL': 'photoUrl'
        };
        return headerMap[header] || header;
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="csvFile">Upload CSV File</Label>
        <Input id="csvFile" type="file" accept=".csv" onChange={handleFileChange} />
        <p className="text-sm text-muted-foreground mt-2">
          CSV should include columns: Name, Family/Clan, Hometown, Citizenship
        </p>
      </div>
      <Button type="submit">
        Register Batch
      </Button>
    </form>
  )
}
