"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"

interface ThemeToggleProps {
  variant?: "default" | "header" | "floating"
  size?: "sm" | "md" | "lg"
}

export function ThemeToggle({ variant = "default", size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme()

  const getButtonClasses = () => {
    const baseClasses = "theme-toggle-button transition-all duration-300 ease-in-out"

    switch (variant) {
      case "header":
        return `${baseClasses} glass-card text-themed hover:bg-white/20 border-white/30 bg-transparent`
      case "floating":
        return `${baseClasses} fixed bottom-6 right-6 z-50 rounded-full shadow-lg glow-button`
      default:
        return `${baseClasses} glass-card hover:bg-white/20 border-white/30`
    }
  }

  const getSize = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8"
      case "lg":
        return "h-12 w-12"
      default:
        return "h-10 w-10"
    }
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`${getButtonClasses()} ${getSize()}`}
      title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      disabled={!mounted}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            theme === "light" && mounted ? "rotate-0 scale-100 opacity-100" : "rotate-90 scale-0 opacity-0"
          }`}
        />
        <Moon
          className={`absolute inset-0 h-5 w-5 transition-all duration-300 ${
            theme === "dark" && mounted ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
