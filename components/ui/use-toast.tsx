"use client"

import { useState } from "react"

export interface ToastProps {
  id: string
  title?: string
  description?: string
  action?: React.ReactNode
  variant?: "default" | "destructive"
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  const toast = ({ title, description, variant = "default" }: Omit<ToastProps, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastProps = { id, title, description, variant }
    
    setToasts((prev) => [...prev, newToast])
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  return {
    toast,
    toasts,
    dismiss: (id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }
  }
}