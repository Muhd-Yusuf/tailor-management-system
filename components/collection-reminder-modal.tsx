"use client"

import { useState } from "react"
import { X, Calendar, Clock, User, Phone, MessageCircle, AlertTriangle, CheckCircle, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { WhatsAppContact } from "./whatsapp-contact"

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

interface CollectionReminderModalProps {
  isOpen: boolean
  onClose: () => void
  overdueCustomers: Customer[]
  readyCustomers: Customer[]
}

export function CollectionReminderModal({
  isOpen,
  onClose,
  overdueCustomers,
  readyCustomers,
}: CollectionReminderModalProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysOverdue = (deliveryDate: string) => {
    const today = new Date()
    const delivery = new Date(deliveryDate)
    return Math.ceil((today.getTime() - delivery.getTime()) / (1000 * 3600 * 24))
  }

  const getPaymentStatus = (customer: Customer) => {
    const remaining = customer.totalAmount - customer.paidAmount
    if (remaining <= 0) return "paid"
    if (customer.paidAmount > 0) return "partial"
    return "pending"
  }

  const CustomerCard = ({ customer, isOverdue }: { customer: Customer; isOverdue: boolean }) => (
    <Card className="glass-card mb-4 card-hover">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-themed-muted" />
              <h3 className="font-semibold text-themed">{customer.name}</h3>
              {isOverdue ? (
                <Badge className="status-overdue">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {getDaysOverdue(customer.deliveryDate)} days overdue
                </Badge>
              ) : (
                <Badge className="status-pending">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-sm text-themed-muted">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>Delivery: {formatDate(customer.deliveryDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                <span>Ordered: {formatDate(customer.orderDate)}</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm">
                <span className="text-themed-muted">Payment: </span>
                <Badge
                  className={
                    getPaymentStatus(customer) === "paid"
                      ? "status-paid"
                      : getPaymentStatus(customer) === "partial"
                        ? "status-pending"
                        : "status-overdue"
                  }
                >
                  ${customer.paidAmount} / ${customer.totalAmount}
                </Badge>
              </div>
              <WhatsAppContact
                phone={customer.phone}
                message={`Hi ${customer.name}, your order is ready for collection. Please visit us at your convenience.`}
                className="whatsapp-button text-xs px-3 py-1"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                WhatsApp
              </WhatsAppContact>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="modal-backdrop absolute inset-0" onClick={onClose} />
      <Card className="glass-card relative w-full max-w-2xl max-h-[80vh] overflow-hidden m-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-xl font-bold text-themed flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Collection Reminders
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-white/20">
            <X className="h-4 w-4 text-themed" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh]">
          {overdueCustomers.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h2 className="text-lg font-semibold text-themed">Overdue Collections ({overdueCustomers.length})</h2>
              </div>
              {overdueCustomers.map((customer) => (
                <CustomerCard key={customer._id} customer={customer} isOverdue={true} />
              ))}
            </div>
          )}

          {readyCustomers.length > 0 && (
            <div>
              {overdueCustomers.length > 0 && <Separator className="my-6" />}
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <h2 className="text-lg font-semibold text-themed">Ready for Collection ({readyCustomers.length})</h2>
              </div>
              {readyCustomers.map((customer) => (
                <CustomerCard key={customer._id} customer={customer} isOverdue={false} />
              ))}
            </div>
          )}

          {overdueCustomers.length === 0 && readyCustomers.length === 0 && (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-themed mb-2">All Caught Up!</h3>
              <p className="text-themed-muted">No pending collections at the moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
