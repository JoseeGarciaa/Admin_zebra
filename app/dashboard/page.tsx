import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { StatsCard } from "@/components/stats-card"
import { ActivityList } from "@/components/activity-list"
import { AccessChart } from "@/components/access-chart"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getDashboardMetrics } from "@/lib/data"
import { Users, UserCheck, Building2, Building } from "lucide-react"

export default async function DashboardPage() {
  let metrics: Awaited<ReturnType<typeof getDashboardMetrics>>

  try {
    metrics = await getDashboardMetrics()
  } catch (error) {
    console.error("No se pudieron cargar las métricas del dashboard", error)
    metrics = {
      totalUsers: 0,
      activeUsers: 0,
      totalTenants: 0,
      activeTenants: 0,
    }
  }

  const stats = [
    {
      title: "Usuarios totales",
      value: metrics.totalUsers.toString(),
      change: `Activos: ${metrics.activeUsers}`,
      trend: "neutral" as const,
      icon: Users,
    },
    {
      title: "Usuarios activos",
      value: metrics.activeUsers.toString(),
      change: `Inactivos: ${Math.max(metrics.totalUsers - metrics.activeUsers, 0)}`,
      trend: "neutral" as const,
      icon: UserCheck,
    },
    {
      title: "Tenants totales",
      value: metrics.totalTenants.toString(),
      change: `Activos: ${metrics.activeTenants}`,
      trend: "neutral" as const,
      icon: Building2,
    },
    {
      title: "Tenants activos",
      value: metrics.activeTenants.toString(),
      change: `Inactivos: ${Math.max(metrics.totalTenants - metrics.activeTenants, 0)}`,
      trend: "neutral" as const,
      icon: Building,
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
