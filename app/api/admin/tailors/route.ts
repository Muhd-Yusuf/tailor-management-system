import { type NextRequest, NextResponse } from "next/server"
import { MongoClient } from "mongodb"
import jwt from "jsonwebtoken"

const MONGODB_URI =
  "mongodb+srv://ymohd0627:Lioness@cluster0.v9mgnvb.mongodb.net/tailor?retryWrites=true&w=majority&appName=Cluster0"
const JWT_SECRET = "sadayusuf12345678"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user is admin
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("tailor")

    const tailors = await db.collection("users").find({ role: "tailor" }).sort({ createdAt: -1 }).toArray()

    await client.close()

    return NextResponse.json(tailors)
  } catch (error) {
    console.error("Fetch tailors error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
