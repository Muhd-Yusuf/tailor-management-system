"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, AlertTriangle, Calendar, User, Phone, X, MessageCircle } from "lucide-react"
import { format, isToday, isTomorrow, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast, ToastManager } from "./enhanced-toast"

interface Customer {
  _id: string
  name: string
  phone: string
  email?: string
}

interface Order {
  _id: string
  items: Array<{
    type: string
    description: string
    price: number
    status: string
  }>
  totalAmount: number
  paidAmount: number
  status: "pending" | "in-progress" | "completed"
  orderDate: string
  collectionDate: string
  notes?: string
}

interface CollectionItem {
  customer: Customer
  order: Order
}

interface CollectionReminderProps {
  overdueCollections: CollectionItem[]
  collectionsToday: CollectionItem[]
}

export function CollectionReminder({ overdueCollections, collectionsToday }: CollectionReminderProps) {
  const router = useRouter()
  const { addToast } = useToast()
  const toastManager = ToastManager()
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set())
  const [upcomingCollections, setUpcomingCollections] = useState<CollectionItem[]>([])

  // Calculate upcoming collections (tomorrow and next 3 days)
  useEffect(() => {
    const tomorrow = addDays(new Date(), 1)
    const threeDaysFromNow = addDays(new Date(), 3)

    // This would typically come from props or API, but for now we'll simulate
    const upcoming: CollectionItem[] = []
    setUpcomingCollections(upcoming)
  }, [])

  const handleCustomerClick = (customerId: string, customerName: string) => {
    // Show toast notification
    toastManager.showCollectionReminder(customerName, customerId)

    // Navigate to customer details
    router.push(`/tailor/customer/${customerId}`)
  }

  const handleDismissReminder = (customerId: string, orderId: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the click handler
    const reminderKey = `${customerId}-${orderId}`
    setDismissedReminders((prev) => new Set([...prev, reminderKey]))
  }

  const handleWhatsAppContact = (phone: string, customerName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const message = encodeURIComponent(
      `Hello ${customerName}, your order is ready for collection. Please let us know when you can pick it up. Thank you!`,
    )
    window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`, "_blank")
  }

  const isReminderDismissed = (customerId: string, orderId: string) => {
    return dismissedReminders.has(`${customerId}-${orderId}`)
  }

  const getUrgencyColor = (collectionDate: string) => {
    const date = new Date(collectionDate)
    const today = new Date()

    if (date < today) return "text-red-600 dark:text-red-400"
    if (isToday(date)) return "text-orange-600 dark:text-orange-400"
    if (isTomorrow(date)) return "text-yellow-600 dark:text-yellow-400"
    return "text-blue-600 dark:text-blue-400"
  }

  const getUrgencyBadge = (collectionDate: string) => {
    const date = new Date(collectionDate)
    const today = new Date()

    if (date < today) return <Badge className="status-overdue">Overdue</Badge>
    if (isToday(date)) return <Badge className="status-pending">Today</Badge>
    if (isTomorrow(date)) return <Badge className="bg-yellow-500">Tomorrow</Badge>
    return <Badge variant="outline">Upcoming</Badge>
  }

  // Filter out dismissed reminders
  const activeOverdueCollections = overdueCollections.filter(
    (item) => !isReminderDismissed(item.customer._id, item.order._id),
  )

  const activeTodayCollections = collectionsToday.filter(
    (item) => !isReminderDismissed(item.customer._id, item.order._id),
  )

  const totalActiveReminders = activeOverdueCollections.length + activeTodayCollections.length

  if (totalActiveReminders === 0) {
    return null
  }

  return (
    <div className="mb-8 space-y-4">
      {/* Summary Alert */}
      <Alert
        className={cn(
          "glass-card border-l-4",
          activeOverdueCollections.length > 0
            ? "border-l-red-500 bg-red-50/50 dark:bg-red-900/20"
            : "border-l-orange-500 bg-orange-50/50 dark:bg-orange-900/20",
        )}
      >
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="text-themed">
          <strong>Collection Reminders:</strong> {activeOverdueCollections.length} overdue,{" "}
          {activeTodayCollections.length} due today
        </AlertDescription>
      </Alert>

      {/* Overdue Collections */}
      {activeOverdueCollections.length > 0 && (
        <Card className="glass-card border-red-200 dark:border-red-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Overdue Collections ({activeOverdueCollections.length})
            </CardTitle>
            <CardDescription>These orders are past their collection date and need immediate attention.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeOverdueCollections.map((item) => (
              <div
                key={`${item.customer._id}-${item.order._id}`}
                className="clickable-notification glass-card-dark p-4 cursor-pointer"
                onClick={() => handleCustomerClick(item.customer._id, item.customer.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleCustomerClick(item.customer._id, item.customer.name)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${item.customer.name}'s overdue order`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-themed-muted" />
                      <span className="font-semibold text-themed">{item.customer.name}</span>
                      {getUrgencyBadge(item.order.collectionDate)}
                    </div>

                    <div className="space-y-1 text-sm text-themed-muted">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{item.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className={getUrgencyColor(item.order.collectionDate)}>
                          Due: {format(new Date(item.order.collectionDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>
                          {Math.ceil(
                            (new Date().getTime() - new Date(item.order.collectionDate).getTime()) /
                              (1000 * 60 * 60 * 24),
                          )}{" "}
                          days overdue
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="text-themed-muted">Items: </span>
                      <span className="text-themed">{item.order.items.map((item) => item.type).join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleWhatsAppContact(item.customer.phone, item.customer.name, e)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Contact via WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDismissReminder(item.customer._id, item.order._id, e)}
                      className="text-themed-muted hover:text-themed"
                      title="Dismiss reminder"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Today's Collections */}
      {activeTodayCollections.length > 0 && (
        <Card className="glass-card border-orange-200 dark:border-orange-800">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <Clock className="h-5 w-5" />
              Due Today ({activeTodayCollections.length})
            </CardTitle>
            <CardDescription>These orders are scheduled for collection today.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeTodayCollections.map((item) => (
              <div
                key={`${item.customer._id}-${item.order._id}`}
                className="clickable-notification glass-card-dark p-4 cursor-pointer"
                onClick={() => handleCustomerClick(item.customer._id, item.customer.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault()
                    handleCustomerClick(item.customer._id, item.customer.name)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`View details for ${item.customer.name}'s order due today`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-themed-muted" />
                      <span className="font-semibold text-themed">{item.customer.name}</span>
                      {getUrgencyBadge(item.order.collectionDate)}
                    </div>

                    <div className="space-y-1 text-sm text-themed-muted">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3" />
                        <span>{item.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className={getUrgencyColor(item.order.collectionDate)}>
                          Due: {format(new Date(item.order.collectionDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 text-sm">
                      <span className="text-themed-muted">Items: </span>
                      <span className="text-themed">{item.order.items.map((item) => item.type).join(", ")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleWhatsAppContact(item.customer.phone, item.customer.name, e)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                      title="Contact via WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDismissReminder(item.customer._id, item.order._id, e)}
                      className="text-themed-muted hover:text-themed"
                      title="Dismiss reminder"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
