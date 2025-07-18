import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const MONGODB_URI =
  "mongodb+srv://ymohd0627:Lioness@cluster0.v9mgnvb.mongodb.net/tailor?retryWrites=true&w=majority&appName=Cluster0"

async function createAdminUser() {
  const client = new MongoClient(MONGODB_URI)

  try {
    console.log("Connecting to MongoDB...")
    await client.connect()
    console.log("Connected successfully!")

    const db = client.db("tailor")

    // Check if admin already exists
    const existingAdmin = await db.collection("users").findOne({
      email: "admin@tailormanagement.com",
    })

    if (existingAdmin) {
      console.log("Admin user already exists!")
      console.log("Email: admin@tailormanagement.com")
      console.log("You can use this account to login.")
      return
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash("admin123", 12)

    // Create admin user
    const adminUser = {
      name: "Super Admin",
      email: "admin@tailormanagement.com",
      phone: "+1234567890",
      password: hashedPassword,
      role: "admin",
      status: "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("users").insertOne(adminUser)

    console.log("✅ Admin user created successfully!")
    console.log("📧 Email: admin@tailormanagement.com")
    console.log("🔑 Password: admin123")
    console.log("🆔 User ID:", result.insertedId)
    console.log("")
    console.log("You can now login to the admin dashboard with these credentials.")
  } catch (error) {
    console.error("❌ Error creating admin user:", error)
  } finally {
    await client.close()
    console.log("Database connection closed.")
  }
}

// Run the function
createAdminUser()
