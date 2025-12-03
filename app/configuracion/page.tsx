"use client"

import { useState, type CSSProperties, type FormEvent } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SessionGuard } from "@/components/session-guard"

export default function SettingsPage() {
  const [formState, setFormState] = useState({
    companyName: "",
    supportEmail: "",
    contactPhone: "",
  })

  const handleChange = (field: "companyName" | "supportEmail" | "contactPhone", value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // TODO: Wire this to backend settings endpoint once available.
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
                  <h1 className="text-3xl font-bold">Configuración</h1>
                  <p className="text-muted-foreground mt-1">
                    Ajusta la información general de la plataforma. Proximamente podrás gestionar más opciones desde aquí.
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Datos Generales</CardTitle>
                    <CardDescription>Formulario de ejemplo a la espera de integración real.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-5" onSubmit={handleSubmit}>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Nombre de la plataforma</Label>
                        <Input
                          id="companyName"
                          value={formState.companyName}
                          onChange={(event) => handleChange("companyName", event.target.value)}
                          placeholder="Plataforma Zebra"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="supportEmail">Correo de soporte</Label>
                        <Input
                          id="supportEmail"
                          type="email"
                          value={formState.supportEmail}
                          onChange={(event) => handleChange("supportEmail", event.target.value)}
                          placeholder="soporte@tuempresa.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Teléfono de contacto</Label>
                        <Input
                          id="contactPhone"
                          value={formState.contactPhone}
                          onChange={(event) => handleChange("contactPhone", event.target.value)}
                          placeholder="+57 300 000 0000"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled>
                          Guardar Cambios
                        </Button>
                      </div>
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
