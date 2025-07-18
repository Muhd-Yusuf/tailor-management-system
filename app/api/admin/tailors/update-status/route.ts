import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const MONGODB_URI =
  "mongodb+srv://ymohd0627:Lioness@cluster0.v9mgnvb.mongodb.net/tailor?retryWrites=true&w=majority&appName=Cluster0"
const JWT_SECRET = "sadayusuf12345678"

export async function POST(request: NextRequest) {
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

    const { tailorId, status } = await request.json()

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("tailor")

    await db.collection("users").updateOne({ _id: new ObjectId(tailorId) }, { $set: { status, updatedAt: new Date() } })

    await client.close()

    return NextResponse.json({ message: "Status updated successfully" })
  } catch (error) {
    console.error("Update status error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
