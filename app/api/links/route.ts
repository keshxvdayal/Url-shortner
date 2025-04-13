import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { verify } from "jsonwebtoken"
import { nanoid } from "nanoid"
import { connectToDatabase } from "@/lib/mongodb"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

// Get all links for the authenticated user
export async function GET() {
  try {
    // Verify authentication
    const token = cookies().get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }
    const userId = decoded.id

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Get all links for the user
    const links = await db.collection("links").find({ userId }).sort({ createdAt: -1 }).toArray()

    // Check if links are expired
    const now = new Date()
    const linksWithExpiration = links.map((link) => ({
      ...link,
      isExpired: link.expiresAt ? new Date(link.expiresAt) < now : false,
    }))

    return NextResponse.json({ links: linksWithExpiration })
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// Create a new shortened link
export async function POST(request: Request) {
  try {
    // Verify authentication
    const token = cookies().get("auth_token")?.value
    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    const decoded = verify(token, JWT_SECRET) as { id: string }
    const userId = decoded.id

    // Parse request body
    const { originalUrl, customAlias, expiresAt } = await request.json()

    // Validate URL
    try {
      new URL(originalUrl)
    } catch (error) {
      return NextResponse.json({ message: "Invalid URL format" }, { status: 400 })
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Generate short code or use custom alias
    const shortCode = customAlias || nanoid(6)

    // Check if custom alias is already taken
    if (customAlias) {
      const existingLink = await db.collection("links").findOne({ shortCode })

      if (existingLink) {
        return NextResponse.json({ message: "Custom alias already in use" }, { status: 400 })
      }
    }

    // Create the link document
    const link = {
      userId,
      originalUrl,
      shortCode,
      shortUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/${shortCode}`,
      createdAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      clicks: 0,
      analytics: [],
    }

    // Insert into database
    await db.collection("links").insertOne(link)

    return NextResponse.json({ link })
  } catch (error) {
    console.error("Error creating link:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
