import { type NextRequest, NextResponse } from "next/server"
import { MongoClient, ObjectId } from "mongodb"
import jwt from "jsonwebtoken"

const MONGODB_URI =
  "mongodb+srv://ymohd0627:Lioness@cluster0.v9mgnvb.mongodb.net/tailor?retryWrites=true&w=majority&appName=Cluster0"
const JWT_SECRET = "sadayusuf12345678"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const customer = await db.collection("customers").findOne({
      _id: new ObjectId(params.id),
      tailorId: new ObjectId(decoded.userId),
    })

    await client.close()

    if (!customer) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json(customer)
  } catch (error) {
    console.error("Fetch customer error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const updateData = await request.json()

    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    const db = client.db("tailor")

    const result = await db.collection("customers").updateOne(
      {
        _id: new ObjectId(params.id),
        tailorId: new ObjectId(decoded.userId),
      },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
    )

    await client.close()

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Customer updated successfully" })
  } catch (error) {
    console.error("Update customer error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const result = await db.collection("customers").deleteOne({
      _id: new ObjectId(params.id),
      tailorId: new ObjectId(decoded.userId),
    })

    await client.close()

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: "Customer not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Customer deleted successfully" })
  } catch (error) {
    console.error("Delete customer error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
