"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ThemeToggle } from "@/components/theme-toggle"
import { showToast } from "@/components/enhanced-toast"
import { Users, UserCheck, UserX, LogOut, Shield, TrendingUp, Activity } from "lucide-react"

interface Tailor {
  _id: string
  name: string
  email: string
  phone: string
  gender: string
  status: "pending" | "approved" | "rejected"
  createdAt: string
}

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth()
  const router = useRouter()
  const [tailors, setTailors] = useState<Tailor[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/login")
      return
    }
    if (user?.role === "admin") {
      fetchTailors()
    }
  }, [user, loading, router])

  const fetchTailors = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/tailors", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setTailors(data)

        // Calculate stats
        const total = data.length
        const pending = data.filter((t: Tailor) => t.status === "pending").length
        const approved = data.filter((t: Tailor) => t.status === "approved").length
        const rejected = data.filter((t: Tailor) => t.status === "rejected").length

        setStats({ total, pending, approved, rejected })
      }
    } catch (error) {
      console.error("Failed to fetch tailors:", error)
      showToast({
        type: "error",
        title: "🌐 Connection Error",
        description: "Failed to load tailor data. Please refresh the page.",
        duration: 5000,
      })
    }
  }

  const updateTailorStatus = async (tailorId: string, status: "approved" | "rejected") => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/tailors/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tailorId, status }),
      })

      if (response.ok) {
        showToast({
          type: "success",
          title: `✅ Tailor ${status === "approved" ? "Approved" : "Rejected"}`,
          description: `The tailor account has been ${status} successfully`,
          duration: 4000,
        })
        fetchTailors()
      } else {
        showToast({
          type: "error",
          title: "❌ Update Failed",
          description: "Failed to update tailor status. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "🌐 Network Error",
        description: "Please check your connection and try again",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="status-paid text-white font-medium">✅ Approved</Badge>
      case "pending":
        return <Badge className="status-pending text-white font-medium">⏳ Pending</Badge>
      case "rejected":
        return <Badge className="status-overdue text-white font-medium">❌ Rejected</Badge>
      default:
        return <Badge className="status-pending text-white font-medium">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen modern-bg flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-themed-muted text-lg">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen modern-bg">
      {/* Header */}
      <div className="glass-card-dark shadow-lg border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-themed gradient-text flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-300" />
                <span>Admin Control Center</span>
              </h1>
              <p className="text-themed-muted text-sm mt-1">Manage tailor applications and system overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle variant="header" size="sm" />
              <div className="text-right">
                <p className="text-sm text-themed-muted">System Administrator</p>
                <p className="font-semibold text-themed">{user?.name}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="glass-card text-themed hover:bg-white/20 border-white/30 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Total Tailors</CardTitle>
              <Users className="h-5 w-5 text-blue-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-themed mb-1">{stats.total}</div>
              <p className="text-xs text-themed-muted">Registered accounts</p>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Pending Approval</CardTitle>
              <Activity className="h-5 w-5 text-yellow-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-300 mb-1">{stats.pending}</div>
              <p className="text-xs text-themed-muted">Awaiting review</p>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Approved</CardTitle>
              <UserCheck className="h-5 w-5 text-green-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-300 mb-1">{stats.approved}</div>
              <p className="text-xs text-themed-muted">Active tailors</p>
            </CardContent>
          </Card>

          <Card className="glass-card card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-themed">Rejected</CardTitle>
              <UserX className="h-5 w-5 text-red-300" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-300 mb-1">{stats.rejected}</div>
              <p className="text-xs text-themed-muted">Declined applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Tailors Management Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-themed gradient-text text-xl flex items-center space-x-2">
              <TrendingUp className="h-6 w-6" />
              <span>Tailor Management</span>
            </CardTitle>
            <CardDescription className="text-themed-muted">
              Review and manage tailor applications ({tailors.length} total applications)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {tailors.length > 0 ? (
              <div className="overflow-x-auto modern-table">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead className="text-themed font-semibold">Tailor Details</TableHead>
                      <TableHead className="text-themed font-semibold">Contact Info</TableHead>
                      <TableHead className="text-themed font-semibold">Specialization</TableHead>
                      <TableHead className="text-themed font-semibold">Status</TableHead>
                      <TableHead className="text-themed font-semibold">Registration Date</TableHead>
                      <TableHead className="text-themed font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tailors.map((tailor) => (
                      <TableRow key={tailor._id} className="border-white/10 table-row">
                        <TableCell className="font-medium text-themed">
                          <div>
                            <div className="font-semibold text-base">{tailor.name}</div>
                            <div className="text-themed-muted text-sm">{tailor.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-themed-muted">
                          <div className="text-sm">
                            <div>{tailor.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-themed-muted">
                          <Badge className="glass-card text-themed border-white/30">
                            {tailor.gender === "female" ? "👗 Female" : "👔 Male"} Tailoring
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(tailor.status)}</TableCell>
                        <TableCell className="text-themed-muted">
                          {new Date(tailor.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {tailor.status === "pending" ? (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => updateTailorStatus(tailor._id, "approved")}
                                className="glow-button text-xs"
                              >
                                ✅ Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateTailorStatus(tailor._id, "rejected")}
                                className="glass-card text-themed hover:bg-red-500/20 border-red-400/30 text-xs"
                              >
                                ❌ Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-themed-muted text-sm">No actions available</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-themed-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-themed mb-2">No Tailor Applications</h3>
                <p className="text-themed-muted">
                  No tailor applications have been submitted yet. Check back later for new registrations.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
