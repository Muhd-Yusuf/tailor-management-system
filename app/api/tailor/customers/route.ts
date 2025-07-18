import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
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

    // Check if user is tailor
    if (decoded.role !== "tailor") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("tailor")

    const customers = await db
      .collection("customers")
      .find({ tailorId: new ObjectId(decoded.userId) })
      .sort({ createdAt: -1 })
      .toArray()

    await client.close()

    return NextResponse.json(customers)
  } catch (error) {
    console.error("Fetch customers error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Check if user is tailor
    if (decoded.role !== "tailor") {
      return NextResponse.json({ message: "Access denied" }, { status: 403 })
    }

    const customerData = await request.json()

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("tailor")

    const customer = {
      ...customerData,
      tailorId: new ObjectId(decoded.userId),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("customers").insertOne(customer)
    await client.close()

    return NextResponse.json({ id: result.insertedId, message: "Customer added successfully" })
  } catch (error) {
    console.error("Add customer error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
