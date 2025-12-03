"use client"

import { useEffect, useState, type CSSProperties, type FormEvent } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessionGuard } from "@/components/session-guard"
import type { AdminUser } from "@/lib/data"
import { getStoredAdminUser } from "@/lib/session"

export default function SettingsPage() {
  const [account, setAccount] = useState<AdminUser | null>(null)
  const [profileForm, setProfileForm] = useState({ nombre: "", telefono: "" })
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({ actual: "", nueva: "", confirmar: "" })
  const [passwordMessage, setPasswordMessage] = useState<{ type: "info" | "error"; text: string } | null>(null)

  useEffect(() => {
    const storedUser = getStoredAdminUser()
    setAccount(storedUser)
    setProfileForm({
      nombre: storedUser?.nombre ?? "",
      telefono: storedUser?.telefono ?? "",
    })
  }, [])

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessage("Muy pronto podrás actualizar tus datos desde aquí.")
    setAccount((prev) => (prev ? { ...prev, nombre: profileForm.nombre, telefono: profileForm.telefono } : prev))
  }

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (passwordForm.nueva.trim() === "" || passwordForm.confirmar.trim() === "") {
      setPasswordMessage({ type: "error", text: "Ingresa y confirma la nueva contraseña." })
      return
    }

    if (passwordForm.nueva !== passwordForm.confirmar) {
      setPasswordMessage({ type: "error", text: "La nueva contraseña y su confirmación no coinciden." })
      return
    }

    setPasswordMessage({ type: "info", text: "Esta opción estará disponible cuando se habilite el servicio de credenciales." })
    setPasswordForm({ actual: "", nueva: "", confirmar: "" })
  }

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
                  <h1 className="text-3xl font-bold">Configuración de Cuenta</h1>
                  <p className="text-muted-foreground mt-1">
                    Actualiza tus datos personales y gestiona tu contraseña cuando la integración esté lista.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Información personal</CardTitle>
                    <CardDescription>Modifica tu nombre y número de contacto asociados a esta cuenta.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-5" onSubmit={handleProfileSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre completo</Label>
                          <Input
                            id="nombre"
                            value={profileForm.nombre}
                            onChange={(event) => setProfileForm((prev) => ({ ...prev, nombre: event.target.value }))}
                            placeholder="Ej: María Rodríguez"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="correo">Correo electrónico</Label>
                          <Input id="correo" value={account?.correo ?? ""} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={profileForm.telefono}
                            onChange={(event) => setProfileForm((prev) => ({ ...prev, telefono: event.target.value }))}
                            placeholder="+57 300 000 0000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rol">Rol</Label>
                          <Input id="rol" value={account?.rol === "admin" ? "Administrador" : "Soporte"} disabled />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit">Guardar cambios</Button>
                      </div>
                      {profileMessage ? <p className="text-sm text-muted-foreground">{profileMessage}</p> : null}
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Actualizar contraseña</CardTitle>
                    <CardDescription>Define una nueva clave segura para tu cuenta cuando el servicio esté disponible.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-5" onSubmit={handlePasswordSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="contraseña-actual">Contraseña actual</Label>
                        <Input
                          id="contraseña-actual"
                          type="password"
                          value={passwordForm.actual}
                          onChange={(event) => setPasswordForm((prev) => ({ ...prev, actual: event.target.value }))}
                          placeholder="Ingresa tu contraseña actual"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nueva-contraseña">Nueva contraseña</Label>
                        <Input
                          id="nueva-contraseña"
                          type="password"
                          value={passwordForm.nueva}
                          onChange={(event) => setPasswordForm((prev) => ({ ...prev, nueva: event.target.value }))}
                          placeholder="Mínimo 8 caracteres"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmar-contraseña">Confirmar nueva contraseña</Label>
                        <Input
                          id="confirmar-contraseña"
                          type="password"
                          value={passwordForm.confirmar}
                          onChange={(event) =>
                            setPasswordForm((prev) => ({ ...prev, confirmar: event.target.value }))
                          }
                          placeholder="Repite la nueva contraseña"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit">Actualizar contraseña</Button>
                      </div>
                      {passwordMessage ? (
                        <p
                          className={`text-sm ${passwordMessage.type === "error" ? "text-red-600" : "text-muted-foreground"}`}
                        >
                          {passwordMessage.text}
                        </p>
                      ) : null}
                    </form>
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
