"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function AddCustomerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [customerData, setCustomerData] = useState({
    name: "",
    phone: "",
    address: "",
    orderDate: new Date().toISOString().split("T")[0],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tailor/customers", {
        method: "POST",
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
          title: "Customer added successfully",
          description: "Customer and measurements have been saved",
        })
        router.push("/tailor/dashboard")
      } else {
        const error = await response.json()
        toast({
          title: "Error",
          description: error.message || "Failed to add customer",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderMeasurementFields = () => {
    if (user?.gender === "female") {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="shoulder">Shoulder</Label>
            <Input
              id="shoulder"
              value={measurements.shoulder}
              onChange={(e) => setMeasurements({ ...measurements, shoulder: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bust">Bust</Label>
            <Input
              id="bust"
              value={measurements.bust}
              onChange={(e) => setMeasurements({ ...measurements, bust: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist">Waist</Label>
            <Input
              id="waist"
              value={measurements.waist}
              onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="underbust">Underbust</Label>
            <Input
              id="underbust"
              value={measurements.underbust}
              onChange={(e) => setMeasurements({ ...measurements, underbust: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullLength">Full Length</Label>
            <Input
              id="fullLength"
              value={measurements.fullLength}
              onChange={(e) => setMeasurements({ ...measurements, fullLength: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="blouseLength">Blouse Length</Label>
            <Input
              id="blouseLength"
              value={measurements.blouseLength}
              onChange={(e) => setMeasurements({ ...measurements, blouseLength: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sleeveLength">Sleeve Length</Label>
            <Input
              id="sleeveLength"
              value={measurements.sleeveLength}
              onChange={(e) => setMeasurements({ ...measurements, sleeveLength: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roundSleeve">Round Sleeve</Label>
            <Input
              id="roundSleeve"
              value={measurements.roundSleeve}
              onChange={(e) => setMeasurements({ ...measurements, roundSleeve: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skirtLength">Skirt Length</Label>
            <Input
              id="skirtLength"
              value={measurements.skirtLength}
              onChange={(e) => setMeasurements({ ...measurements, skirtLength: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hips">Hips</Label>
            <Input
              id="hips"
              value={measurements.hips}
              onChange={(e) => setMeasurements({ ...measurements, hips: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoulderToWaist">Shoulder to Waist</Label>
            <Input
              id="shoulderToWaist"
              value={measurements.shoulderToWaist}
              onChange={(e) => setMeasurements({ ...measurements, shoulderToWaist: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shoulderToHips">Shoulder to Hips</Label>
            <Input
              id="shoulderToHips"
              value={measurements.shoulderToHips}
              onChange={(e) => setMeasurements({ ...measurements, shoulderToHips: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="shoulderToKnee">Shoulder to Knee</Label>
            <Input
              id="shoulderToKnee"
              value={measurements.shoulderToKnee}
              onChange={(e) => setMeasurements({ ...measurements, shoulderToKnee: e.target.value })}
              placeholder="inches"
            />
          </div>
        </div>
      )
    } else {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="trouser">Trouser</Label>
            <Input
              id="trouser"
              value={measurements.trouser}
              onChange={(e) => setMeasurements({ ...measurements, trouser: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shirt">Shirt</Label>
            <Input
              id="shirt"
              value={measurements.shirt}
              onChange={(e) => setMeasurements({ ...measurements, shirt: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="neck">Neck</Label>
            <Input
              id="neck"
              value={measurements.neck}
              onChange={(e) => setMeasurements({ ...measurements, neck: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hands">Hands</Label>
            <Input
              id="hands"
              value={measurements.hands}
              onChange={(e) => setMeasurements({ ...measurements, hands: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shirtComfort">Shirt Comfort</Label>
            <Input
              id="shirtComfort"
              value={measurements.shirtComfort}
              onChange={(e) => setMeasurements({ ...measurements, shirtComfort: e.target.value })}
              placeholder="inches"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="waist">Waist</Label>
            <Input
              id="waist"
              value={measurements.waist}
              onChange={(e) => setMeasurements({ ...measurements, waist: e.target.value })}
              placeholder="inches"
            />
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/tailor/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold">Add New Customer</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter the customer's basic details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Customer Name *</Label>
                  <Input
                    id="name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address (Optional)</Label>
                <Textarea
                  id="address"
                  value={customerData.address}
                  onChange={(e) => setCustomerData({ ...customerData, address: e.target.value })}
                  placeholder="Customer's address"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderDate">Order Date</Label>
                  <Input
                    id="orderDate"
                    type="date"
                    value={customerData.orderDate}
                    onChange={(e) => setCustomerData({ ...customerData, orderDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedDate">Expected Collection Date *</Label>
                  <Input
                    id="expectedDate"
                    type="date"
                    value={customerData.expectedDate}
                    onChange={(e) => setCustomerData({ ...customerData, expectedDate: e.target.value })}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle>Measurements ({user?.gender === "female" ? "Female" : "Male"} Tailoring)</CardTitle>
              <CardDescription>Enter the customer's measurements in inches</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {renderMeasurementFields()}
              <div className="space-y-2">
                <Label htmlFor="customNotes">Additional Notes</Label>
                <Textarea
                  id="customNotes"
                  value={measurements.customNotes}
                  onChange={(e) => setMeasurements({ ...measurements, customNotes: e.target.value })}
                  placeholder="Any additional measurements or special instructions"
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>Set the payment details for this order</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Total Amount (₦) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={customerData.amount}
                    onChange={(e) => setCustomerData({ ...customerData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    value={customerData.paymentStatus}
                    onValueChange={(value) => setCustomerData({ ...customerData, paymentStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not_paid">Not Paid</SelectItem>
                      <SelectItem value="advance">Advance Payment</SelectItem>
                      <SelectItem value="paid">Fully Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {customerData.paymentStatus === "advance" && (
                <div className="space-y-2">
                  <Label htmlFor="advanceAmount">Advance Amount (₦)</Label>
                  <Input
                    id="advanceAmount"
                    type="number"
                    value={customerData.advanceAmount}
                    onChange={(e) => setCustomerData({ ...customerData, advanceAmount: e.target.value })}
                    placeholder="Amount paid in advance"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            <Link href="/tailor/dashboard">
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding Customer..." : "Add Customer"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
