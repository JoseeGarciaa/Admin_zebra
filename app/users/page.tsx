"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { UsersTable, type User } from "@/components/users-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SessionGuard } from "@/components/session-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export default function UsersPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    contraseña: "",
    rol: "soporte" as "admin" | "soporte",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadUsers() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/admin-users", { signal: controller.signal })

        if (!response.ok) {
          throw new Error("No se pudo cargar la lista de usuarios")
        }

        const data: User[] = await response.json()
        setUsers(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return
        }

        console.error(err)
        setError("Error al cargar los usuarios")
      } finally {
        setLoading(false)
      }
    }

    void loadUsers()

    return () => controller.abort()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        nombre: formData.nombre,
        correo: formData.correo,
        telefono: formData.telefono.trim() === "" ? null : formData.telefono,
        contraseña: formData.contraseña,
        rol: formData.rol,
      }

      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "No se pudo crear el usuario" }))
        throw new Error(payload.error ?? "No se pudo crear el usuario")
      }

      const created: User = await response.json()
      setUsers((prev) => [created, ...prev])
      setShowForm(false)
      setFormData({ nombre: "", correo: "", telefono: "", contraseña: "", rol: "soporte" })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <SessionGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "16rem",
            "--header-height": "3rem",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold">Usuarios Administrativos</h1>
                    <p className="text-muted-foreground mt-1">
                      Gestión de usuarios con acceso al panel de administración
                    </p>
                  </div>
                  <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Nuevo Usuario
                  </Button>
                </div>

                {showForm && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Crear Nuevo Usuario</CardTitle>
                      <CardDescription>Complete los datos del usuario administrativo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre completo *</Label>
                            <Input
                              id="nombre"
                              value={formData.nombre}
                              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                              placeholder="Ej: Juan Pérez"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="correo">Correo electrónico *</Label>
                            <Input
                              id="correo"
                              type="email"
                              value={formData.correo}
                              onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                              placeholder="usuario@ejemplo.com"
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefono">Teléfono</Label>
                            <Input
                              id="telefono"
                              value={formData.telefono}
                              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                              placeholder="+57 300 123 4567"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="rol">Rol *</Label>
                            <Select
                              value={formData.rol}
                              onValueChange={(value: "admin" | "soporte") => setFormData({ ...formData, rol: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="soporte">Soporte</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="contraseña">Contraseña *</Label>
                            <Input
                              id="contraseña"
                              type="password"
                              value={formData.contraseña}
                              onChange={(e) => setFormData({ ...formData, contraseña: e.target.value })}
                              placeholder="Mínimo 8 caracteres"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                            Cancelar
                          </Button>
                          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                            Crear Usuario
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Card>
                  <CardHeader>
                    <CardTitle>Lista de Usuarios</CardTitle>
                    <CardDescription>Administre los usuarios con acceso a la plataforma</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UsersTable data={users} loading={loading} />
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
