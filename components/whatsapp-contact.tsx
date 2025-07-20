"use client"

import { MessageCircle, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function WhatsAppContact() {
  const phoneNumber = "09164607688"
  const whatsappMessage = encodeURIComponent(
    "Hello! I just created my tailor account and would like to complete the payment process for account approval. Please guide me through the next steps.",
  )

  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/234${phoneNumber.slice(1)}?text=${whatsappMessage}`, "_blank")
  }

  const handlePhoneClick = () => {
    window.open(`tel:+234${phoneNumber.slice(1)}`, "_blank")
  }

  return (
    <Card className="glass-card card-hover border-green-400/30 bg-green-500/10">
      <CardHeader className="text-center">
        <CardTitle className="text-white gradient-text flex items-center justify-center space-x-2">
          <MessageCircle className="h-5 w-5 text-green-400" />
          <span>Contact Admin</span>
        </CardTitle>
        <CardDescription className="text-white/80">Complete your account setup by contacting our admin</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-white/90 text-sm">
          <p className="mb-2">
            📱 Admin Contact: <span className="font-semibold">{phoneNumber}</span>
          </p>
          <p className="text-white/70 text-xs">Contact us to complete payment and activate your account</p>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleWhatsAppClick}
            className="flex-1 whatsapp-button text-white font-semibold pointer-events-auto cursor-pointer"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>

          <Button
            onClick={handlePhoneClick}
            variant="outline"
            className="flex-1 glass-card text-white hover:bg-white/20 border-white/30 bg-transparent pointer-events-auto cursor-pointer"
          >
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-white/60">
            💡 Tip: Screenshot your registration confirmation for faster processing
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
