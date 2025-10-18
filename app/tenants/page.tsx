"use client"

import type React from "react"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { TenantsTable, type Tenant } from "@/components/tenants-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

const mockTenants: Tenant[] = [
  {
    id: 1,
    nombre: "Empresa ABC S.A.S",
    nit: "900123456-1",
    email_contacto: "contacto@abc.com",
    telefono_contacto: "+57 300 111 2222",
    direccion: "Calle 100 #15-20, Bogotá",
    estado: "activo",
    fecha_creacion: "2025-01-10T08:00:00Z",
  },
  {
    id: 2,
    nombre: "Corporación XYZ Ltda",
    nit: "900654321-2",
    email_contacto: "info@xyz.com",
    telefono_contacto: "+57 301 222 3333",
    direccion: "Carrera 7 #32-16, Medellín",
    estado: "activo",
    fecha_creacion: "2025-02-15T10:30:00Z",
  },
  {
    id: 3,
    nombre: "Industrias DEF",
    nit: "900789012-3",
    email_contacto: "admin@def.com",
    telefono_contacto: "+57 302 333 4444",
    direccion: "Avenida 68 #45-67, Cali",
    estado: "inactivo",
    fecha_creacion: "2025-03-01T14:15:00Z",
  },
  {
    id: 4,
    nombre: "Servicios GHI",
    nit: "900456789-4",
    email_contacto: "contacto@ghi.com",
    telefono_contacto: "+57 303 444 5555",
    direccion: "Calle 50 #23-45, Barranquilla",
    estado: "suspendido",
    fecha_creacion: "2025-03-20T09:45:00Z",
  },
]

export default function TenantsPage() {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    email_contacto: "",
    telefono_contacto: "",
    direccion: "",
    contraseña: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Creating tenant:", formData)
    setShowForm(false)
    setFormData({
      nombre: "",
      nit: "",
      email_contacto: "",
      telefono_contacto: "",
      direccion: "",
      contraseña: "",
    })
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
                  <h1 className="text-3xl font-bold">Multitenants</h1>
                  <p className="text-muted-foreground mt-1">Gestión de empresas y organizaciones en la plataforma</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Tenant
                </Button>
              </div>

              {showForm && (
                <Card>
                  <CardHeader>
                    <CardTitle>Crear Nuevo Tenant</CardTitle>
                    <CardDescription>Complete los datos de la empresa u organización</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre de la empresa *</Label>
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            placeholder="Ej: Empresa ABC S.A.S"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nit">NIT *</Label>
                          <Input
                            id="nit"
                            value={formData.nit}
                            onChange={(e) => setFormData({ ...formData, nit: e.target.value })}
                            placeholder="900123456-1"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email_contacto">Email de contacto *</Label>
                          <Input
                            id="email_contacto"
                            type="email"
                            value={formData.email_contacto}
                            onChange={(e) => setFormData({ ...formData, email_contacto: e.target.value })}
                            placeholder="contacto@empresa.com"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono_contacto">Teléfono de contacto</Label>
                          <Input
                            id="telefono_contacto"
                            value={formData.telefono_contacto}
                            onChange={(e) => setFormData({ ...formData, telefono_contacto: e.target.value })}
                            placeholder="+57 300 123 4567"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="direccion">Dirección</Label>
                          <Input
                            id="direccion"
                            value={formData.direccion}
                            onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                            placeholder="Calle 123 #45-67, Ciudad"
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="contraseña">Contraseña inicial *</Label>
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
                          Crear Tenant
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Tenants</CardTitle>
                  <CardDescription>Administre las empresas registradas en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <TenantsTable data={mockTenants} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
