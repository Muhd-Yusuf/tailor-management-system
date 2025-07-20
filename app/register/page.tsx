"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Eye, EyeOff, User, Mail, Phone, Lock, UserPlus, Briefcase, Award } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { showToast } from "@/components/enhanced-toast"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    specialization: "",
    experience: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      showToast({
        type: "error",
        title: "Password Mismatch",
        description: "Passwords do not match",
      })
      return
    }

    if (formData.password.length < 6) {
      showToast({
        type: "error",
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          specialization: formData.specialization,
          experience: Number.parseInt(formData.experience),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        showToast({
          type: "success",
          title: "Registration Successful",
          description: "Your account has been created and is pending approval",
        })
        router.push("/pending")
      } else {
        showToast({
          type: "error",
          title: "Registration Failed",
          description: data.message || "An error occurred during registration",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Registration Failed",
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
          <CardTitle className="text-2xl font-bold gradient-text">Join TailorCraft Pro</CardTitle>
          <CardDescription className="text-themed-muted">Create your tailor account to get started</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-themed font-medium">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-themed font-medium">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-themed font-medium">
                Phone Number
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization" className="text-themed font-medium">
                Specialization
              </Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  id="specialization"
                  name="specialization"
                  type="text"
                  placeholder="e.g., Men's suits, Women's dresses"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="form-input pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience" className="text-themed font-medium">
                Years of Experience
              </Label>
              <div className="relative">
                <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  id="experience"
                  name="experience"
                  type="number"
                  placeholder="Enter years of experience"
                  value={formData.experience}
                  onChange={handleChange}
                  className="form-input pl-10"
                  min="0"
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-themed font-medium">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-themed-muted" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-themed-muted hover:text-themed transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="glow-button w-full">
              {loading ? <div className="loading-spinner w-4 h-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
              {loading ? "Creating Account..." : "Create Account"}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-themed-muted text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-500 hover:text-blue-600 font-medium transition-colors">
                Sign in here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
