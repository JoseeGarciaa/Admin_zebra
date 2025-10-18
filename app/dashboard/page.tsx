import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { StatsCard } from "@/components/stats-card"
import { ActivityList } from "@/components/activity-list"
import { AccessChart } from "@/components/access-chart"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Users, DoorOpen, AlertTriangle, UserCheck } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Accesos Hoy",
      value: "1,234",
      change: "+12.5% desde ayer",
      trend: "up" as const,
      icon: Users,
    },
    {
      title: "Personal Activo",
      value: "342",
      change: "+3.2% desde ayer",
      trend: "up" as const,
      icon: UserCheck,
    },
    {
      title: "Puertas Monitoreadas",
      value: "24",
      change: "0% desde ayer",
      trend: "neutral" as const,
      icon: DoorOpen,
    },
    {
      title: "Accesos Denegados",
      value: "12",
      change: "-8.3% desde ayer",
      trend: "down" as const,
      icon: AlertTriangle,
    },
  ]

  const recentActivity = [
    {
      name: "Juan Pérez",
      location: "Puerta Principal",
      time: "Hace 2 minutos",
      status: "granted" as const,
    },
    {
      name: "María García",
      location: "Laboratorio A",
      time: "Hace 5 minutos",
      status: "granted" as const,
    },
    {
      name: "Carlos López",
      location: "Sala de Servidores",
      time: "Hace 8 minutos",
      status: "denied" as const,
    },
    {
      name: "Ana Martínez",
      location: "Oficina 201",
      time: "Hace 12 minutos",
      status: "granted" as const,
    },
  ]

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
              <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Monitoreo en tiempo real del sistema de control de acceso</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <StatsCard key={index} {...stat} />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AccessChart />
                <ActivityList activities={recentActivity} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
