import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { StatsCard, type StatsCardProps } from "@/components/stats-card"
import { AccessChart } from "@/components/access-chart"
import { UserStatusChart } from "@/components/user-status-chart"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { SessionGuard } from "@/components/session-guard"
import { getDashboardMetrics, type DashboardMetrics } from "@/lib/data"
import { Users, UserCheck, Building2, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"
export const revalidate = 0

function formatNumber(value: number) {
  return value.toLocaleString("es-CO")
}

function formatChange(value: number) {
  const formatted = Math.abs(value).toFixed(1).replace(/\.0$/, "")
  return `${value >= 0 ? "+" : "-"}${formatted}% vs mes anterior`
}

function growthTrend(value: number): "up" | "down" | "neutral" {
  if (value > 0) return "up"
  if (value < 0) return "down"
  return "neutral"
}

export default async function DashboardPage() {
  let metrics: DashboardMetrics

  try {
    metrics = await getDashboardMetrics()
  } catch (error) {
    console.error("No se pudieron cargar las métricas del dashboard", error)
    metrics = {
      totals: {
        totalUsers: 0,
        activeUsers: 0,
        inactiveUsers: 0,
        totalTenants: 0,
        activeTenants: 0,
        inactiveTenants: 0,
        activeToday: 0,
      },
      growth: {
        users: 0,
        tenants: 0,
        overall: 0,
      },
      monthly: [],
    }
  }

  const stats: StatsCardProps[] = [
    {
      title: "Total Usuarios",
      value: formatNumber(metrics.totals.totalUsers),
      change: `Activos: ${formatNumber(metrics.totals.activeUsers)} • ${formatChange(metrics.growth.users)}`,
      trend: growthTrend(metrics.growth.users),
      icon: Users,
    },
    {
      title: "Total Empresas",
      value: formatNumber(metrics.totals.totalTenants),
      change: `Activas: ${formatNumber(metrics.totals.activeTenants)} • ${formatChange(metrics.growth.tenants)}`,
      trend: growthTrend(metrics.growth.tenants),
      icon: Building2,
    },
    {
      title: "Tasa Crecimiento",
      value: `${metrics.growth.overall >= 0 ? "+" : "-"}${Math.abs(metrics.growth.overall).toFixed(1)}%`,
      change: "Promedio mensual combinando usuarios y empresas",
      trend: growthTrend(metrics.growth.overall),
      icon: TrendingUp,
    },
    {
      title: "Activos Hoy",
      value: formatNumber(metrics.totals.activeToday),
      change: `Usuarios activos • ${formatNumber(metrics.totals.inactiveUsers)} inactivos`,
      trend: metrics.totals.activeToday > 0 ? "up" : "neutral",
      icon: UserCheck,
    },
  ]

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
                  <AccessChart
                    data={metrics.monthly.map((month) => ({
                      label: month.label,
                      usuarios: month.usuarios,
                      empresas: month.empresas,
                    }))}
                  />
                  <UserStatusChart active={metrics.totals.activeUsers} inactive={metrics.totals.inactiveUsers} />
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionGuard>
  )
}
