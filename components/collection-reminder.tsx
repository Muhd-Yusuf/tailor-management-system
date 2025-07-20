"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Bell, Clock, Calendar, X, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, Eye } from "lucide-react"
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { WhatsAppContact } from "./whatsapp-contact"
import { showCollectionReminderToast } from "./enhanced-toast"

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

interface CollectionReminderProps {
  orders: Order[]
}

interface GroupedReminders {
  overdue: Order[]
  today: Order[]
  tomorrow: Order[]
  upcoming: Order[]
}

export function CollectionReminder({ orders }: CollectionReminderProps) {
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(true)
  const [hasShownToast, setHasShownToast] = useState(false)

  // Group orders by collection urgency
  const groupedReminders: GroupedReminders = orders.reduce(
    (acc, order) => {
      if (dismissedReminders.has(order.id)) return acc

      const collectionDate = new Date(order.collectionDate)

      if (isPast(collectionDate) && !isToday(collectionDate)) {
        acc.overdue.push(order)
      } else if (isToday(collectionDate)) {
        acc.today.push(order)
      } else if (isTomorrow(collectionDate)) {
        acc.tomorrow.push(order)
      } else if (differenceInDays(collectionDate, new Date()) <= 7) {
        acc.upcoming.push(order)
      }

      return acc
    },
    { overdue: [], today: [], tomorrow: [], upcoming: [] } as GroupedReminders,
  )

  const totalReminders = Object.values(groupedReminders).reduce((sum, group) => sum + group.length, 0)

  // Show toast notification for urgent reminders
  useEffect(() => {
    if (!hasShownToast && (groupedReminders.overdue.length > 0 || groupedReminders.today.length > 0)) {
      const urgentCount = groupedReminders.overdue.length + groupedReminders.today.length
      if (urgentCount > 0) {
        showCollectionReminderToast(
          urgentCount === 1
            ? (groupedReminders.overdue[0] || groupedReminders.today[0]).customerName
            : `${urgentCount} customers`,
          urgentCount === 1 ? (groupedReminders.overdue[0] || groupedReminders.today[0]).customerId : "",
        )
        setHasShownToast(true)
      }
    }
  }, [groupedReminders, hasShownToast])

  const dismissReminder = (orderId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDismissedReminders((prev) => new Set([...prev, orderId]))
  }

  const getUrgencyColor = (order: Order) => {
    const collectionDate = new Date(order.collectionDate)

    if (isPast(collectionDate) && !isToday(collectionDate)) {
      return "border-red-500 bg-red-50 dark:bg-red-900/20"
    } else if (isToday(collectionDate)) {
      return "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
    } else if (isTomorrow(collectionDate)) {
      return "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
    }
    return "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
  }

  const getUrgencyIcon = (order: Order) => {
    const collectionDate = new Date(order.collectionDate)

    if (isPast(collectionDate) && !isToday(collectionDate)) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    } else if (isToday(collectionDate)) {
      return <Clock className="h-4 w-4 text-orange-500" />
    } else if (isTomorrow(collectionDate)) {
      return <Calendar className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-blue-500" />
  }

  const ReminderCard = ({ order, label }: { order: Order; label: string }) => (
    <Link
      href={`/tailor/customer/${order.customerId}`}
      className="block transition-all duration-200 hover:scale-[1.02] focus:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          window.location.href = `/tailor/customer/${order.customerId}`
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${order.customerName}'s order`}
    >
      <div
        className={cn(
          "glass-card p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-lg",
          getUrgencyColor(order),
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {getUrgencyIcon(order)}
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-user.jpg" alt={order.customerName} />
              <AvatarFallback className="bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-xs">
                {order.customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                  {order.customerName}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {label}
                </Badge>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  Order #{order.id} • {order.items.length} item(s)
                </p>
                <p className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Collection: {format(new Date(order.collectionDate), "MMM dd, yyyy")}
                </p>
                <p className="font-medium">
                  ${order.totalAmount}
                  {order.totalAmount > order.paidAmount && (
                    <span className="text-red-600 dark:text-red-400 ml-1">
                      (${order.totalAmount - order.paidAmount} due)
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <WhatsAppContact
              phone="+1234567890" // This should come from customer data
              message={`Hi ${order.customerName}, your order #${order.id} is ready for collection!`}
              size="sm"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => dismissReminder(order.id, e)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
              aria-label="Dismiss reminder"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )

  if (totalReminders === 0) {
    return null
  }

  return (
    <Card className="glass-card border-l-4 border-l-blue-500 transition-theme">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Collection Reminders
            </CardTitle>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
              {totalReminders}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Click on any reminder to view customer details and manage orders
        </CardDescription>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Overdue Orders */}
          {groupedReminders.overdue.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <h3 className="font-semibold text-red-700 dark:text-red-400 text-sm">
                  Overdue ({groupedReminders.overdue.length})
                </h3>
              </div>
              <div className="space-y-2">
                {groupedReminders.overdue.map((order) => (
                  <ReminderCard key={order.id} order={order} label="Overdue" />
                ))}
              </div>
            </div>
          )}

          {/* Today's Collections */}
          {groupedReminders.today.length > 0 && (
            <div className="space-y-2">
              {groupedReminders.overdue.length > 0 && <Separator />}
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <h3 className="font-semibold text-orange-700 dark:text-orange-400 text-sm">
                  Due Today ({groupedReminders.today.length})
                </h3>
              </div>
              <div className="space-y-2">
                {groupedReminders.today.map((order) => (
                  <ReminderCard key={order.id} order={order} label="Today" />
                ))}
              </div>
            </div>
          )}

          {/* Tomorrow's Collections */}
          {groupedReminders.tomorrow.length > 0 && (
            <div className="space-y-2">
              {(groupedReminders.overdue.length > 0 || groupedReminders.today.length > 0) && <Separator />}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-500" />
                <h3 className="font-semibold text-yellow-700 dark:text-yellow-400 text-sm">
                  Due Tomorrow ({groupedReminders.tomorrow.length})
                </h3>
              </div>
              <div className="space-y-2">
                {groupedReminders.tomorrow.map((order) => (
                  <ReminderCard key={order.id} order={order} label="Tomorrow" />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Collections */}
          {groupedReminders.upcoming.length > 0 && (
            <div className="space-y-2">
              {(groupedReminders.overdue.length > 0 ||
                groupedReminders.today.length > 0 ||
                groupedReminders.tomorrow.length > 0) && <Separator />}
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold text-blue-700 dark:text-blue-400 text-sm">
                  Upcoming ({groupedReminders.upcoming.length})
                </h3>
              </div>
              <div className="space-y-2">
                {groupedReminders.upcoming.map((order) => (
                  <ReminderCard key={order.id} order={order} label="Upcoming" />
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <Separator />
          <div className="flex flex-wrap gap-2">
            <Link href="/tailor/dashboard">
              <Button variant="outline" size="sm" className="glass-button bg-transparent">
                <Eye className="h-3 w-3 mr-1" />
                View All Orders
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allOrderIds = Object.values(groupedReminders)
                  .flat()
                  .map((order) => order.id)
                setDismissedReminders((prev) => new Set([...prev, ...allOrderIds]))
              }}
              className="glass-button"
            >
              <X className="h-3 w-3 mr-1" />
              Dismiss All
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
