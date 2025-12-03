"use client"

import { useMemo, useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type SeriesKey = "usuarios" | "empresas"

const SERIES: Array<{ key: SeriesKey; label: string; color: string }> = [
  { key: "usuarios", label: "Usuarios", color: "#6366F1" },
  { key: "empresas", label: "Empresas", color: "#10B981" },
]

export type AccessChartPoint = {
  label: string
  usuarios: number
  empresas: number
}

interface AccessChartProps {
  data: AccessChartPoint[]
}

export function AccessChart({ data }: AccessChartProps) {
  const [visibleSeries, setVisibleSeries] = useState<SeriesKey[]>(() => SERIES.map((serie) => serie.key))

  const chartData = useMemo(() => {
    if (visibleSeries.length === SERIES.length) {
      return data
    }

    return data.map((item) => {
      const partial: AccessChartPoint = { ...item }

      SERIES.forEach((serie) => {
        if (!visibleSeries.includes(serie.key)) {
          partial[serie.key] = 0
        }
      })

      return partial
    })
  }, [data, visibleSeries])

  const toggleSeries = (key: SeriesKey) => {
    setVisibleSeries((current) => {
      if (current.includes(key)) {
        if (current.length === 1) {
          return current
        }

        return current.filter((serie) => serie !== key)
      }

      return [...current, key]
    })
  }

  const hasData = data.some((item) => item.usuarios > 0 || item.empresas > 0)

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Crecimiento Mensual</CardTitle>
          <CardDescription>Usuarios y empresas por mes</CardDescription>
        </div>
        <div className="flex gap-2">
          {SERIES.map((serie) => {
            const isActive = visibleSeries.includes(serie.key)
            return (
              <Button
                key={serie.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => toggleSeries(serie.key)}
                className={isActive ? "bg-slate-900 hover:bg-slate-800" : "text-slate-600"}
              >
                <span
                  className="mr-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: serie.color }}
                  aria-hidden
                />
                {serie.label}
              </Button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent>
        {hasData ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} barCategoryGap={32}>
              <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "rgba(15, 23, 42, 0.05)" }}
                contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0" }}
                formatter={(value, name) => {
                  const serie = SERIES.find((item) => item.key === name)
                  return [Number(value).toLocaleString("es-CO"), serie?.label ?? name]
                }}
              />
              {SERIES.filter((serie) => visibleSeries.includes(serie.key)).map((serie) => (
                <Bar
                  key={serie.key}
                  dataKey={serie.key}
                  name={serie.key}
                  fill={serie.color}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-72 items-center justify-center text-sm text-slate-500">
            No hay registros recientes para mostrar.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
