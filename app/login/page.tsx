"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { showToast } from "@/components/enhanced-toast"
import { Eye, EyeOff, LogIn, Sparkles, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { login } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      // Check if user just registered
      if (searchParams.get("registered") === "true") {
        showToast({
          type: "success",
          title: "🎉 Account Created Successfully!",
          description: "Please contact admin via WhatsApp for payment confirmation and account approval.",
          duration: 8000,
        })
      }
    }
  }, [searchParams, mounted])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const success = await login(email, password)

    if (success) {
      showToast({
        type: "success",
        title: "🎉 Welcome Back!",
        description: "Successfully signed in to your account",
        duration: 3000,
      })
      router.push("/")
    } else {
      showToast({
        type: "error",
        title: "🚫 Sign In Failed",
        description: "Invalid credentials or account not approved yet",
        duration: 5000,
      })
    }

    setLoading(false)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg flex items-center justify-center px-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle variant="header" />
      </div>

      <div className="w-full max-w-md">
        <Card className="glass-card card-hover">
          <CardHeader className="text-center pb-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-blue-300 float-animation pulse-glow" />
                <CheckCircle className="absolute -bottom-1 -right-1 h-6 w-6 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl text-themed gradient-text mb-2">Welcome Back</CardTitle>
            <CardDescription className="text-themed-muted text-base">
              Sign in to access your TailorCraft Pro account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-themed font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input h-12 text-base pointer-events-auto"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-themed font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-input h-12 text-base pr-12 pointer-events-auto"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-themed-muted hover:text-themed transition-colors pointer-events-auto cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full glow-button h-12 text-base font-semibold pointer-events-auto cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="loading-spinner h-5 w-5"></div>
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="h-5 w-5" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-themed-muted">New to TailorCraft Pro?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center space-x-2 text-blue-300 hover:text-blue-200 font-medium transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                <span>Create Professional Account</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-themed-muted text-sm">🔒 Your data is secure and encrypted</p>
        </div>
      </div>
    </div>
  )
}
