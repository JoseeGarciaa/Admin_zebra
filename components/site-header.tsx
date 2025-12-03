"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Search } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import type { AdminUser } from "@/lib/data"
import { clearStoredAdminUser, getStoredAdminUser } from "@/lib/session"

export function SiteHeader() {
  const router = useRouter()
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    const storedUser = getStoredAdminUser()
    setAdminUser(storedUser)
  }, [])

  const initials = useMemo(() => {
    if (!adminUser?.nombre) {
      return "AD"
    }

    return adminUser.nombre
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("")
  }, [adminUser])

  const handleProfile = useCallback(() => {
    router.push("/perfil")
  }, [router])

  const handleSettings = useCallback(() => {
    router.push("/configuracion")
  }, [router])

  const handleLogout = useCallback(() => {
    clearStoredAdminUser()
    setAdminUser(null)
    router.push("/login")
  }, [router])

  return (
    <header className="sticky top-0 z-10 flex h-12 items-center gap-4 border-b bg-background px-4 lg:px-6">
      <SidebarTrigger />
      <div className="flex flex-1 items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input type="search" placeholder="Buscar..." className="w-full pl-8" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          <span className="absolute right-1 top-1 size-2 rounded-full bg-red-600" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-emerald-600 text-white text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{adminUser?.nombre ?? "Mi Cuenta"}</span>
                {adminUser?.correo ? (
                  <span className="text-xs text-muted-foreground">{adminUser.correo}</span>
                ) : null}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleProfile}>Perfil</DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSettings}>Configuración</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleLogout}>Cerrar Sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
