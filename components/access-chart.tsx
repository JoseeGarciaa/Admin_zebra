"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

const data = [
  { day: "Lun", accesos: 180 },
  { day: "Mar", accesos: 280 },
  { day: "Mié", accesos: 310 },
  { day: "Jue", accesos: 390 },
  { day: "Vie", accesos: 280 },
  { day: "Sáb", accesos: 140 },
  { day: "Dom", accesos: 95 },
]

export function AccessChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Accesos por Día</CardTitle>
        <p className="text-sm text-slate-600">Últimos 7 días</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Bar dataKey="accesos" fill="#0f172a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
