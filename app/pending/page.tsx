"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, Mail, Phone, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function PendingPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role === "admin") {
      router.push("/admin/dashboard")
      return
    }

    if (user.role === "tailor" && user.status === "approved") {
      router.push("/tailor/dashboard")
      return
    }
  }, [user, router])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (!user) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="floating" />
      </div>

      <Card className="glass-card w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 p-3 rounded-full bg-yellow-500/20">
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
          <CardTitle className="text-2xl font-bold gradient-text">Account Pending</CardTitle>
          <CardDescription className="text-themed-muted">Your account is currently under review</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-left space-y-4">
            <div className="flex items-center gap-3 p-3 glass-card-dark rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-themed text-sm">Account created successfully</span>
            </div>

            <div className="flex items-center gap-3 p-3 glass-card-dark rounded-lg">
              <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <span className="text-themed text-sm">Waiting for admin approval</span>
            </div>

            <div className="flex items-center gap-3 p-3 glass-card-dark rounded-lg opacity-50">
              <CheckCircle className="h-5 w-5 text-themed-muted flex-shrink-0" />
              <span className="text-themed-muted text-sm">Access granted to dashboard</span>
            </div>
          </div>

          <div className="p-4 glass-card-dark rounded-lg">
            <h3 className="text-themed font-medium mb-2">What happens next?</h3>
            <p className="text-themed-muted text-sm">
              Our admin team will review your application within 24-48 hours. You'll receive an email notification once
              your account is approved.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-themed-muted text-sm">Need help? Contact us:</p>
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="theme-toggle-button bg-transparent"
                onClick={() => window.open("mailto:support@tailorcraft.com")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="theme-toggle-button bg-transparent"
                onClick={() => window.open("tel:+1234567890")}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
            </div>
          </div>

          <Button onClick={handleLogout} variant="outline" className="theme-toggle-button w-full bg-transparent">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
