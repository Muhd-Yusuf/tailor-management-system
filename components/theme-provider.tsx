"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

type Theme = "light" | "dark"

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
  mounted: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Get theme from localStorage or system preference
    try {
      const savedTheme = localStorage.getItem("theme") as Theme
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      const initialTheme = savedTheme || systemTheme

      setThemeState(initialTheme)

      // Apply theme immediately to prevent flash
      document.documentElement.classList.remove("light", "dark")
      document.documentElement.classList.add(initialTheme)
    } catch (error) {
      // Fallback for SSR or when localStorage is not available
      setThemeState("dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      try {
        // Apply theme to document
        document.documentElement.classList.remove("light", "dark")
        document.documentElement.classList.add(theme)

        // Save to localStorage
        localStorage.setItem("theme", theme)
      } catch (error) {
        // Ignore localStorage errors
        console.warn("Failed to save theme to localStorage:", error)
      }
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"))
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, mounted }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return default values for SSR/build time
    return {
      theme: "dark" as Theme,
      toggleTheme: () => {},
      setTheme: () => {},
      mounted: false,
    }
  }
  return context
}
