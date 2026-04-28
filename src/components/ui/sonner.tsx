"use client"

import { useTheme } from "next-themes"
import { CheckCircle2, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        error: <AlertCircle className="h-5 w-5 text-red-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
        loading: <div className="h-5 w-5 border-2 border-gray-300 border-t-[#743181] rounded-full animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#1f2937",
          "--normal-border": "#e5e7eb",
          "--success-bg": "#dcfce7",
          "--success-text": "#166534",
          "--success-border": "#86efac",
          "--error-bg": "#fee2e2",
          "--error-text": "#991b1b",
          "--error-border": "#fca5a5",
          "--warning-bg": "#fef3c7",
          "--warning-text": "#92400e",
          "--warning-border": "#fcd34d",
          "--info-bg": "#dbeafe",
          "--info-text": "#0c2340",
          "--info-border": "#93c5fd",
        } as React.CSSProperties
      }
      richColors
      {...props}
    />
  )
}

export { Toaster }
