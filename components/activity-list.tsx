import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Activity {
  name: string
  location: string
  time: string
  status: "granted" | "denied"
}

interface ActivityListProps {
  activities: Activity[]
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Actividad Reciente</CardTitle>
        <p className="text-sm text-slate-600">Últimos eventos de acceso registrados</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b last:border-0">
              <div className="flex items-start gap-3">
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    activity.status === "granted" ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                <div>
                  <p className="font-medium text-slate-900">{activity.name}</p>
                  <p className="text-sm text-slate-600">{activity.location}</p>
                  <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                </div>
              </div>
              <Badge
                variant={activity.status === "granted" ? "default" : "destructive"}
                className={activity.status === "granted" ? "bg-emerald-500" : ""}
              >
                {activity.status === "granted" ? "Acceso concedido" : "Acceso denegado"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
