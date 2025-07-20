import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const MONGODB_URI = process.env.MONGODB_URI!
const JWT_SECRET = process.env.JWT_SECRET!

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, businessName, businessAddress } = await request.json()

    // Validate required fields
    if (!name || !email || !password || !phone || !businessName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()

    const db = client.db("tailor_management")
    const usersCollection = db.collection("users")

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      await client.close()
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phone,
      businessName,
      businessAddress: businessAddress || "",
      role: "tailor",
      status: "pending", // Admin needs to approve
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerified: false,
      lastLogin: null,
      profileImage: null,
      settings: {
        notifications: {
          email: true,
          sms: false,
          push: true,
        },
        theme: "light",
        language: "en",
      },
    }

    const result = await usersCollection.insertOne(newUser)
    await client.close()

    // Generate JWT token for the new user
    const token = jwt.sign(
      {
        userId: result.insertedId,
        email: email.toLowerCase(),
        role: "tailor",
        status: "pending",
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Create response with success message for toast
    const response = NextResponse.json(
      {
        message: "Account created successfully! Please wait for admin approval.",
        user: {
          id: result.insertedId,
          name,
          email: email.toLowerCase(),
          role: "tailor",
          status: "pending",
        },
        showAccountCreationToast: true,
        toastData: {
          type: "success",
          title: "🎉 Account Created Successfully!",
          description: `Welcome ${name}! Your account has been created with email: ${email}. Please wait for admin approval to access your dashboard.`,
          persistent: true,
        },
      },
      { status: 201 },
    )

    // Set HTTP-only cookie for authentication
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error. Please try again later." }, { status: 500 })
  }
}
