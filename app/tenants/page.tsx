"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { TenantsTable, type Tenant } from "@/components/tenants-table"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"

export default function TenantsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    nit: "",
    email_contacto: "",
    telefono_contacto: "",
    direccion: "",
    contraseña: "",
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function loadTenants() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/tenants", { signal: controller.signal })

        if (!response.ok) {
          throw new Error("No se pudo cargar la lista de tenants")
        }

        const data: Tenant[] = await response.json()
        setTenants(data)
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return
        }

        console.error(err)
        setError("Error al cargar los tenants")
      } finally {
        setLoading(false)
      }
    }

    void loadTenants()

    return () => controller.abort()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const payload = {
        nombre: formData.nombre,
        nit: formData.nit.trim() === "" ? null : formData.nit,
        email_contacto: formData.email_contacto,
        telefono_contacto: formData.telefono_contacto.trim() === "" ? null : formData.telefono_contacto,
        direccion: formData.direccion.trim() === "" ? null : formData.direccion,
        contraseña: formData.contraseña,
      }

      const response = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => ({ error: "No se pudo crear el tenant" }))
        throw new Error(payload.error ?? "No se pudo crear el tenant")
      }

      const created: Tenant = await response.json()
      setTenants((prev) => [created, ...prev])
      setShowForm(false)
      setFormData({
        nombre: "",
        nit: "",
        email_contacto: "",
        telefono_contacto: "",
        direccion: "",
        contraseña: "",
      })
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSubmitting(false)
    }
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
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={submitting}>
                          Crear Tenant
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Card>
                <CardHeader>
                  <CardTitle>Lista de Tenants</CardTitle>
                  <CardDescription>Administre las empresas registradas en la plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <TenantsTable data={tenants} loading={loading} />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
