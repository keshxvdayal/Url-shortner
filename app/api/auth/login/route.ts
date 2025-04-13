import { NextResponse } from "next/server"
import { sign } from "jsonwebtoken"
import { cookies } from "next/headers"

// In a real app, this would be stored in a database
const HARDCODED_USER = {
  id: "user_123",
  email: "intern@dacoid.com",
  password: "Test123",
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Check if the credentials match the hardcoded user
    if (email !== HARDCODED_USER.email || password !== HARDCODED_USER.password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Create a JWT token
    const token = sign(
      {
        id: HARDCODED_USER.id,
        email: HARDCODED_USER.email,
      },
      JWT_SECRET,
      { expiresIn: "1d" },
    )

    // Set the token as a cookie
    cookies().set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
      sameSite: "strict",
    })

    return NextResponse.json({ message: "Login successful" })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
