import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI = process.env.MONGODB_URI || ""

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password, gender } = await request.json()

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("tailor")

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email })
    if (existingUser) {
      await client.close()
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = {
      name,
      email,
      phone,
      password: hashedPassword,
      role: "tailor",
      status: "pending",
      gender,
      createdAt: new Date(),
    }

    await db.collection("users").insertOne(user)
    await client.close()

    return NextResponse.json(
      {
        message: "Account created successfully! Your account is pending approval. You will be notified once approved.",
        success: true,
        accountCreated: true,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
