"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Users, Package, DollarSign, Clock, CalendarIcon, Filter, X, Eye } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CollectionReminder } from "@/components/collection-reminder"
import { WhatsAppContact } from "@/components/whatsapp-contact"
import { ThemeToggle } from "@/components/theme-toggle"

interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  orders: Order[]
  createdAt: string
}

interface Order {
  _id: string
  items: OrderItem[]
  totalAmount: number
  paidAmount: number
  status: "pending" | "in-progress" | "completed"
  orderDate: string
  collectionDate: string
  notes?: string
}

interface OrderItem {
  type: string
  description: string
  measurements: Record<string, number>
  price: number
  status: "pending" | "in-progress" | "completed"
}

interface DateFilter {
  mode: "all" | "order" | "collection"
  startDate?: Date
  endDate?: Date
}

export default function TailorDashboard() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilter>({ mode: "all" })
  const [showDateFilter, setShowDateFilter] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/tailor/customers")
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error("Error fetching customers:", error)
    } finally {
      setLoading(false)
    }
  }

  // Filter customers based on search term and date filters
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    // Apply date filtering
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((customer) => {
        return customer.orders.some((order) => {
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
            case "all":
            default:
              // Check both dates
              const matchesOrder =
                (!dateFilter.startDate || orderDate >= dateFilter.startDate) &&
                (!dateFilter.endDate || orderDate <= dateFilter.endDate)
              const matchesCollection =
                (!dateFilter.startDate || collectionDate >= dateFilter.startDate) &&
                (!dateFilter.endDate || collectionDate <= dateFilter.endDate)
              return matchesOrder || matchesCollection
          }

          return (
            (!dateFilter.startDate || dateToCheck >= dateFilter.startDate) &&
            (!dateFilter.endDate || dateToCheck <= dateFilter.endDate)
          )
        })
      })
    }

    return filtered
  }, [customers, searchTerm, dateFilter])

  // Calculate dashboard statistics
  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const totalOrders = customers.reduce((sum, customer) => sum + customer.orders.length, 0)
    const totalRevenue = customers.reduce(
      (sum, customer) => sum + customer.orders.reduce((orderSum, order) => orderSum + order.paidAmount, 0),
      0,
    )
    const pendingOrders = customers.reduce(
      (sum, customer) => sum + customer.orders.filter((order) => order.status === "pending").length,
      0,
    )

    return { totalCustomers, totalOrders, totalRevenue, pendingOrders }
  }, [customers])

  // Get collections due today and overdue
  const collectionsToday = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return customers.flatMap((customer) =>
      customer.orders
        .filter((order) => {
          const collectionDate = new Date(order.collectionDate)
          collectionDate.setHours(0, 0, 0, 0)
          return collectionDate.getTime() === today.getTime() && order.status !== "completed"
        })
        .map((order) => ({ customer, order })),
    )
  }, [customers])

  const overdueCollections = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return customers.flatMap((customer) =>
      customer.orders
        .filter((order) => {
          const collectionDate = new Date(order.collectionDate)
          collectionDate.setHours(0, 0, 0, 0)
          return collectionDate < today && order.status !== "completed"
        })
        .map((order) => ({ customer, order })),
    )
  }, [customers])

  const clearDateFilter = () => {
    setDateFilter({ mode: "all" })
    setShowDateFilter(false)
  }

  const hasActiveFilter = dateFilter.startDate || dateFilter.endDate

  if (loading) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Tailor Dashboard</h1>
            <p className="text-themed-muted mt-2">Manage your customers and orders</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button onClick={() => router.push("/tailor/add-customer")} className="glow-button">
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>
        </div>

        {/* Collection Reminders */}
        <CollectionReminder overdueCollections={overdueCollections} collectionsToday={collectionsToday} />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-themed-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-themed">{stats.totalCustomers}</div>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-themed-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-themed">{stats.totalOrders}</div>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-themed-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-themed">${stats.totalRevenue}</div>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-themed-muted" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-themed">{stats.pendingOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Controls */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-themed-muted h-4 w-4" />
                  <Input
                    placeholder="Search customers by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input pl-10"
                  />
                </div>
              </div>

              {/* Date Filter Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDateFilter(!showDateFilter)}
                  className={cn("flex items-center gap-2", hasActiveFilter && "bg-primary text-primary-foreground")}
                >
                  <Filter className="h-4 w-4" />
                  Date Filter
                  {hasActiveFilter && (
                    <Badge variant="secondary" className="ml-1">
                      Active
                    </Badge>
                  )}
                </Button>

                {hasActiveFilter && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilter}
                    className="text-themed-muted hover:text-themed"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Date Filter Panel */}
            {showDateFilter && (
              <div className="date-filter-container mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filter Mode */}
                  <div>
                    <label className="text-sm font-medium text-themed mb-2 block">Filter By</label>
                    <Select
                      value={dateFilter.mode}
                      onValueChange={(value: "all" | "order" | "collection") =>
                        setDateFilter((prev) => ({ ...prev, mode: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Dates</SelectItem>
                        <SelectItem value="order">Order Date</SelectItem>
                        <SelectItem value="collection">Collection Date</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="text-sm font-medium text-themed mb-2 block">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateFilter.startDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFilter.startDate ? format(dateFilter.startDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFilter.startDate}
                          onSelect={(date) => setDateFilter((prev) => ({ ...prev, startDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="text-sm font-medium text-themed mb-2 block">End Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !dateFilter.endDate && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateFilter.endDate ? format(dateFilter.endDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={dateFilter.endDate}
                          onSelect={(date) => setDateFilter((prev) => ({ ...prev, endDate: date }))}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Filter Description */}
                <div className="mt-3 text-sm text-themed-muted">
                  {dateFilter.mode === "all" &&
                    "Showing customers with orders or collections in the selected date range"}
                  {dateFilter.mode === "order" && "Showing customers with orders placed in the selected date range"}
                  {dateFilter.mode === "collection" &&
                    "Showing customers with collections due in the selected date range"}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-themed">
              Customers ({filteredCustomers.length})
              {hasActiveFilter && (
                <Badge variant="outline" className="ml-2">
                  Filtered
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-themed-muted">
              {hasActiveFilter
                ? `Showing ${filteredCustomers.length} of ${customers.length} customers`
                : "All your customers and their orders"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-themed-muted mx-auto mb-4" />
                <p className="text-themed-muted">
                  {customers.length === 0
                    ? "No customers found. Add your first customer to get started."
                    : "No customers match your search criteria."}
                </p>
                {customers.length === 0 && (
                  <Button onClick={() => router.push("/tailor/add-customer")} className="glow-button mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Customer
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer._id} className="modern-table p-4 rounded-lg border table-row">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-themed">{customer.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            {customer.orders.length} order{customer.orders.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <div className="text-sm text-themed-muted space-y-1">
                          <p>📞 {customer.phone}</p>
                          {customer.email && <p>✉️ {customer.email}</p>}
                          <p>📅 Customer since {format(new Date(customer.createdAt), "MMM yyyy")}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        {/* Order Status Summary */}
                        <div className="flex gap-2">
                          {customer.orders.some((order) => order.status === "pending") && (
                            <Badge className="status-pending">Pending</Badge>
                          )}
                          {customer.orders.some((order) => order.status === "in-progress") && (
                            <Badge className="bg-blue-500">In Progress</Badge>
                          )}
                          {customer.orders.some((order) => order.status === "completed") && (
                            <Badge className="status-paid">Completed</Badge>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <WhatsAppContact phone={customer.phone} />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/tailor/customer/${customer._id}`)}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders Preview */}
                    {customer.orders.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-themed-muted">Latest Order:</span>
                            <p className="text-themed font-medium">
                              {format(new Date(customer.orders[0].orderDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <span className="text-themed-muted">Collection Due:</span>
                            <p className="text-themed font-medium">
                              {format(new Date(customer.orders[0].collectionDate), "MMM dd, yyyy")}
                            </p>
                          </div>
                          <div>
                            <span className="text-themed-muted">Total Value:</span>
                            <p className="text-themed font-medium">
                              ${customer.orders.reduce((sum, order) => sum + order.totalAmount, 0)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
