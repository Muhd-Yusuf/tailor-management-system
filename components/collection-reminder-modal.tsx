"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Phone, User } from "lucide-react"

interface Customer {
  _id: string
  name: string
  phone: string
  expectedDate: string
  paymentStatus: string
  amount: number
}

interface CollectionReminderModalProps {
  customers: Customer[]
}

export function CollectionReminderModal({ customers }: CollectionReminderModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [upcomingCustomers, setUpcomingCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const checkUpcomingCollections = () => {
      const today = new Date()
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(today.getDate() + 3)

      const upcoming = customers.filter((customer) => {
        const expectedDate = new Date(customer.expectedDate)
        return expectedDate >= today && expectedDate <= threeDaysFromNow
      })

      if (upcoming.length > 0) {
        setUpcomingCustomers(upcoming)
        setIsOpen(true)
      }
    }

    if (customers.length > 0) {
      checkUpcomingCollections()
    }
  }, [customers])

  const getDaysUntilCollection = (expectedDate: string) => {
    const today = new Date()
    const expected = new Date(expectedDate)
    const diffTime = expected.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPriorityColor = (days: number) => {
    if (days <= 1) return "status-overdue"
    if (days <= 2) return "status-pending"
    return "status-paid"
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-card-dark border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 gradient-text">
            <Clock className="h-5 w-5 text-yellow-300" />
            <span>Collection Reminders</span>
          </DialogTitle>
          <DialogDescription className="text-white/70">
            You have {upcomingCustomers.length} customer{upcomingCustomers.length > 1 ? "s" : ""} with upcoming
            collection dates
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {upcomingCustomers.map((customer) => {
            const daysUntil = getDaysUntilCollection(customer.expectedDate)
            return (
              <div key={customer._id} className="glass-card p-3 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-blue-300" />
                    <span className="font-medium text-white">{customer.name}</span>
                  </div>
                  <Badge className={`${getPriorityColor(daysUntil)} text-white text-xs`}>
                    {daysUntil === 0 ? "Today" : daysUntil === 1 ? "Tomorrow" : `${daysUntil} days`}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-white/70">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(customer.expectedDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="text-xs text-white/60">
                  Amount: ₦{customer.amount.toLocaleString()} • Status: {customer.paymentStatus.replace("_", " ")}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={() => setIsOpen(false)} className="flex-1 glow-button">
            Got it!
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="glass-card text-white hover:bg-white/20 border-white/20"
          >
            Remind Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
