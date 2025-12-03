"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getStoredAdminUser } from "@/lib/session"

interface SessionGuardProps {
  children: ReactNode
}

export function SessionGuard({ children }: SessionGuardProps) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const user = getStoredAdminUser()

    if (!user) {
      router.replace("/login")
      return
    }

    setReady(true)
  }, [router])

  if (!ready) {
    return null
  }

  return <>{children}</>
}
