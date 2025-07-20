"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Search, Calendar, DollarSign, Clock, Eye, Edit, LogOut, User, Phone, MapPin } from "lucide-react"
import { CollectionReminder } from "@/components/collection-reminder"
import { ThemeToggle } from "@/components/theme-toggle"
import { showToast } from "@/components/enhanced-toast"

interface Customer {
  _id: string
  name: string
  phone: string
  email: string
  address: string
  orderDate: string
  deliveryDate: string
  status: "pending" | "ready" | "delivered"
  totalAmount: number
  paidAmount: number
  measurements: {
    chest?: number
    waist?: number
    hips?: number
    shoulder?: number
    armLength?: number
    legLength?: number
  }
  notes?: string
}

export default function TailorDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "ready" | "delivered">("all")

  useEffect(() => {
    if (!user || user.role !== "tailor") {
      router.push("/login")
      return
    }
    fetchCustomers()
  }, [user, router])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, statusFilter])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/tailor/customers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      } else {
        showToast({
          type: "error",
          title: "Error",
          description: "Failed to fetch customers",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: "Failed to fetch customers",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((customer) => customer.status === statusFilter)
    }

    setFilteredCustomers(filtered)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="status-pending">Pending</Badge>
      case "ready":
        return <Badge className="status-paid">Ready</Badge>
      case "delivered":
        return <Badge className="status-paid">Delivered</Badge>
      default:
        return <Badge className="status-pending">{status}</Badge>
    }
  }

  const getPaymentStatus = (customer: Customer) => {
    const remaining = customer.totalAmount - customer.paidAmount
    if (remaining <= 0) return <Badge className="status-paid">Paid</Badge>
    if (customer.paidAmount > 0) return <Badge className="status-pending">Partial</Badge>
    return <Badge className="status-overdue">Pending</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const stats = {
    total: customers.length,
    pending: customers.filter((c) => c.status === "pending").length,
    ready: customers.filter((c) => c.status === "ready").length,
    delivered: customers.filter((c) => c.status === "delivered").length,
    totalRevenue: customers.reduce((sum, c) => sum + c.paidAmount, 0),
    pendingPayments: customers.reduce((sum, c) => sum + (c.totalAmount - c.paidAmount), 0),
  }

  if (loading) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg">
      <CollectionReminder customers={customers} />

      {/* Header */}
      <div className="glass-card m-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">TailorCraft Pro</h1>
            <p className="text-themed-muted mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="header" />
            <Button onClick={handleLogout} variant="outline" className="theme-toggle-button bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mb-6">
        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-themed-muted text-sm font-medium">Total Customers</p>
                <p className="text-2xl font-bold text-themed">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-themed-muted text-sm font-medium">Pending Orders</p>
                <p className="text-2xl font-bold text-themed">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-themed-muted text-sm font-medium">Ready Orders</p>
                <p className="text-2xl font-bold text-themed">{stats.ready}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-themed-muted text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold text-themed">${stats.totalRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="mx-4 mb-6">
        <Card className="glass-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-xl font-bold text-themed">Customer Management</CardTitle>
              <Button onClick={() => router.push("/tailor/add-customer")} className="glow-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  className="theme-toggle-button"
                  size="sm"
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  className="theme-toggle-button"
                  size="sm"
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "ready" ? "default" : "outline"}
                  onClick={() => setStatusFilter("ready")}
                  className="theme-toggle-button"
                  size="sm"
                >
                  Ready
                </Button>
                <Button
                  variant={statusFilter === "delivered" ? "default" : "outline"}
                  onClick={() => setStatusFilter("delivered")}
                  className="theme-toggle-button"
                  size="sm"
                >
                  Delivered
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-themed-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-themed mb-2">No customers found</h3>
                <p className="text-themed-muted">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Start by adding your first customer"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <Card key={customer._id} className="glass-card-dark table-row">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-themed flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {customer.name}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-themed-muted">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {customer.phone}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {customer.address}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {getStatusBadge(customer.status)}
                              {getPaymentStatus(customer)}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-themed-muted">Order Date:</span>
                              <p className="text-themed font-medium">{formatDate(customer.orderDate)}</p>
                            </div>
                            <div>
                              <span className="text-themed-muted">Delivery Date:</span>
                              <p className="text-themed font-medium">{formatDate(customer.deliveryDate)}</p>
                            </div>
                            <div>
                              <span className="text-themed-muted">Payment:</span>
                              <p className="text-themed font-medium">
                                ${customer.paidAmount} / ${customer.totalAmount}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => router.push(`/tailor/customer/${customer._id}`)}
                            variant="outline"
                            size="sm"
                            className="theme-toggle-button"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => router.push(`/tailor/customer/${customer._id}/edit`)}
                            variant="outline"
                            size="sm"
                            className="theme-toggle-button"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
