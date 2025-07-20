"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { showToast } from "@/components/enhanced-toast"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        login(data.user, data.token)
        showToast({
          type: "success",
          title: "Login Successful",
          description: `Welcome back, ${data.user.name}!`,
        })

        // Redirect based on user role
        if (data.user.role === "admin") {
          router.push("/admin/dashboard")
        } else if (data.user.role === "tailor") {
          if (data.user.status === "approved") {
            router.push("/tailor/dashboard")
          } else {
            router.push("/pending")
          }
        }
      } else {
        showToast({
          type: "error",
          title: "Login Failed",
          description: data.message || "Invalid credentials",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Login Failed",
        description: "An error occurred. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen modern-bg flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle variant="floating" />
      </div>

      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold gradient-text">Welcome Back</CardTitle>
          <CardDescription className="text-themed-muted">Sign in to your TailorCraft Pro account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-themed font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-themed font-medium">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-themed-muted hover:text-themed transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="glow-button w-full">
              {loading ? <div className="loading-spinner w-4 h-4 mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-themed-muted text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 glass-card-dark rounded-lg">
            <h3 className="text-themed font-medium mb-2">Demo Accounts:</h3>
            <div className="space-y-2 text-sm text-themed-muted">
              <div>
                <strong className="text-themed">Admin:</strong> admin@tailorcraft.com / admin123
              </div>
              <div>
                <strong className="text-themed">Tailor:</strong> tailor@example.com / tailor123
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
