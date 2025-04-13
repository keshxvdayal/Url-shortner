import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { ObjectId } from "mongodb"
import { connectToDatabase } from "@/lib/mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Get detailed analytics for a specific link
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verify authentication
    const token = cookies().get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }
    const userId = decoded.id

    // Get timeframe from query params
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "7d"

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Find the link
    const link = await db.collection("links").findOne({ _id: new ObjectId(params.id), userId })

    if (!link) {
      return NextResponse.json({ message: "Link not found" }, { status: 404 })
    }

    // Calculate date range based on timeframe
    const now = new Date()
    let startDate = new Date()

    switch (timeframe) {
      case "7d":
        startDate.setDate(now.getDate() - 7)
        break
      case "30d":
        startDate.setDate(now.getDate() - 30)
        break
      case "90d":
        startDate.setDate(now.getDate() - 90)
        break
      case "all":
        startDate = new Date(0) // Beginning of time
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Filter analytics by date range
    const filteredAnalytics = link.analytics.filter((item: any) => new Date(item.timestamp) >= startDate)

    // Calculate clicks by day
    const clicksByDay = calculateClicksByDay(filteredAnalytics, startDate, now)

    // Calculate device stats
    const deviceStats = calculateDeviceStats(filteredAnalytics)

    // Calculate location stats
    const locationStats = calculateLocationStats(filteredAnalytics)

    return NextResponse.json({
      ...link,
      totalClicks: filteredAnalytics.length,
      clicksByDay,
      deviceStats,
      locationStats,
      isExpired: link.expiresAt ? new Date(link.expiresAt) < now : false,
    })
  } catch (error) {
    console.error("Error fetching link analytics:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Helper functions for analytics calculations
function calculateClicksByDay(analytics: any[], startDate: Date, endDate: Date) {
  const result = []
  const dateMap = new Map()

  // Initialize all dates in the range with 0 clicks
  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateString = currentDate.toISOString().split("T")[0]
    dateMap.set(dateString, 0)
    currentDate.setDate(currentDate.getDate() + 1)
  }

  // Count clicks for each date
  analytics.forEach((item) => {
    const dateString = new Date(item.timestamp).toISOString().split("T")[0]
    dateMap.set(dateString, (dateMap.get(dateString) || 0) + 1)
  })

  // Convert map to array
  dateMap.forEach((clicks, date) => {
    result.push({ date, clicks })
  })

  // Sort by date
  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return result
}

function calculateDeviceStats(analytics: any[]) {
  const deviceCounts = analytics.reduce((acc, item) => {
    const device = item.device || "Unknown"
    acc[device] = (acc[device] || 0) + 1
    return acc
  }, {})

  return Object.entries(deviceCounts).map(([name, value]) => ({
    name,
    value,
  }))
}

function calculateLocationStats(analytics: any[]) {
  const locationCounts = analytics.reduce((acc, item) => {
    const country = item.country || "Unknown"
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {})

  return Object.entries(locationCounts)
    .map(([country, clicks]) => ({ country, clicks }))
    .sort((a, b) => (b.clicks as number) - (a.clicks as number))
}
