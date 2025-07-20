"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Phone, User, AlertTriangle, CheckCircle } from "lucide-react"

interface Customer {
  _id: string
  name: string
  phone: string
  expectedDate: string
  paymentStatus: string
  amount: number
}

interface CollectionReminderProps {
  customers: Customer[]
}

export function CollectionReminder({ customers }: CollectionReminderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [upcomingCustomers, setUpcomingCustomers] = useState<Customer[]>([])
  const [overdueCustomers, setOverdueCustomers] = useState<Customer[]>([])

  useEffect(() => {
    const checkCollections = () => {
      const today = new Date()
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(today.getDate() + 3)

      const upcoming = customers.filter((customer) => {
        const expectedDate = new Date(customer.expectedDate)
        return expectedDate >= today && expectedDate <= threeDaysFromNow && customer.paymentStatus !== "paid"
      })

      const overdue = customers.filter((customer) => {
        const expectedDate = new Date(customer.expectedDate)
        return expectedDate < today && customer.paymentStatus !== "paid"
      })

      if (upcoming.length > 0 || overdue.length > 0) {
        setUpcomingCustomers(upcoming)
        setOverdueCustomers(overdue)
        setIsOpen(true)
      }
    }

    if (customers.length > 0) {
      checkCollections()
    }
  }, [customers])

  const getDaysUntilCollection = (expectedDate: string) => {
    const today = new Date()
    const expected = new Date(expectedDate)
    const diffTime = expected.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPriorityBadge = (days: number) => {
    if (days < 0) {
      return <Badge className="status-overdue text-white text-xs">Overdue</Badge>
    }
    if (days === 0) {
      return <Badge className="status-overdue text-white text-xs">Today</Badge>
    }
    if (days === 1) {
      return <Badge className="status-pending text-white text-xs">Tomorrow</Badge>
    }
    return <Badge className="status-paid text-white text-xs">{days} days</Badge>
  }

  const totalReminders = upcomingCustomers.length + overdueCustomers.length

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-card-dark border-white/20 text-white max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 gradient-text text-xl">
            <Clock className="h-6 w-6 text-yellow-400 pulse-glow" />
            <span>Collection Reminders</span>
          </DialogTitle>
          <DialogDescription className="text-white/80">
            You have {totalReminders} customer{totalReminders > 1 ? "s" : ""} requiring attention
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Overdue Customers */}
          {overdueCustomers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <h3 className="font-semibold text-red-400">Overdue Collections ({overdueCustomers.length})</h3>
              </div>
              {overdueCustomers.map((customer) => {
                const daysOverdue = Math.abs(getDaysUntilCollection(customer.expectedDate))
                return (
                  <div
                    key={customer._id}
                    className="glass-card p-4 rounded-lg border-l-4 border-l-red-400 bg-red-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-red-300" />
                        <span className="font-medium text-white">{customer.name}</span>
                      </div>
                      <Badge className="status-overdue text-white text-xs">
                        {daysOverdue} day{daysOverdue > 1 ? "s" : ""} overdue
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(customer.expectedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      Amount: ₦{customer.amount.toLocaleString()} • Status: {customer.paymentStatus.replace("_", " ")}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Upcoming Customers */}
          {upcomingCustomers.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-400" />
                <h3 className="font-semibold text-blue-400">Upcoming Collections ({upcomingCustomers.length})</h3>
              </div>
              {upcomingCustomers.map((customer) => {
                const daysUntil = getDaysUntilCollection(customer.expectedDate)
                return (
                  <div
                    key={customer._id}
                    className="glass-card p-4 rounded-lg border-l-4 border-l-blue-400 bg-blue-500/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-blue-300" />
                        <span className="font-medium text-white">{customer.name}</span>
                      </div>
                      {getPriorityBadge(daysUntil)}
                    </div>
                    <div className="flex items-center justify-between text-sm text-white/80">
                      <div className="flex items-center space-x-1">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(customer.expectedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-xs text-white/70 mt-1">
                      Amount: ₦{customer.amount.toLocaleString()} • Status: {customer.paymentStatus.replace("_", " ")}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex space-x-3 pt-4 border-t border-white/10">
          <Button onClick={() => setIsOpen(false)} className="flex-1 glow-button">
            <CheckCircle className="h-4 w-4 mr-2" />
            Got it!
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="glass-card text-white hover:bg-white/20 border-white/30"
          >
            Remind Later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
