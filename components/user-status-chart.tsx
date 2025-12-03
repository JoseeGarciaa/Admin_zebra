"use client"

import { useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const COLORS = ["var(--chart-1)", "var(--chart-2)"]

interface UserStatusChartProps {
  active: number
  inactive: number
}

export function UserStatusChart({ active, inactive }: UserStatusChartProps) {
  const data = useMemo(
    () => [
      { name: `Activos: ${active.toLocaleString("es-CO")}`, value: active },
      { name: `Inactivos: ${inactive.toLocaleString("es-CO")}`, value: inactive },
    ],
    [active, inactive],
  )

  const total = active + inactive
  const activePercent = total === 0 ? 0 : Math.round((active / total) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estado de Usuarios</CardTitle>
        <CardDescription>Distribución de usuarios activos e inactivos</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {total === 0 ? (
          <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
            No hay usuarios registrados todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr,180px] md:items-center">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="value"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={4}
                    cornerRadius={12}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString("es-CO")} usuarios`,
                      name,
                    ]}
                    contentStyle={{
                      borderRadius: 8,
                      borderColor: "var(--border)",
                      backgroundColor: "var(--card)",
                      color: "var(--card-foreground)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Usuarios activos</p>
                <p className="text-3xl font-semibold text-foreground">
                  {active.toLocaleString("es-CO")}
                  <span className="ml-2 text-base font-medium text-primary">{activePercent}%</span>
                </p>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Inactivos: {inactive.toLocaleString("es-CO")}</p>
                <p>Total: {total.toLocaleString("es-CO")}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
