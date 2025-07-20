"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
  onClose: (id: string) => void
}

export function EnhancedToast({ id, title, description, type, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 100)

    // Auto dismiss
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose(id)
    }, 300)
  }

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-400" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-400" />
      case "info":
        return <Info className="h-5 w-5 text-blue-400" />
    }
  }

  const getStyles = () => {
    const baseStyles = "glass-card border-l-4"
    switch (type) {
      case "success":
        return `${baseStyles} border-l-green-400 bg-green-500/10`
      case "error":
        return `${baseStyles} border-l-red-400 bg-red-500/10`
      case "warning":
        return `${baseStyles} border-l-yellow-400 bg-yellow-500/10`
      case "info":
        return `${baseStyles} border-l-blue-400 bg-blue-500/10`
    }
  }

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-96 max-w-sm p-4 transition-all duration-300 ease-out pointer-events-auto",
        getStyles(),
        isVisible && !isLeaving ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
        isLeaving && "translate-x-full opacity-0",
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          {description && <p className="text-sm text-white/80 mt-1">{description}</p>}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white/60 hover:text-white/90 transition-colors pointer-events-auto cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 rounded-b-lg overflow-hidden">
        <div
          className={cn(
            "h-full transition-all ease-linear",
            type === "success" && "bg-green-400",
            type === "error" && "bg-red-400",
            type === "warning" && "bg-yellow-400",
            type === "info" && "bg-blue-400",
          )}
          style={{
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  )
}

// Toast Manager Component
interface Toast {
  id: string
  title: string
  description?: string
  type: "success" | "error" | "warning" | "info"
  duration?: number
}

export function ToastManager() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }

  // Expose addToast globally
  useEffect(() => {
    ;(window as any).showToast = addToast
  }, [])

  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
      {toasts.map((toast) => (
        <EnhancedToast key={toast.id} {...toast} onClose={removeToast} />
      ))}
    </div>
  )
}

// Helper function to show toasts
export const showToast = (toast: Omit<Toast, "id">) => {
  if (typeof window !== "undefined" && (window as any).showToast) {
    ;(window as any).showToast(toast)
  }
}
