"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { CollectionReminder } from "@/components/collection-reminder"
import { WhatsAppContact } from "@/components/whatsapp-contact"
import {
  Users,
  Package,
  DollarSign,
  CalendarIcon,
  Search,
  Plus,
  Filter,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Eye,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  orders: Order[]
  totalSpent: number
  status: "active" | "inactive"
  lastVisit: string
}

interface Order {
  id: string
  customerId: string
  customerName: string
  items: OrderItem[]
  status: "pending" | "in_progress" | "ready" | "completed" | "cancelled"
  orderDate: string
  collectionDate: string
  totalAmount: number
  paidAmount: number
  notes?: string
}

interface OrderItem {
  id: string
  type: string
  description: string
  measurements: Record<string, number>
  price: number
  status: "pending" | "cutting" | "sewing" | "finishing" | "ready"
}

interface DateFilter {
  mode: "all" | "order" | "collection"
  startDate?: Date
  endDate?: Date
}

export default function TailorDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>({ mode: "all" })
  const [isLoading, setIsLoading] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    const mockCustomers: Customer[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        avatar: "/placeholder-user.jpg",
        orders: [],
        totalSpent: 450,
        status: "active",
        lastVisit: "2024-01-15",
      },
      {
        id: "2",
        name: "Jane Smith",
        email: "jane@example.com",
        phone: "+1234567891",
        orders: [],
        totalSpent: 320,
        status: "active",
        lastVisit: "2024-01-10",
      },
      {
        id: "3",
        name: "Mike Johnson",
        email: "mike@example.com",
        phone: "+1234567892",
        orders: [],
        totalSpent: 180,
        status: "inactive",
        lastVisit: "2023-12-20",
      },
    ]

    const mockOrders: Order[] = [
      {
        id: "1",
        customerId: "1",
        customerName: "John Doe",
        items: [
          {
            id: "1",
            type: "Suit",
            description: "Navy blue business suit",
            measurements: { chest: 42, waist: 34, length: 30 },
            price: 350,
            status: "ready",
          },
        ],
        status: "ready",
        orderDate: "2024-01-10",
        collectionDate: "2024-01-20",
        totalAmount: 350,
        paidAmount: 200,
        notes: "Customer prefers slim fit",
      },
      {
        id: "2",
        customerId: "2",
        customerName: "Jane Smith",
        items: [
          {
            id: "2",
            type: "Dress",
            description: "Evening dress with alterations",
            measurements: { bust: 36, waist: 28, hips: 38 },
            price: 180,
            status: "sewing",
          },
        ],
        status: "in_progress",
        orderDate: "2024-01-12",
        collectionDate: "2024-01-25",
        totalAmount: 180,
        paidAmount: 90,
      },
      {
        id: "3",
        customerId: "1",
        customerName: "John Doe",
        items: [
          {
            id: "3",
            type: "Shirt",
            description: "Custom white dress shirt",
            measurements: { collar: 16, chest: 42, sleeve: 34 },
            price: 100,
            status: "ready",
          },
        ],
        status: "ready",
        orderDate: "2024-01-08",
        collectionDate: "2024-01-18",
        totalAmount: 100,
        paidAmount: 100,
      },
      {
        id: "4",
        customerId: "3",
        customerName: "Mike Johnson",
        items: [
          {
            id: "4",
            type: "Pants",
            description: "Hemming and waist adjustment",
            measurements: { waist: 32, length: 30 },
            price: 50,
            status: "pending",
          },
        ],
        status: "pending",
        orderDate: "2024-01-14",
        collectionDate: "2024-01-22",
        totalAmount: 50,
        paidAmount: 0,
      },
    ]

    setCustomers(mockCustomers)
    setOrders(mockOrders)
    setIsLoading(false)
  }, [])

  // Filter orders based on search, status, and date filters
  const filteredOrders = useMemo(() => {
    let filtered = orders

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) => item.type.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Date filter
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.orderDate)
        const collectionDate = new Date(order.collectionDate)

        let dateToCheck: Date
        switch (dateFilter.mode) {
          case "order":
            dateToCheck = orderDate
            break
          case "collection":
            dateToCheck = collectionDate
            break
          default:
            // For "all" mode, check both dates
            const startMatch =
              !dateFilter.startDate || orderDate >= dateFilter.startDate || collectionDate >= dateFilter.startDate
            const endMatch =
              !dateFilter.endDate || orderDate <= dateFilter.endDate || collectionDate <= dateFilter.endDate
            return startMatch && endMatch
        }

        const startMatch = !dateFilter.startDate || dateToCheck >= dateFilter.startDate
        const endMatch = !dateFilter.endDate || dateToCheck <= dateFilter.endDate
        return startMatch && endMatch
      })
    }

    return filtered
  }, [orders, searchTerm, statusFilter, dateFilter])

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const activeCustomers = customers.filter((c) => c.status === "active").length
    const totalOrders = orders.length
    const pendingOrders = orders.filter((o) => o.status === "pending").length
    const readyOrders = orders.filter((o) => o.status === "ready").length
    const totalRevenue = orders.reduce((sum, order) => sum + order.paidAmount, 0)
    const pendingPayments = orders.reduce((sum, order) => sum + (order.totalAmount - order.paidAmount), 0)

    return {
      totalCustomers,
      activeCustomers,
      totalOrders,
      pendingOrders,
      readyOrders,
      totalRevenue,
      pendingPayments,
    }
  }, [customers, orders])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const clearDateFilter = () => {
    setDateFilter({ mode: "all" })
  }

  const hasActiveFilters = searchTerm || statusFilter !== "all" || dateFilter.startDate || dateFilter.endDate

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-theme">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Tailor Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your customers and orders efficiently</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/tailor/add-customer">
              <Button className="glass-button">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
          </div>
        </div>

        {/* Collection Reminders */}
        <CollectionReminder orders={orders.filter((o) => o.status === "ready")} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card transition-theme">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCustomers}</div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                <TrendingUp className="h-3 w-3 inline mr-1" />
                {stats.activeCustomers} active
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card transition-theme">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalOrders}</div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                <Clock className="h-3 w-3 inline mr-1" />
                {stats.pendingOrders} pending
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card transition-theme">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${stats.totalRevenue}</div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                <AlertCircle className="h-3 w-3 inline mr-1" />${stats.pendingPayments} pending
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card transition-theme">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.readyOrders}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Ready for collection</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="glass-card transition-theme">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">Orders Management</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-400">
              Filter and search through your orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and Status Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search orders, customers, or items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 glass-input focus-brand"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 glass-input">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Filter Row */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Date Filter:</span>
              </div>

              <Select
                value={dateFilter.mode}
                onValueChange={(value: "all" | "order" | "collection") =>
                  setDateFilter((prev) => ({ ...prev, mode: value }))
                }
              >
                <SelectTrigger className="w-full sm:w-40 glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dates</SelectItem>
                  <SelectItem value="order">Order Date</SelectItem>
                  <SelectItem value="collection">Collection Date</SelectItem>
                </SelectContent>
              </Select>

              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="glass-input justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter.startDate ? (
                      dateFilter.endDate ? (
                        <>
                          {format(dateFilter.startDate, "LLL dd, y")} - {format(dateFilter.endDate, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateFilter.startDate, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <Calendar
                        mode="single"
                        selected={dateFilter.startDate}
                        onSelect={(date) => setDateFilter((prev) => ({ ...prev, startDate: date }))}
                        initialFocus
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <Calendar
                        mode="single"
                        selected={dateFilter.endDate}
                        onSelect={(date) => setDateFilter((prev) => ({ ...prev, endDate: date }))}
                        disabled={(date) => (dateFilter.startDate ? date < dateFilter.startDate : false)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          clearDateFilter()
                          setShowDatePicker(false)
                        }}
                      >
                        Clear
                      </Button>
                      <Button size="sm" onClick={() => setShowDatePicker(false)}>
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("")
                    setStatusFilter("all")
                    clearDateFilter()
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <Badge variant="secondary" className="glass-card">
                    Search: {searchTerm}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setSearchTerm("")} />
                  </Badge>
                )}
                {statusFilter !== "all" && (
                  <Badge variant="secondary" className="glass-card">
                    Status: {statusFilter}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setStatusFilter("all")} />
                  </Badge>
                )}
                {(dateFilter.startDate || dateFilter.endDate) && (
                  <Badge variant="secondary" className="glass-card">
                    {dateFilter.mode === "all"
                      ? "All Dates"
                      : dateFilter.mode === "order"
                        ? "Order Date"
                        : "Collection Date"}
                    {dateFilter.startDate && `: ${format(dateFilter.startDate, "MMM dd")}`}
                    {dateFilter.endDate && ` - ${format(dateFilter.endDate, "MMM dd")}`}
                    <X className="h-3 w-3 ml-1 cursor-pointer" onClick={clearDateFilter} />
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Orders List */}
        <Card className="glass-card transition-theme">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Orders ({filteredOrders.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  {hasActiveFilters ? "No orders match your filters" : "No orders found"}
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("")
                      setStatusFilter("all")
                      clearDateFilter()
                    }}
                    className="mt-2"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="glass-card p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center space-x-4 flex-1">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder-user.jpg" alt={order.customerName} />
                          <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            {order.customerName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {order.customerName}
                            </h3>
                            <Badge className={cn("text-xs", getStatusColor(order.status))}>
                              {order.status.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <p>
                              Order #{order.id} • {order.items.length} item(s)
                            </p>
                            <p>
                              Order: {format(new Date(order.orderDate), "MMM dd, yyyy")} • Collection:{" "}
                              {format(new Date(order.collectionDate), "MMM dd, yyyy")}
                            </p>
                            <p className="font-medium">
                              ${order.totalAmount} • Paid: ${order.paidAmount}
                              {order.totalAmount > order.paidAmount && (
                                <span className="text-red-600 dark:text-red-400 ml-2">
                                  (${order.totalAmount - order.paidAmount} due)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <WhatsAppContact
                          phone={customers.find((c) => c.id === order.customerId)?.phone || ""}
                          message={`Hi ${order.customerName}, your order #${order.id} is ${order.status}. ${
                            order.status === "ready" ? "Ready for collection!" : ""
                          }`}
                        />
                        <Link href={`/tailor/customer/${order.customerId}`}>
                          <Button variant="outline" size="sm" className="glass-button bg-transparent">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
