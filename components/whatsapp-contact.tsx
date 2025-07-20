"use client"

import type { ReactNode } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface WhatsAppContactProps {
  phone: string
  message?: string
  children?: ReactNode
  className?: string
}

export function WhatsAppContact({ phone, message, children, className }: WhatsAppContactProps) {
  const handleWhatsAppClick = () => {
    // Clean phone number (remove any non-digit characters except +)
    const cleanPhone = phone.replace(/[^\d+]/g, "")

    // Encode the message for URL
    const encodedMessage = message ? encodeURIComponent(message) : ""

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${cleanPhone}${encodedMessage ? `?text=${encodedMessage}` : ""}`

    // Open in new tab
    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <Button onClick={handleWhatsAppClick} className={`whatsapp-button ${className || ""}`} size="sm" type="button">
      {children || (
        <>
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </>
      )}
    </Button>
  )
}
