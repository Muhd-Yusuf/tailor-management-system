"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ThemeToggle } from "@/components/theme-toggle"
import { showToast } from "@/components/enhanced-toast"
import { WhatsAppContact } from "@/components/whatsapp-contact"
import { UserPlus, Sparkles, Eye, EyeOff, CheckCircle, Shield } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showContact, setShowContact] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showToast({
        type: "error",
        title: "🔒 Password Mismatch",
        description: "Please ensure both passwords match exactly",
        duration: 4000,
      })
      return
    }

    if (formData.password.length < 6) {
      showToast({
        type: "warning",
        title: "⚠️ Weak Password",
        description: "Password must be at least 6 characters long",
        duration: 4000,
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          gender: formData.gender,
        }),
      })

      if (response.ok) {
        showToast({
          type: "success",
          title: "🎉 Registration Successful!",
          description: "Your account has been created. Please contact admin for approval.",
          duration: 6000,
        })
        setShowContact(true)

        // Redirect to login with success parameter after showing contact info
        setTimeout(() => {
          router.push("/login?registered=true")
        }, 3000)
      } else {
        const error = await response.json()
        showToast({
          type: "error",
          title: "😞 Registration Failed",
          description: error.message || "Something went wrong. Please try again.",
          duration: 5000,
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "🌐 Network Error",
        description: "Please check your internet connection and try again",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  if (showContact) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center px-4 py-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-50">
          <ThemeToggle variant="header" />
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4 pulse-glow" />
            <h2 className="text-2xl font-bold text-themed gradient-text mb-2">Account Created!</h2>
            <p className="text-themed-muted">Complete your setup by contacting our admin</p>
          </div>
          <WhatsAppContact />
          <div className="mt-6 text-center">
            <Button onClick={() => router.push("/login?registered=true")} className="glow-button">
              Continue to Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg flex items-center justify-center px-4 py-8 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle variant="header" />
      </div>

      <div className="w-full max-w-md">
        <Card className="glass-card card-hover">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Sparkles className="h-16 w-16 text-purple-300 float-animation pulse-glow" />
                <Shield className="absolute -bottom-1 -right-1 h-6 w-6 text-green-400" />
              </div>
            </div>
            <CardTitle className="text-3xl text-themed gradient-text mb-2">Join TailorCraft Pro</CardTitle>
            <CardDescription className="text-themed-muted text-base">
              Create your professional tailor account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-themed font-medium">
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="form-input h-11 pointer-events-auto"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-themed font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="form-input h-11 pointer-events-auto"
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-themed font-medium">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="form-input h-11 pointer-events-auto"
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-themed font-medium">
                  Specialization
                </Label>
                <Select onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger className="form-input h-11 pointer-events-auto cursor-pointer">
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent className="glass-card-dark border-white/20 pointer-events-auto">
                    <SelectItem
                      value="female"
                      className="text-themed hover:bg-white/10 pointer-events-auto cursor-pointer"
                    >
                      👗 Female Tailoring
                    </SelectItem>
                    <SelectItem
                      value="male"
                      className="text-themed hover:bg-white/10 pointer-events-auto cursor-pointer"
                    >
                      👔 Male Tailoring
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-themed font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="form-input h-11 pr-12 pointer-events-auto"
                    placeholder="Create a secure password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-themed-muted hover:text-themed transition-colors pointer-events-auto cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-themed font-medium">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    className="form-input h-11 pr-12 pointer-events-auto"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-themed-muted hover:text-themed transition-colors pointer-events-auto cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5" />
                    <span>Create Professional Account</span>
                  </div>
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-themed-muted">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 text-blue-300 hover:text-blue-200 font-medium transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Sign In Here</span>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-themed-muted text-sm">🔐 Your information is secure and encrypted</p>
        </div>
      </div>
    </div>
  )
}
