"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Download, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClicksChart } from "@/components/clicks-chart"
import { DevicesChart } from "@/components/devices-chart"
import { LocationsTable } from "@/components/locations-table"
import { QRCodeDisplay } from "@/components/qr-code-display"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"

export default function LinkAnalyticsPage({ params }: { params: { id: string } }) {
  const [link, setLink] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("7d")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const fetchLinkData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/links/${params.id}?timeframe=${timeframe}`)
        if (!response.ok) {
          throw new Error("Failed to fetch link data")
        }
        const data = await response.json()
        setLink(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load link data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLinkData()
  }, [params.id, timeframe])

  const handleExportData = () => {
    // Implementation for exporting data as CSV
    if (!link) return

    const csvContent = [["Date", "Clicks"], ...link.clicksByDay.map((item) => [item.date, item.clicks])]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `link-analytics-${params.id}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <h1 className="text-3xl font-bold">Link Analytics</h1>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </div>
      ) : link ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                {link.shortUrl}
                <Button variant="ghost" size="icon" asChild>
                  <a href={link.shortUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="sr-only">Open link</span>
                  </a>
                </Button>
              </CardTitle>
              <CardDescription className="flex flex-col gap-1">
                <span className="text-sm text-muted-foreground">Original URL: {link.originalUrl}</span>
                <span className="text-sm text-muted-foreground">
                  Created: {new Date(link.createdAt).toLocaleDateString()}
                </span>
                {link.expiresAt && (
                  <span className="text-sm text-muted-foreground">
                    Expires: {new Date(link.expiresAt).toLocaleDateString()}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <select
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="rounded-md border border-input bg-background px-3 py-1 text-sm"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Clicks Over Time</CardTitle>
                <CardDescription>Total clicks: {link.totalClicks}</CardDescription>
              </CardHeader>
              <CardContent>
                <ClicksChart data={link.clicksByDay} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Devices</CardTitle>
                <CardDescription>Breakdown by device type</CardDescription>
              </CardHeader>
              <CardContent>
                <DevicesChart data={link.deviceStats} />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="locations">
            <TabsList>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            </TabsList>
            <TabsContent value="locations">
              <Card>
                <CardHeader>
                  <CardTitle>Visitor Locations</CardTitle>
                  <CardDescription>Geographic distribution of your link visitors</CardDescription>
                </CardHeader>
                <CardContent>
                  <LocationsTable data={link.locationStats} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="qrcode">
              <Card>
                <CardHeader>
                  <CardTitle>QR Code</CardTitle>
                  <CardDescription>Scan this QR code to access your shortened link</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <QRCodeDisplay url={link.shortUrl} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <Card>
          <CardContent className="flex h-40 items-center justify-center">
            <p className="text-muted-foreground">Link not found or you don't have access to it.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
