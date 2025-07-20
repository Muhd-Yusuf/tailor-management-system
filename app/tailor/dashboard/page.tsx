"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CollectionReminder } from "@/components/collection-reminder"
import { WhatsAppContact } from "@/components/whatsapp-contact"
import { showCollectionReminderToast } from "@/components/enhanced-toast"
import { Users, Package, Clock, TrendingUp, Search, Plus, Eye, Edit, CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
  orderDate: string
  collectionDate: string
  items: Array<{
    type: string
    description: string
    measurements: Record<string, number>
    price: number
    status: "pending" | "in-progress" | "completed" | "collected"
  }>
  totalAmount: number
  amountPaid: number
  status: "pending" | "in-progress" | "completed" | "collected"
  notes?: string
}

interface DateFilter {
  mode: "all" | "order" | "collection"
  startDate?: Date
  endDate?: Date
}

export default function TailorDashboard() {
  const router = useRouter()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<DateFilter>({ mode: "all" })
  const [showDateFilter, setShowDateFilter] = useState(false)

  // Stats
  const totalCustomers = customers.length
  const pendingOrders = customers.filter((c) => c.status === "pending").length
  const inProgressOrders = customers.filter((c) => c.status === "in-progress").length
  const readyForCollection = customers.filter((c) => c.status === "completed").length
  const totalRevenue = customers.reduce((sum, c) => sum + c.amountPaid, 0)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    filterCustomers()
  }, [customers, searchTerm, statusFilter, dateFilter])

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

  const filterCustomers = () => {
    let filtered = customers

    // Text search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (customer) =>
          customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          customer.phone.includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((customer) => customer.status === statusFilter)
    }

    // Date filter
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter((customer) => {
        let dateToCheck: Date

        switch (dateFilter.mode) {
          case "order":
            dateToCheck = new Date(customer.orderDate)
            break
          case "collection":
            dateToCheck = new Date(customer.collectionDate)
            break
          case "all":
          default:
            // Check both dates
            const orderDate = new Date(customer.orderDate)
            const collectionDate = new Date(customer.collectionDate)

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

    setFilteredCustomers(filtered)
  }

  const clearDateFilter = () => {
    setDateFilter({ mode: "all" })
    setShowDateFilter(false)
  }

  const handleCollectionReminderClick = (customerId: string) => {
    router.push(`/tailor/customer/${customerId}`)
  }

  const handleCollectionNotification = (count: number) => {
    showCollectionReminderToast(count, () => {
      // Find the first customer ready for collection and navigate to them
      const readyCustomer = customers.find((c) => c.status === "completed")
      if (readyCustomer) {
        router.push(`/tailor/customer/${readyCustomer._id}`)
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
      case "in-progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
      case "collected":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6 theme-transition">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Manage your tailoring business</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => router.push("/tailor/add-customer")}
            className="bg-brand-primary hover:bg-brand-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </div>
      </div>

      {/* Collection Reminder */}
      <CollectionReminder
        customers={customers.filter((c) => c.status === "completed")}
        onCustomerClick={handleCollectionReminderClick}
        onNotificationShow={handleCollectionNotification}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>

        <Card className="glass-card theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting start</p>
          </CardContent>
        </Card>

        <Card className="glass-card theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressOrders}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card className="glass-card theme-transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Collection</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readyForCollection}</div>
            <p className="text-xs text-muted-foreground">Completed orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card theme-transition">
        <CardHeader>
          <CardTitle>Customer Management</CardTitle>
          <CardDescription>Search and filter your customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 focus-brand"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 focus-brand">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="collected">Collected</SelectItem>
              </SelectContent>
            </Select>

            {/* Date Filter */}
            <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-48 justify-start focus-brand bg-transparent">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter.startDate || dateFilter.endDate ? (
                    <span className="truncate">
                      {dateFilter.startDate && format(dateFilter.startDate, "MMM dd")}
                      {dateFilter.startDate && dateFilter.endDate && " - "}
                      {dateFilter.endDate && format(dateFilter.endDate, "MMM dd")}
                    </span>
                  ) : (
                    "Filter by date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Date Filter Mode</h4>
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

                  <Separator />

                  <div>
                    <h4 className="font-medium mb-2">Start Date</h4>
                    <Calendar
                      mode="single"
                      selected={dateFilter.startDate}
                      onSelect={(date) => setDateFilter((prev) => ({ ...prev, startDate: date }))}
                      className="rounded-md border"
                    />
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">End Date</h4>
                    <Calendar
                      mode="single"
                      selected={dateFilter.endDate}
                      onSelect={(date) => setDateFilter((prev) => ({ ...prev, endDate: date }))}
                      className="rounded-md border"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={clearDateFilter} className="flex-1 bg-transparent">
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowDateFilter(false)}
                      className="flex-1 bg-brand-primary hover:bg-brand-primary/90"
                    >
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Clear Filters */}
            {(searchTerm || statusFilter !== "all" || dateFilter.startDate || dateFilter.endDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("all")
                  clearDateFilter()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== "all" || dateFilter.startDate || dateFilter.endDate) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchTerm}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSearchTerm("")} />
                </Badge>
              )}
              {statusFilter !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {statusFilter}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setStatusFilter("all")} />
                </Badge>
              )}
              {(dateFilter.startDate || dateFilter.endDate) && (
                <Badge variant="secondary" className="gap-1">
                  Date: {dateFilter.mode}
                  {dateFilter.startDate && ` from ${format(dateFilter.startDate, "MMM dd")}`}
                  {dateFilter.endDate && ` to ${format(dateFilter.endDate, "MMM dd")}`}
                  <X className="h-3 w-3 cursor-pointer" onClick={clearDateFilter} />
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card className="glass-card theme-transition">
        <CardHeader>
          <CardTitle>Customers ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {customers.length === 0 ? "No customers yet" : "No customers match your filters"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {customers.length === 0
                  ? "Add your first customer to get started"
                  : "Try adjusting your search or filter criteria"}
              </p>
              {customers.length === 0 && (
                <Button
                  onClick={() => router.push("/tailor/add-customer")}
                  className="bg-brand-primary hover:bg-brand-primary/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div
                  key={customer._id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors theme-transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-foreground">{customer.name}</h3>
                        <Badge className={cn("text-xs", getStatusColor(customer.status))}>
                          {customer.status.replace("-", " ")}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>📞 {customer.phone}</p>
                        {customer.email && <p>✉️ {customer.email}</p>}
                        <p>📅 Order: {format(new Date(customer.orderDate), "MMM dd, yyyy")}</p>
                        <p>🎯 Collection: {format(new Date(customer.collectionDate), "MMM dd, yyyy")}</p>
                        <p>
                          💰 Total: {formatCurrency(customer.totalAmount)} | Paid: {formatCurrency(customer.amountPaid)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/tailor/customer/${customer._id}`)}
                        className="focus-brand"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/tailor/customer/${customer._id}/edit`)}
                        className="focus-brand"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Contact */}
      <WhatsAppContact />
    </div>
  )
}
