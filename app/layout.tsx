import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { ToastManager } from "@/components/enhanced-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TailorCraft Pro - Modern Tailor Management System",
  description: "Professional tailor management system with modern design for customer measurements and orders",
  generator: "v0.dev",
}

// Inline script to prevent theme flash
const themeScript = `
  (function() {
    try {
      const theme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      document.documentElement.classList.add(theme);
      document.documentElement.setAttribute('data-theme', theme);
    } catch (e) {
      document.documentElement.classList.add('dark');
    }
  })();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <ToastManager />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
