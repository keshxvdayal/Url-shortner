import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import { UAParser } from "ua-parser-js"

export async function GET(request: Request, { params }: { params: Promise<{ shortCode: string }> }) {
  try {
    const resolvedParams = await params
    const { shortCode } = resolvedParams

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Find the link
    const link = await db.collection("links").findOne({ shortCode })

    if (!link) {
      return NextResponse.json({ message: "Link not found" }, { status: 404 })
    }

    // Check if link is expired
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json({ message: "Link has expired" }, { status: 410 })
    }

    // Get request information
    const headersList = headers()
    const userAgent = headersList.get("user-agent") || ""
    const ip = headersList.get("x-forwarded-for") || "Unknown"

    // Parse user agent
    const parser = new UAParser(userAgent)
    const device = parser.getDevice().type || "desktop"
    const browser = parser.getBrowser().name || "Unknown"
    const os = parser.getOS().name || "Unknown"

    // Create analytics entry
    const analyticsEntry = {
      timestamp: new Date(),
      ip,
      device,
      browser,
      os,
      country: "Unknown", // In a real app, you'd use a geolocation service
      city: "Unknown",
    }

    // Update link with analytics data
    await db.collection("links").updateOne(
      { _id: link._id },
      {
        $inc: { clicks: 1 },
        $push: { analytics: analyticsEntry },
      },
    )

    return NextResponse.json({ originalUrl: link.originalUrl })
  } catch (error) {
    console.error("Error redirecting:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
