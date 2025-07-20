"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastData {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  persistent?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastProps extends ToastData {
  onClose: (id: string) => void
}

function Toast({ id, title, description, type, duration = 5000, persistent = false, action, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!persistent && duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, persistent])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getStyles = () => {
    const baseStyles = "glass-card border-l-4"
    switch (type) {
      case "success":
        return `${baseStyles} border-l-green-500 bg-green-50/90 dark:bg-green-900/20`
      case "error":
        return `${baseStyles} border-l-red-500 bg-red-50/90 dark:bg-red-900/20`
      case "warning":
        return `${baseStyles} border-l-yellow-500 bg-yellow-50/90 dark:bg-yellow-900/20`
      case "info":
        return `${baseStyles} border-l-blue-500 bg-blue-50/90 dark:bg-blue-900/20`
    }
  }

  return (
    <div
      className={cn(
        "w-96 max-w-sm p-4 transition-all duration-300 ease-out rounded-lg shadow-lg",
        getStyles(),
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0",
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
          {description && <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{description}</p>}
          {action && (
            <button
              onClick={() => {
                action.onClick()
                handleClose()
              }}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function ToastManager() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  const addToast = (toast: Omit<ToastData, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Expose addToast globally for use in other components
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).showToast = addToast
    }
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  )
}

// Helper functions for showing toasts
export function showToast(
  type: "success" | "error" | "warning" | "info",
  title: string,
  description?: string,
  options?: {
    duration?: number
    persistent?: boolean
    action?: {
      label: string
      onClick: () => void
    }
  },
) {
  if (typeof window !== "undefined" && (window as any).showToast) {
    ;(window as any).showToast({
      type,
      title,
      description,
      duration: options?.duration,
      persistent: options?.persistent,
      action: options?.action,
    })
  }
}

export function showSuccessToast(title: string, description?: string, persistent = false) {
  showToast("success", title, description, { persistent })
}

export function showErrorToast(title: string, description?: string) {
  showToast("error", title, description)
}

export function showWarningToast(title: string, description?: string) {
  showToast("warning", title, description)
}

export function showInfoToast(title: string, description?: string) {
  showToast("info", title, description)
}

// Enhanced toast for account creation
export function showAccountCreationToast(email: string) {
  showToast(
    "success",
    "🎉 Account Created Successfully!",
    `Welcome! Your account has been created with email: ${email}. Please check your email for verification.`,
    {
      persistent: true,
      action: {
        label: "Go to Login",
        onClick: () => {
          window.location.href = "/login"
        },
      },
    },
  )
}

// Enhanced toast for collection reminders
export function showCollectionReminderToast(customerName: string, customerId: string) {
  showToast("info", "📅 Collection Reminder", `${customerName} has items ready for collection.`, {
    duration: 8000,
    action: {
      label: "View Details",
      onClick: () => {
        window.location.href = `/tailor/customer/${customerId}`
      },
    },
  })
}
