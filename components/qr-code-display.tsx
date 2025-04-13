"use client"

import { useState, useEffect } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import QRCode from "qrcode"

interface QRCodeDisplayProps {
  url: string
}

export function QRCodeDisplay({ url }: QRCodeDisplayProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setIsLoading(true)
        const dataUrl = await QRCode.toDataURL(url, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        })
        setQrCodeDataUrl(dataUrl)
      } catch (error) {
        console.error("Error generating QR code:", error)
      } finally {
        setIsLoading(false)
      }
    }

    generateQRCode()
  }, [url])

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement("a")
    link.href = qrCodeDataUrl
    link.download = `qrcode-${url.split("/").pop()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-[300px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {qrCodeDataUrl ? (
        <>
          <div className="rounded-lg border p-4">
            <img
              src={qrCodeDataUrl || "/placeholder.svg"}
              alt="QR Code"
              width={250}
              height={250}
              className="h-[250px] w-[250px]"
            />
          </div>
          <Button variant="outline" onClick={downloadQRCode}>
            <Download className="mr-2 h-4 w-4" />
            Download QR Code
          </Button>
        </>
      ) : (
        <p className="text-muted-foreground">Failed to generate QR code</p>
      )}
    </div>
  )
}
