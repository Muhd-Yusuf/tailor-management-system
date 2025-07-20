"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CollectionReminderModal } from "./collection-reminder-modal"

interface Customer {
  _id: string
  name: string
  phone: string
  orderDate: string
  deliveryDate: string
  status: "pending" | "ready" | "delivered"
  totalAmount: number
  paidAmount: number
}

interface CollectionReminderProps {
  customers: Customer[]
}

export function CollectionReminder({ customers }: CollectionReminderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [overdueCustomers, setOverdueCustomers] = useState<Customer[]>([])
  const [readyCustomers, setReadyCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const today = new Date()
    const overdue: Customer[] = []
    const ready: Customer[] = []

    customers.forEach((customer) => {
      const deliveryDate = new Date(customer.deliveryDate)
      const daysDiff = Math.ceil((today.getTime() - deliveryDate.getTime()) / (1000 * 3600 * 24))

      if (customer.status === "ready" || (customer.status === "pending" && daysDiff > 0)) {
        if (daysDiff > 2) {
          overdue.push(customer)
        } else {
          ready.push(customer)
        }
      }
    })

    setOverdueCustomers(overdue)
    setReadyCustomers(ready)
  }, [customers])

  const totalNotifications = overdueCustomers.length + readyCustomers.length

  if (totalNotifications === 0) return null

  return (
    <>
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="notification-button relative p-3 rounded-full shadow-lg"
          variant="outline"
          size="icon"
        >
          <Bell className="h-5 w-5 text-themed" />
          {totalNotifications > 0 && (
            <Badge className="notification-badge absolute -top-2 -right-2">{totalNotifications}</Badge>
          )}
        </Button>
      </div>

      <CollectionReminderModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        overdueCustomers={overdueCustomers}
        readyCustomers={readyCustomers}
      />
    </>
  )
}
