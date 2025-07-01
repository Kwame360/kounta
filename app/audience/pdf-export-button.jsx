"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import dynamic from 'next/dynamic'

const PDFDownloadLink = dynamic(
  () => import('@react-pdf/renderer').then(mod => mod.PDFDownloadLink),
  { ssr: false }
)

const AudiencePDF = dynamic(() => import('./audience-pdf'), { ssr: false })

export function PDFExportButton({ data }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <Button disabled>Export as PDF</Button>
  }

  return (
    <PDFDownloadLink
      document={<AudiencePDF data={data} />}
      fileName="audience_summary.pdf"
    >
      {({ blob, url, loading, error }) => (
        <Button disabled={loading}>
          {loading ? 'Generating PDF...' : 'Export as PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
