"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CollectionReminder } from "@/components/collection-reminder"
import { ThemeToggle } from "@/components/theme-toggle"
import { showToast } from "@/components/enhanced-toast"
import { Plus, Users, DollarSign, Clock, LogOut, Search, Bell, Filter, TrendingUp } from "lucide-react"
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
}

export default function TailorDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [stats, setStats] = useState({
    totalCustomers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    advancePayments: 0,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "tailor" || user.status !== "approved")) {
      router.push("/login")
      return
    }
    if (user?.role === "tailor" && user.status === "approved") {
      fetchCustomers()
    }
  }, [user, loading, router])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, filterStatus])

  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/tailor/customers", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setCustomers(data)

        // Calculate stats
        const totalCustomers = data.length
        const pendingOrders = data.filter(
          (c: Customer) => new Date(c.expectedDate) > new Date() && c.paymentStatus !== "paid",
        ).length
        const totalRevenue = data
          .filter((c: Customer) => c.paymentStatus === "paid")
          .reduce((sum: number, c: Customer) => sum + c.amount, 0)
        const advancePayments = data
          .filter((c: Customer) => c.paymentStatus === "advance")
          .reduce((sum: number, c: Customer) => sum + (c.advanceAmount || 0), 0)

        setStats({ totalCustomers, pendingOrders, totalRevenue, advancePayments })

        // Show welcome toast for first-time users
        if (data.length === 0) {
          showToast({
            type: "info",
            title: "🎉 Welcome to TailorCraft Pro!",
            description: "Start by adding your first customer to begin managing your business",
            duration: 6000,
          })
        }
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error)
      showToast({
        type: "error",
        title: "🌐 Connection Error",
        description: "Failed to load customer data. Please refresh the page.",
        duration: 5000,
      })
    }
  }

  const filterCustomers = () => {
    let filtered = customers

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchLower) ||
          customer.phone.includes(searchTerm) ||
          customer.address?.toLowerCase().includes(searchLower),
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((customer) => customer.paymentStatus === filterStatus)
    }

    setFilteredCustomers(filtered)
  }

  const getStatusBadge = (status: string, advanceAmount?: number) => {
    switch (status) {
      case "paid":
        return <Badge className="status-paid text-white font-medium">✅ Fully Paid</Badge>
      case "advance":
        return (
          <Badge className="status-pending text-white font-medium">
            💰 Advance (₦{advanceAmount?.toLocaleString()})
          </Badge>
        )
      default:
        return <Badge className="status-overdue text-white font-medium">⏳ Not Paid</Badge>
    }
  }

  const isOverdue = (expectedDate: string) => {
    return new Date(expectedDate) < new Date()
  }

  const getUrgencyIndicator = (customer: Customer) => {
    const daysUntil = Math.ceil(
      (new Date(customer.expectedDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysUntil < 0 && customer.paymentStatus !== "paid") {
      return <span className="text-red-400 text-xs font-medium">🚨 {Math.abs(daysUntil)} days overdue</span>
    }
    if (daysUntil <= 1 && customer.paymentStatus !== "paid") {
      return (
        <span className="text-yellow-400 text-xs font-medium">⚡ Due {daysUntil === 0 ? "today" : "tomorrow"}</span>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-themed-muted text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg">
      <CollectionReminder customers={customers} />

      {/* Header */}
      <div className="glass-card-dark shadow-lg border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-themed gradient-text">Professional Dashboard</h1>
              <p className="text-themed-muted text-sm mt-1">Manage your customers and orders efficiently</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle variant="header" size="sm" />
              <div className="relative">
                <Bell className="h-6 w-6 text-themed-muted hover:text-themed transition-colors cursor-pointer" />
                {stats.pendingOrders > 0 && (
                  <span className="absolute -top-2 -right-2 notification-badge h-5 w-5 rounded-full text-xs flex items-center justify-center text-white font-bold">
                    {stats.pendingOrders}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-themed-muted">Welcome back,</p>
                <p className="font-semibold text-themed">{user?.name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="glass-card text-themed hover:bg-white/20 border-white/30 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Total Customers</CardTitle>
              <Users className="h-5 w-5 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-themed mb-1">{stats.totalCustomers}</div>
              <p className="text-xs text-themed-muted">Active customer base</p>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Pending Orders</CardTitle>
              <Clock className="h-5 w-5 text-yellow-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-300 mb-1">{stats.pendingOrders}</div>
              <p className="text-xs text-themed-muted">Awaiting completion</p>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Total Revenue</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-300 mb-1">₦{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-themed-muted">Completed payments</p>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Advance Payments</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-300 mb-1">₦{stats.advancePayments.toLocaleString()}</div>
              <p className="text-xs text-themed-muted">Partial payments received</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="flex-1 w-full">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-themed-muted" />
                  <Input
                    placeholder="Search customers by name, phone, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 search-input h-12 text-themed placeholder:text-themed-muted pointer-events-auto"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-themed-muted" />
                <div className="flex gap-2">
                  {[
                    { key: "all", label: "All", count: customers.length },
                    { key: "paid", label: "Paid", count: customers.filter((c) => c.paymentStatus === "paid").length },
                    {
                      key: "advance",
                      label: "Advance",
                      count: customers.filter((c) => c.paymentStatus === "advance").length,
                    },
                    {
                      key: "not_paid",
                      label: "Unpaid",
                      count: customers.filter((c) => c.paymentStatus === "not_paid").length,
                    },
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={filterStatus === filter.key ? "default" : "outline"}
                      onClick={() => setFilterStatus(filter.key)}
                      className={
                        filterStatus === filter.key
                          ? "glow-button text-sm pointer-events-auto cursor-pointer"
                          : "glass-card text-themed hover:bg-white/20 border-white/30 text-sm pointer-events-auto cursor-pointer"
                      }
                      size="sm"
                    >
                      {filter.label} ({filter.count})
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="mb-6">
          <Link href="/tailor/add-customer">
            <Button className="glow-button text-base px-6 py-3 pointer-events-auto cursor-pointer">
              <Plus className="h-5 w-5 mr-2" />
              Add New Customer
            </Button>
          </Link>
        </div>

        {/* Customers Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-themed gradient-text text-xl">Customer Management</CardTitle>
            <CardDescription className="text-themed-muted">
              {filteredCustomers.length > 0
                ? `Showing ${filteredCustomers.length} of ${customers.length} customers`
                : "No customers found matching your criteria"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length > 0 ? (
              <div className="overflow-x-auto modern-table">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-themed font-semibold">Customer</TableHead>
                      <TableHead className="text-themed font-semibold">Contact</TableHead>
                      <TableHead className="text-themed font-semibold">Order Date</TableHead>
                      <TableHead className="text-themed font-semibold">Collection Date</TableHead>
                      <TableHead className="text-themed font-semibold">Amount</TableHead>
                      <TableHead className="text-themed font-semibold">Status</TableHead>
                      <TableHead className="text-themed font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCustomers.map((customer) => (
                      <TableRow key={customer._id} className="border-white/10 table-row">
                        <TableCell className="font-medium text-themed">
                          <div>
                            <div className="font-semibold">{customer.name}</div>
                            {getUrgencyIndicator(customer)}
                          </div>
                        </TableCell>
                        <TableCell className="text-themed-muted">
                          <div className="text-sm">
                            <div>{customer.phone}</div>
                            {customer.address && (
                              <div className="text-themed-muted text-xs truncate max-w-32">{customer.address}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-themed-muted">
                          {new Date(customer.orderDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-themed-muted">
                          <span
                            className={
                              isOverdue(customer.expectedDate) && customer.paymentStatus !== "paid"
                                ? "text-red-300 font-medium"
                                : ""
                            }
                          >
                            {new Date(customer.expectedDate).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-themed font-semibold">₦{customer.amount.toLocaleString()}</TableCell>
                        <TableCell>{getStatusBadge(customer.paymentStatus, customer.advanceAmount)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Link href={`/tailor/customer/${customer._id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="glass-card text-themed hover:bg-white/20 border-white/30 bg-transparent text-xs pointer-events-auto cursor-pointer"
                              >
                                View
                              </Button>
                            </Link>
                            <Link href={`/tailor/customer/${customer._id}/edit`}>
                              <Button size="sm" className="glow-button text-xs pointer-events-auto cursor-pointer">
                                Edit
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-themed-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-themed mb-2">
                  {searchTerm || filterStatus !== "all" ? "No customers found" : "No customers yet"}
                </h3>
                <p className="text-themed-muted mb-6">
                  {searchTerm || filterStatus !== "all"
                    ? "Try adjusting your search or filter criteria"
                    : "Start by adding your first customer to begin managing your business"}
                </p>
                {!searchTerm && filterStatus === "all" && (
                  <Link href="/tailor/add-customer">
                    <Button className="glow-button">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Customer
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
