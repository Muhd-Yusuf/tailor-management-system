"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { Scissors, Users, ShieldCheck, Sparkles, Star, Zap } from "lucide-react"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        router.push("/login")
      } else if (user.role === "admin") {
        router.push("/admin/dashboard")
      } else if (user.role === "tailor" && user.status === "approved") {
        router.push("/tailor/dashboard")
      } else if (user.role === "tailor" && user.status === "pending") {
        router.push("/pending")
      }
    }
  }, [user, loading, router, mounted])

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Loading TailorCraft Pro...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle variant="floating" />
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="flex justify-center mb-8">
            <div className="relative">
              <Sparkles className="h-20 w-20 text-themed float-animation pulse-glow" />
              <Star className="absolute -top-2 -right-2 h-8 w-8 text-yellow-300 float-animation" />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-themed mb-6 gradient-text">TailorCraft Pro</h1>
          <p className="text-xl md:text-2xl text-themed-muted max-w-3xl mx-auto mb-8 leading-relaxed">
            The most advanced tailor management system with stunning design and powerful features
          </p>
          <div className="flex items-center justify-center space-x-2 text-themed-muted mb-8">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-lg">Modern • Intuitive • Professional</span>
            <Zap className="h-5 w-5 text-yellow-400" />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <Card className="glass-card text-center card-hover">
            <CardHeader className="pb-8">
              <div className="mx-auto mb-6 relative">
                <Scissors className="h-16 w-16 text-blue-300 float-animation" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-xl"></div>
              </div>
              <CardTitle className="text-themed text-xl mb-3">For Professional Tailors</CardTitle>
              <CardDescription className="text-themed-muted text-base leading-relaxed">
                Streamline your workflow with advanced customer management, measurement tracking, and order processing
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card text-center card-hover">
            <CardHeader className="pb-8">
              <div className="mx-auto mb-6 relative">
                <Users className="h-16 w-16 text-green-300 float-animation" />
                <div className="absolute inset-0 bg-green-400/20 rounded-full blur-xl"></div>
              </div>
              <CardTitle className="text-themed text-xl mb-3">Smart Customer Management</CardTitle>
              <CardDescription className="text-themed-muted text-base leading-relaxed">
                Store detailed customer profiles, measurements, payment status, and collection reminders in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="glass-card text-center card-hover">
            <CardHeader className="pb-8">
              <div className="mx-auto mb-6 relative">
                <ShieldCheck className="h-16 w-16 text-purple-300 float-animation" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-xl"></div>
              </div>
              <CardTitle className="text-themed text-xl mb-3">Admin Control Center</CardTitle>
              <CardDescription className="text-themed-muted text-base leading-relaxed">
                Comprehensive admin dashboard to approve tailors, monitor system usage, and manage the platform
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button className="glow-button text-lg px-8 py-4" size="lg" onClick={() => router.push("/login")}>
              <Sparkles className="h-5 w-5 mr-2" />
              Sign In to Your Account
            </Button>
            <Button
              className="glass-card text-themed hover:bg-white/20 bg-transparent border-white/30 text-lg px-8 py-4"
              size="lg"
              variant="outline"
              onClick={() => router.push("/register")}
            >
              <Users className="h-5 w-5 mr-2" />
              Join as Professional Tailor
            </Button>
          </div>

          <p className="text-themed-muted text-sm max-w-md mx-auto">
            ✨ Experience the future of tailor management with glassmorphism design and advanced features
          </p>
        </div>
      </div>
    </div>
  )
}
