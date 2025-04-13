"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkTable } from "@/components/link-table"
import { OverviewStats } from "@/components/overview-stats"
import { CreateLinkForm } from "@/components/create-link-form"
import { useToast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [links, setLinks] = useState([])
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
  })
  const { toast } = useToast()

  const fetchLinks = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/links")
      if (!response.ok) {
        throw new Error("Failed to fetch links")
      }
      const data = await response.json()
      setLinks(data.links)

      // Calculate stats
      const totalClicks = data.links.reduce((sum, link) => sum + link.clicks, 0)
      const activeLinks = data.links.filter((link) => !link.isExpired).length

      setStats({
        totalLinks: data.links.length,
        totalClicks,
        activeLinks,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load your links. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  const handleLinkCreated = () => {
    fetchLinks()
    toast({
      title: "Success",
      description: "Your link has been created successfully.",
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="create">Create Link</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <OverviewStats stats={stats} />

          <Card>
            <CardHeader>
              <CardTitle>Your Links</CardTitle>
              <CardDescription>Manage and track all your shortened links</CardDescription>
            </CardHeader>
            <CardContent>
              <LinkTable links={links} isLoading={isLoading} onRefresh={fetchLinks} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Link</CardTitle>
              <CardDescription>Shorten a URL and track its performance</CardDescription>
            </CardHeader>
            <CardContent>
              <CreateLinkForm onSuccess={handleLinkCreated} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
