import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const MONGODB_URI =
  "mongodb+srv://ymohd0627:Lioness@cluster0.v9mgnvb.mongodb.net/tailor?retryWrites=true&w=majority&appName=Cluster0"
const JWT_SECRET = "sadayusuf12345678"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("tailor")

    // Find user
    const user = await db.collection("users").findOne({ email })
    if (!user) {
      await client.close()
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      await client.close()
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Check if tailor is approved (admin can always login)
    if (user.role === "tailor" && user.status !== "approved") {
      await client.close()
      return NextResponse.json({ message: "Account pending approval" }, { status: 403 })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    await client.close()

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      gender: user.gender,
    }

    return NextResponse.json({ token, user: userResponse })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
