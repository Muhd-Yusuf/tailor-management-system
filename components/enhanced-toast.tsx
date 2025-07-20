"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Toast {
  id: string
  type: "success" | "error" | "info" | "warning"
  title: string
  description?: string
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }

    setToasts((prev) => [...prev, newToast])

    // Auto remove non-persistent toasts
    if (!toast.persistent && toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id)
      }, toast.duration || 5000)
    }
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleRemove = () => {
    setIsVisible(false)
    setTimeout(() => onRemove(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
      default:
        return null
    }
  }

  const getBackgroundColor = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800"
      case "error":
        return "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
      case "info":
        return "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
      default:
        return "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
    }
  }

  return (
    <div
      className={cn(
        "glass-card p-4 border rounded-lg shadow-lg transition-all duration-300 transform",
        getBackgroundColor(),
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      )}
    >
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{toast.title}</h4>
          {toast.description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{toast.description}</p>}
          {toast.action && (
            <button
              onClick={toast.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {toast.action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleRemove}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// Enhanced toast functions
export const toast = {
  success: (title: string, description?: string, options?: { persistent?: boolean; action?: Toast["action"] }) => {
    const { addToast } = useToast()
    addToast({
      type: "success",
      title,
      description,
      persistent: options?.persistent || false,
      action: options?.action,
    })
  },
  error: (title: string, description?: string, options?: { persistent?: boolean; action?: Toast["action"] }) => {
    const { addToast } = useToast()
    addToast({
      type: "error",
      title,
      description,
      persistent: options?.persistent || false,
      action: options?.action,
    })
  },
  info: (title: string, description?: string, options?: { persistent?: boolean; action?: Toast["action"] }) => {
    const { addToast } = useToast()
    addToast({
      type: "info",
      title,
      description,
      persistent: options?.persistent || false,
      action: options?.action,
    })
  },
  warning: (title: string, description?: string, options?: { persistent?: boolean; action?: Toast["action"] }) => {
    const { addToast } = useToast()
    addToast({
      type: "warning",
      title,
      description,
      persistent: options?.persistent || false,
      action: options?.action,
    })
  },
}

// Enhanced toast manager for account creation
export function ToastManager() {
  const { addToast } = useToast()

  const showAccountCreationSuccess = useCallback(
    (email: string) => {
      addToast({
        type: "success",
        title: "Account Created Successfully!",
        description: `Welcome! Your account has been created with email: ${email}. Please check your email for verification.`,
        persistent: true, // This makes it persist until manually dismissed
        action: {
          label: "Go to Login",
          onClick: () => {
            window.location.href = "/login"
          },
        },
      })
    },
    [addToast],
  )

  const showCollectionReminder = useCallback(
    (customerName: string, customerId: string) => {
      addToast({
        type: "info",
        title: "Collection Reminder",
        description: `${customerName} has items ready for collection.`,
        persistent: false,
        duration: 8000,
        action: {
          label: "View Details",
          onClick: () => {
            window.location.href = `/tailor/customer/${customerId}`
          },
        },
      })
    },
    [addToast],
  )

  const showPaymentReminder = useCallback(
    (customerName: string, amount: number, customerId: string) => {
      addToast({
        type: "warning",
        title: "Payment Due",
        description: `${customerName} has an outstanding payment of $${amount}.`,
        persistent: false,
        duration: 10000,
        action: {
          label: "View Customer",
          onClick: () => {
            window.location.href = `/tailor/customer/${customerId}`
          },
        },
      })
    },
    [addToast],
  )

  return {
    showAccountCreationSuccess,
    showCollectionReminder,
    showPaymentReminder,
  }
}

// Legacy support for existing toast usage
export function showToast(type: "success" | "error" | "info" | "warning", title: string, description?: string) {
  // This is a fallback for existing code that might use this pattern
  console.log(`Toast: ${type} - ${title}${description ? ` - ${description}` : ""}`)
}

export function showSuccessToast(title: string, description?: string) {
  showToast("success", title, description)
}

export function showErrorToast(title: string, description?: string) {
  showToast("error", title, description)
}
