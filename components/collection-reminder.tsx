"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, User, Phone, Calendar, X } from "lucide-react"
import { format, isToday, isTomorrow, isPast } from "date-fns"
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

interface CollectionReminderProps {
  customers: Customer[]
  onCustomerClick: (customerId: string) => void
  onNotificationShow?: (count: number) => void
}

export function CollectionReminder({ customers, onCustomerClick, onNotificationShow }: CollectionReminderProps) {
  const [dismissed, setDismissed] = useState<string[]>([])
  const [showNotification, setShowNotification] = useState(false)

  // Filter customers ready for collection
  const readyCustomers = customers.filter(
    (customer) => customer.status === "completed" && !dismissed.includes(customer._id),
  )

  // Categorize by urgency
  const overdueCustomers = readyCustomers.filter(
    (customer) => isPast(new Date(customer.collectionDate)) && !isToday(new Date(customer.collectionDate)),
  )

  const todayCustomers = readyCustomers.filter((customer) => isToday(new Date(customer.collectionDate)))

  const tomorrowCustomers = readyCustomers.filter((customer) => isTomorrow(new Date(customer.collectionDate)))

  const upcomingCustomers = readyCustomers.filter((customer) => {
    const collectionDate = new Date(customer.collectionDate)
    return !isPast(collectionDate) && !isToday(collectionDate) && !isTomorrow(collectionDate)
  })

  useEffect(() => {
    if (readyCustomers.length > 0 && !showNotification) {
      setShowNotification(true)
      onNotificationShow?.(readyCustomers.length)
    }
  }, [readyCustomers.length, showNotification, onNotificationShow])

  const handleCustomerClick = (customerId: string) => {
    onCustomerClick(customerId)
  }

  const handleDismissCustomer = (customerId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setDismissed((prev) => [...prev, customerId])
  }

  const getUrgencyColor = (customer: Customer) => {
    const collectionDate = new Date(customer.collectionDate)

    if (isPast(collectionDate) && !isToday(collectionDate)) {
      return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800"
    } else if (isToday(collectionDate)) {
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800"
    } else if (isTomorrow(collectionDate)) {
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
    } else {
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800"
    }
  }

  const getUrgencyLabel = (customer: Customer) => {
    const collectionDate = new Date(customer.collectionDate)

    if (isPast(collectionDate) && !isToday(collectionDate)) {
      return "Overdue"
    } else if (isToday(collectionDate)) {
      return "Due Today"
    } else if (isTomorrow(collectionDate)) {
      return "Due Tomorrow"
    } else {
      return "Upcoming"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (readyCustomers.length === 0) {
    return null
  }

  return (
    <Card className="glass-card border-l-4 border-l-green-500 theme-transition">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-green-500" />
            <CardTitle className="text-green-700 dark:text-green-400">Collection Reminders</CardTitle>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
            {readyCustomers.length} Ready
          </Badge>
        </div>
        <CardDescription>Customers with completed orders ready for collection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overdue Customers */}
        {overdueCustomers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Overdue ({overdueCustomers.length})
            </h4>
            {overdueCustomers.map((customer) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                onClick={() => handleCustomerClick(customer._id)}
                onDismiss={(e) => handleDismissCustomer(customer._id, e)}
                urgencyColor={getUrgencyColor(customer)}
                urgencyLabel={getUrgencyLabel(customer)}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}

        {/* Today's Collections */}
        {todayCustomers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-orange-700 dark:text-orange-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Today ({todayCustomers.length})
            </h4>
            {todayCustomers.map((customer) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                onClick={() => handleCustomerClick(customer._id)}
                onDismiss={(e) => handleDismissCustomer(customer._id, e)}
                urgencyColor={getUrgencyColor(customer)}
                urgencyLabel={getUrgencyLabel(customer)}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}

        {/* Tomorrow's Collections */}
        {tomorrowCustomers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Tomorrow ({tomorrowCustomers.length})
            </h4>
            {tomorrowCustomers.map((customer) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                onClick={() => handleCustomerClick(customer._id)}
                onDismiss={(e) => handleDismissCustomer(customer._id, e)}
                urgencyColor={getUrgencyColor(customer)}
                urgencyLabel={getUrgencyLabel(customer)}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}

        {/* Upcoming Collections */}
        {upcomingCustomers.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Upcoming ({upcomingCustomers.length})
            </h4>
            {upcomingCustomers.slice(0, 3).map((customer) => (
              <CustomerCard
                key={customer._id}
                customer={customer}
                onClick={() => handleCustomerClick(customer._id)}
                onDismiss={(e) => handleDismissCustomer(customer._id, e)}
                urgencyColor={getUrgencyColor(customer)}
                urgencyLabel={getUrgencyLabel(customer)}
                formatCurrency={formatCurrency}
              />
            ))}
            {upcomingCustomers.length > 3 && (
              <p className="text-sm text-muted-foreground text-center">
                And {upcomingCustomers.length - 3} more upcoming...
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CustomerCardProps {
  customer: Customer
  onClick: () => void
  onDismiss: (e: React.MouseEvent) => void
  urgencyColor: string
  urgencyLabel: string
  formatCurrency: (amount: number) => string
}

function CustomerCard({ customer, onClick, onDismiss, urgencyColor, urgencyLabel, formatCurrency }: CustomerCardProps) {
  return (
    <div
      className={cn(
        "p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        urgencyColor,
        "focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2",
      )}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${customer.name}, collection ${urgencyLabel.toLowerCase()}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <User className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium truncate">{customer.name}</span>
            <Badge variant="outline" className="text-xs">
              {urgencyLabel}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              <span className="truncate">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{format(new Date(customer.collectionDate), "MMM dd")}</span>
            </div>
            <div className="font-medium">{formatCurrency(customer.totalAmount)}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-8 w-8 p-0 hover:bg-white/20 flex-shrink-0"
          aria-label={`Dismiss reminder for ${customer.name}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
