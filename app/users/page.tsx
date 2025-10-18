"use client"

import type React from "react"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { UsersTable, type User } from "@/components/users-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

const mockUsers: User[] = [
  {
    id: 1,
    nombre: "Admin Principal",
    correo: "admin@platform.com",
    telefono: "+57 300 123 4567",
    rol: "admin",
    activo: true,
    fecha_creacion: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    nombre: "Soporte Técnico",
    correo: "soporte@platform.com",
    telefono: "+57 301 234 5678",
    rol: "soporte",
    activo: true,
    fecha_creacion: "2025-02-01T14:30:00Z",
  },
  {
    id: 3,
    nombre: "Juan Pérez",
    correo: "juan@platform.com",
    telefono: "+57 302 345 6789",
    rol: "soporte",
    activo: false,
    fecha_creacion: "2025-03-10T09:15:00Z",
  },
  {
    id: 4,
    nombre: "María García",
    correo: "maria@platform.com",
    telefono: "+57 303 456 7890",
    rol: "admin",
    activo: true,
    fecha_creacion: "2025-03-15T11:20:00Z",
  },
]

export default function UsersPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    telefono: "",
    contraseña: "",
    rol: "soporte" as "admin" | "soporte",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating user:", formData)
    setShowForm(false)
    setFormData({ nombre: "", correo: "", telefono: "", contraseña: "", rol: "soporte" })
  }

  return (
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
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                          Crear Usuario
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Usuarios</CardTitle>
                  <CardDescription>Administre los usuarios con acceso a la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <UsersTable data={mockUsers} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
