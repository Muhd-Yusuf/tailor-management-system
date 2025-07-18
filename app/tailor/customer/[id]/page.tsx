"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Phone, MapPin, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"

interface Customer {
  _id: string
  name: string
  phone: string
  address?: string
  orderDate: string
  expectedDate: string
  paymentStatus: "not_paid" | "paid" | "advance"
  amount: number
  advanceAmount?: number
  measurements: any
  createdAt: string
}

export default function CustomerDetailsPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role === "tailor" && user.status === "approved") {
      fetchCustomer()
    }
  }, [user, params.id])

  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tailor/customers/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomer(data)
      } else {
        router.push("/tailor/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error)
      router.push("/tailor/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const renderMeasurements = () => {
    if (!customer?.measurements) return null

    if (user?.gender === "female") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(customer.measurements).map(([key, value]) => {
            if (key === "customNotes" || !value) return null
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
            return (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{label}:</span>
                <span className="text-sm">{value}"</span>
              </div>
            )
          })}
        </div>
      )
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(customer.measurements).map(([key, value]) => {
            if (key === "customNotes" || !value) return null
            const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
            return (
              <div key={key} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm font-medium">{label}:</span>
                <span className="text-sm">{value}"</span>
              </div>
            )
          })}
        </div>
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h2>
          <Link href="/tailor/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tailor/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Customer Details</h1>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Customer
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Customer Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>{customer.name}</span>
                  <Badge
                    variant={
                      customer.paymentStatus === "paid"
                        ? "default"
                        : customer.paymentStatus === "advance"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {customer.paymentStatus === "not_paid"
                      ? "Not Paid"
                      : customer.paymentStatus === "paid"
                        ? "Paid"
                        : "Advance"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <span>{customer.phone}</span>
                </div>
                {customer.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <span className="text-sm">{customer.address}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div className="text-sm">
                    <div>Order: {new Date(customer.orderDate).toLocaleDateString()}</div>
                    <div>Expected: {new Date(customer.expectedDate).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div className="text-sm">
                    <div>Total: ₦{customer.amount.toLocaleString()}</div>
                    {customer.paymentStatus === "advance" && customer.advanceAmount && (
                      <div>Advance: ₦{customer.advanceAmount.toLocaleString()}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Measurements */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Measurements ({user?.gender === "female" ? "Female" : "Male"} Tailoring)</CardTitle>
                <CardDescription>Customer measurements in inches</CardDescription>
              </CardHeader>
              <CardContent>
                {renderMeasurements()}
                {customer.measurements?.customNotes && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Additional Notes:</h4>
                    <div className="p-3 bg-gray-50 rounded text-sm">{customer.measurements.customNotes}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
