"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
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
}

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)

  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    address: "",
    orderDate: "",
    expectedDate: "",
    amount: "",
    paymentStatus: "not_paid",
    advanceAmount: "",
  })

  const [measurements, setMeasurements] = useState(() => {
    if (user?.gender === "female") {
      return {
        shoulder: "",
        bust: "",
        waist: "",
        underbust: "",
        fullLength: "",
        blouseLength: "",
        sleeveLength: "",
        roundSleeve: "",
        skirtLength: "",
        hips: "",
        shoulderToWaist: "",
        shoulderToHips: "",
        shoulderToKnee: "",
        customNotes: "",
      }
    } else {
      return {
        trouser: "",
        shirt: "",
        neck: "",
        hands: "",
        shirtComfort: "",
        waist: "",
        customNotes: "",
      }
    }
  })

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

        // Populate form data
        setCustomerData({
          name: data.name,
          phone: data.phone,
          address: data.address || "",
          orderDate: data.orderDate.split("T")[0],
          expectedDate: data.expectedDate.split("T")[0],
          amount: data.amount.toString(),
          paymentStatus: data.paymentStatus,
          advanceAmount: data.advanceAmount?.toString() || "",
        })

        // Populate measurements
        if (data.measurements) {
          setMeasurements(data.measurements)
        }
      } else {
        router.push("/tailor/dashboard")
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error)
      router.push("/tailor/dashboard")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tailor/customers/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...customerData,
          amount: Number.parseFloat(customerData.amount),
          advanceAmount: customerData.advanceAmount ? Number.parseFloat(customerData.advanceAmount) : undefined,
          measurements,
        }),
      })

      if (response.ok) {
        toast({
          title: "Customer updated successfully! ✨",
          description: "Customer information and measurements have been saved",
        })
        router.push(`/tailor/customer/${params.id}`)
      } else {
        const error = await response.json()
        toast({
          title: "Update failed 😞",
          description: error.message || "Failed to update customer",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Network error 🌐",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) {
      return
    }

    setDeleteLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tailor/customers/${params.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        toast({
          title: "Customer deleted successfully! 🗑️",
          description: "Customer has been removed from your records",
        })
        router.push("/tailor/dashboard")
      } else {
        const error = await response.json()
        toast({
          title: "Delete failed 😞",
          description: error.message || "Failed to delete customer",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Network error 🌐",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const renderMeasurementFields = () => {
    if (user?.gender === "female") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shoulder" className="text-white/90">
              Shoulder
            </Label>
            <Input
              id="shoulder"
              value={measurements.shoulder}
              onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bust" className="text-white/90">
              Bust
            </Label>
            <Input
              id="bust"
              value={measurements.bust}
              onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist" className="text-white/90">
              Waist
            </Label>
            <Input
              id="waist"
              value={measurements.waist}
              onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="underbust" className="text-white/90">
              Underbust
            </Label>
            <Input
              id="underbust"
              value={measurements.underbust}
              onChange={(e) => setMeasurements({ ...measurements, underbust: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullLength" className="text-white/90">
              Full Length
            </Label>
            <Input
              id="fullLength"
              value={measurements.fullLength}
              onChange={(e) => setMeasurements({ ...measurements, fullLength: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blouseLength" className="text-white/90">
              Blouse Length
            </Label>
            <Input
              id="blouseLength"
              value={measurements.blouseLength}
              onChange={(e) => setMeasurements({ ...measurements, blouseLength: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleeveLength" className="text-white/90">
              Sleeve Length
            </Label>
            <Input
              id="sleeveLength"
              value={measurements.sleeveLength}
              onChange={(e) => setMeasurements({ ...measurements, sleeveLength: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roundSleeve" className="text-white/90">
              Round Sleeve
            </Label>
            <Input
              id="roundSleeve"
              value={measurements.roundSleeve}
              onChange={(e) => setMeasurements({ ...measurements, roundSleeve: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skirtLength" className="text-white/90">
              Skirt Length
            </Label>
            <Input
              id="skirtLength"
              value={measurements.skirtLength}
              onChange={(e) => setMeasurements({ ...measurements, skirtLength: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hips" className="text-white/90">
              Hips
            </Label>
            <Input
              id="hips"
              value={measurements.hips}
              onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoulderToWaist" className="text-white/90">
              Shoulder to Waist
            </Label>
            <Input
              id="shoulderToWaist"
              value={measurements.shoulderToWaist}
              onChange={(e) => setMeasurements({ ...measurements, shoulderToWaist: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoulderToHips" className="text-white/90">
              Shoulder to Hips
            </Label>
            <Input
              id="shoulderToHips"
              value={measurements.shoulderToHips}
              onChange={(e) => setMeasurements({ ...measurements, shoulderToHips: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shoulderToKnee" className="text-white/90">
              Shoulder to Knee
            </Label>
            <Input
              id="shoulderToKnee"
              value={measurements.shoulderToKnee}
              onChange={(e) => setMeasurements({ ...measurements, shoulderToKnee: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
        </div>
      )
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trouser" className="text-white/90">
              Trouser
            </Label>
            <Input
              id="trouser"
              value={measurements.trouser}
              onChange={(e) => setMeasurements({ ...measurements, trouser: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shirt" className="text-white/90">
              Shirt
            </Label>
            <Input
              id="shirt"
              value={measurements.shirt}
              onChange={(e) => setMeasurements({ ...measurements, shirt: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neck" className="text-white/90">
              Neck
            </Label>
            <Input
              id="neck"
              value={measurements.neck}
              onChange={(e) => setMeasurements({ ...measurements, neck: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hands" className="text-white/90">
              Hands
            </Label>
            <Input
              id="hands"
              value={measurements.hands}
              onChange={(e) => setMeasurements({ ...measurements, hands: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shirtComfort" className="text-white/90">
              Shirt Comfort
            </Label>
            <Input
              id="shirtComfort"
              value={measurements.shirtComfort}
              onChange={(e) => setMeasurements({ ...measurements, shirtComfort: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist" className="text-white/90">
              Waist
            </Label>
            <Input
              id="waist"
              value={measurements.waist}
              onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
              placeholder="inches"
              className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
            />
          </div>
        </div>
      )
    }
  }

  if (!customer) {
    return (
      <div className="min-h-screen futuristic-bg flex items-center justify-center">
        <div className="loading-spinner h-32 w-32"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen futuristic-bg">
      <div className="glass-card-dark shadow-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link
            href={`/tailor/customer/${params.id}`}
            className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Customer Details
          </Link>
          <h1 className="text-2xl font-bold text-white gradient-text">Edit Customer</h1>
          <p className="text-white/70 text-sm">Update customer information and measurements</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <Card className="glass-card card-hover">
            <CardHeader>
              <CardTitle className="text-white gradient-text">Customer Information</CardTitle>
              <CardDescription className="text-white/70">Update the customer's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/90">
                    Customer Name *
                  </Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    required
                    className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/90">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    required
                    className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address" className="text-white/90">
                  Address (Optional)
                </Label>
                <Textarea
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  placeholder="Customer's address"
                  className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderDate" className="text-white/90">
                    Order Date
                  </Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={customerData.orderDate}
                    onChange={(e) => setCustomerData({ ...customerData, orderDate: e.target.value })}
                    required
                    className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDate" className="text-white/90">
                    Expected Collection Date *
                  </Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={customerData.expectedDate}
                    onChange={(e) => setCustomerData({ ...customerData, expectedDate: e.target.value })}
                    required
                    className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card className="glass-card card-hover">
            <CardHeader>
              <CardTitle className="text-white gradient-text">
                Measurements ({user?.gender === "female" ? "Female" : "Male"} Tailoring)
              </CardTitle>
              <CardDescription className="text-white/70">Update the customer's measurements in inches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderMeasurementFields()}
              <div className="space-y-2">
                <Label htmlFor="customNotes" className="text-white/90">
                  Additional Notes
                </Label>
                <Textarea
                  id="customNotes"
                  value={measurements.customNotes}
                  onChange={(e) => setMeasurements({ ...measurements, customNotes: e.target.value })}
                  placeholder="Any additional measurements or special instructions"
                  className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="glass-card card-hover">
            <CardHeader>
              <CardTitle className="text-white gradient-text">Payment Information</CardTitle>
              <CardDescription className="text-white/70">Update the payment details for this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-white/90">
                    Total Amount (₦) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={customerData.amount}
                    onChange={(e) => setCustomerData({ ...customerData, amount: e.target.value })}
                    required
                    className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus" className="text-white/90">
                    Payment Status
                  </Label>
                  <Select
                    value={customerData.paymentStatus}
                    onValueChange={(value) => setCustomerData({ ...customerData, paymentStatus: value })}
                  >
                    <SelectTrigger className="glass-card border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-card-dark border-white/20">
                      <SelectItem value="not_paid" className="text-white hover:bg-white/10">
                        Not Paid
                      </SelectItem>
                      <SelectItem value="advance" className="text-white hover:bg-white/10">
                        Advance Payment
                      </SelectItem>
                      <SelectItem value="paid" className="text-white hover:bg-white/10">
                        Fully Paid
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {customerData.paymentStatus === "advance" && (
                <div className="space-y-2">
                  <Label htmlFor="advanceAmount" className="text-white/90">
                    Advance Amount (₦)
                  </Label>
                  <Input
                    id="advanceAmount"
                    type="number"
                    value={customerData.advanceAmount}
                    onChange={(e) => setCustomerData({ ...customerData, advanceAmount: e.target.value })}
                    placeholder="Amount paid in advance"
                    className="glass-card border-white/20 text-white placeholder:text-white/50 search-glow"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
              className="status-overdue"
            >
              {deleteLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="loading-spinner h-4 w-4"></div>
                  <span>Deleting...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Customer</span>
                </div>
              )}
            </Button>

            <div className="flex space-x-4">
              <Link href={`/tailor/customer/${params.id}`}>
                <Button
                  variant="outline"
                  className="glass-card text-white hover:bg-white/20 border-white/20 bg-transparent"
                >
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="glow-button">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner h-4 w-4"></div>
                    <span>Updating...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="h-4 w-4" />
                    <span>Update Customer</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
