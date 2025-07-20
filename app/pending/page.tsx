"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { WhatsAppContact } from "@/components/whatsapp-contact"
import { Clock, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"

export default function PendingPage() {
  const { logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg flex items-center justify-center px-4 py-8 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle variant="header" />
      </div>

      <div className="w-full max-w-lg space-y-6">
        <Card className="glass-card text-center card-hover">
          <CardHeader className="pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Clock className="h-20 w-20 text-yellow-300 pulse-glow float-animation" />
                <AlertCircle className="absolute -top-2 -right-2 h-8 w-8 text-orange-400" />
              </div>
            </div>
            <CardTitle className="text-3xl text-themed gradient-text mb-3">Account Under Review</CardTitle>
            <CardDescription className="text-themed-muted text-base leading-relaxed">
              Your professional tailor account is currently being reviewed by our admin team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="glass-card-dark p-6 rounded-xl border-l-4 border-l-yellow-400 bg-yellow-500/10">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-yellow-300 mt-1 flex-shrink-0" />
                <div className="text-left">
                  <h4 className="text-themed font-semibold mb-2">What happens next?</h4>
                  <ul className="text-themed-muted text-sm space-y-1">
                    <li>• Admin will review your application</li>
                    <li>• Payment confirmation will be processed</li>
                    <li>• You'll receive email notification when approved</li>
                    <li>• Full access will be granted immediately</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-center space-x-2 text-themed-muted">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm">Review process: 24-48 hours</span>
              </div>
              <p className="text-themed-muted text-sm">✨ Thank you for choosing TailorCraft Pro!</p>
            </div>

            <Button
              variant="outline"
              onClick={logout}
              className="w-full glass-card text-themed hover:bg-white/20 border-white/30 h-12 bg-transparent"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Contact Admin Card */}
        <WhatsAppContact />

        <div className="text-center">
          <p className="text-themed-muted text-xs">Need help? Contact our support team anytime</p>
        </div>
      </div>
    </div>
  )
}
