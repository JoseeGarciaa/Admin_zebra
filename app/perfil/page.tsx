"use client"

import { useEffect, useState, type CSSProperties } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SessionGuard } from "@/components/session-guard"
import type { AdminUser } from "@/lib/data"
import { getStoredAdminUser } from "@/lib/session"

export default function ProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null)

  useEffect(() => {
    setUser(getStoredAdminUser())
  }, [])

  return (
    <SessionGuard>
      <SidebarProvider
        style={{
          "--sidebar-width": "16rem",
          "--header-height": "3rem",
        } as CSSProperties}
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div>
                  <h1 className="text-3xl font-bold">Perfil</h1>
                  <p className="text-muted-foreground mt-1">
                    Información básica del usuario administrador conectado
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Datos del usuario</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                      <div>
                        <dt className="text-sm text-muted-foreground">Nombre completo</dt>
                        <dd className="text-lg font-semibold">{user?.nombre ?? "No disponible"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Correo electrónico</dt>
                        <dd className="text-lg font-semibold">{user?.correo ?? "No disponible"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Teléfono</dt>
                        <dd className="text-lg font-semibold">{user?.telefono ?? "No registrado"}</dd>
                      </div>
                      <div>
                        <dt className="text-sm text-muted-foreground">Rol</dt>
                        <dd className="text-lg font-semibold">{user?.rol === "admin" ? "Administrador" : "Soporte"}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionGuard>
  )
}
