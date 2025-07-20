"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, LogOut, Mail, Phone, CheckCircle, XCircle, Clock } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { showToast } from "@/components/enhanced-toast"

interface Tailor {
  _id: string
  name: string
  email: string
  phone: string
  specialization: string
  experience: number
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export default function AdminDashboard() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [tailors, setTailors] = useState<Tailor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user || user.role !== "admin") {
      router.push("/login")
      return
    }
    fetchTailors()
  }, [user, router])

  const fetchTailors = async () => {
    try {
      const response = await fetch("/api/admin/tailors", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTailors(data)
      } else {
        showToast({
          type: "error",
          title: "Error",
          description: "Failed to fetch tailors",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: "Failed to fetch tailors",
      })
    } finally {
      setLoading(false)
    }
  }

  const updateTailorStatus = async (tailorId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch("/api/admin/tailors/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ tailorId, status }),
      })

      if (response.ok) {
        setTailors((prev) => prev.map((tailor) => (tailor._id === tailorId ? { ...tailor, status } : tailor)))
        showToast({
          type: "success",
          title: "Success",
          description: `Tailor ${status} successfully`,
        })
      } else {
        showToast({
          type: "error",
          title: "Error",
          description: `Failed to ${status} tailor`,
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: `Failed to ${status} tailor`,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="status-pending">Pending</Badge>
      case "approved":
        return <Badge className="status-paid">Approved</Badge>
      case "rejected":
        return <Badge className="status-overdue">Rejected</Badge>
      default:
        return <Badge className="status-pending">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const stats = {
    total: tailors.length,
    pending: tailors.filter((t) => t.status === "pending").length,
    approved: tailors.filter((t) => t.status === "approved").length,
    rejected: tailors.filter((t) => t.status === "rejected").length,
  }

  if (loading) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg">
      {/* Header */}
      <div className="glass-card m-4 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-themed-muted mt-1">Manage tailors and system settings</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="header" />
            <Button onClick={handleLogout} variant="outline" className="theme-toggle-button bg-transparent">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mx-4 mb-6">
        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-themed-muted text-sm font-medium">Total Tailors</p>
                <p className="text-2xl font-bold text-themed">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-themed-muted text-sm font-medium">Pending Approval</p>
                <p className="text-2xl font-bold text-themed">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-themed-muted text-sm font-medium">Approved</p>
                <p className="text-2xl font-bold text-themed">{stats.approved}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card card-hover">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-themed-muted text-sm font-medium">Rejected</p>
                <p className="text-2xl font-bold text-themed">{stats.rejected}</p>
              </div>
              <UserX className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tailors Management */}
      <div className="mx-4 mb-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-themed flex items-center gap-2">
              <Users className="h-5 w-5" />
              Tailor Management
            </CardTitle>
          </CardHeader>

          <CardContent>
            {tailors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-themed-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-themed mb-2">No tailors registered</h3>
                <p className="text-themed-muted">Tailors will appear here once they register</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tailors.map((tailor) => (
                  <Card key={tailor._id} className="glass-card-dark table-row">
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-themed">{tailor.name}</h3>
                              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-themed-muted">
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {tailor.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {tailor.phone}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(tailor.status)}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-themed-muted">Specialization:</span>
                              <p className="text-themed font-medium">{tailor.specialization}</p>
                            </div>
                            <div>
                              <span className="text-themed-muted">Experience:</span>
                              <p className="text-themed font-medium">{tailor.experience} years</p>
                            </div>
                            <div>
                              <span className="text-themed-muted">Registered:</span>
                              <p className="text-themed font-medium">{formatDate(tailor.createdAt)}</p>
                            </div>
                          </div>
                        </div>

                        {tailor.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateTailorStatus(tailor._id, "approved")}
                              size="sm"
                              className="glow-button"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateTailorStatus(tailor._id, "rejected")}
                              variant="outline"
                              size="sm"
                              className="theme-toggle-button"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
