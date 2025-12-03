import bcrypt from "bcryptjs"

import { query } from "./db"

export type AdminUser = {
  id: number
  nombre: string
  correo: string
  telefono: string | null
  rol: "admin" | "soporte"
  activo: boolean
  ultimo_ingreso: string | null
  fecha_creacion: string | null
}

export type Tenant = {
  id: number
  nombre: string
  nit: string | null
  email_contacto: string
  telefono_contacto: string | null
  direccion: string | null
  estado: boolean
  ultimo_ingreso: string | null
  fecha_creacion: string | null
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { rows } = await query<AdminUser>(
    `select id, nombre, correo, telefono, rol, activo, ultimo_ingreso, fecha_creacion
     from admin_platform.admin_users
     order by id desc`,
  )

  return rows
}

export async function createAdminUser(data: {
  nombre: string
  correo: string
  telefono?: string | null
  rol: "admin" | "soporte"
  contraseña: string
  activo?: boolean
}): Promise<AdminUser> {
  const hashedPassword = await bcrypt.hash(data.contraseña, 10)

  const { rows } = await query<AdminUser>(
    `insert into admin_platform.admin_users
       (nombre, correo, telefono, rol, contraseña, activo)
     values ($1, $2, $3, $4, $5, coalesce($6, true))
     returning id, nombre, correo, telefono, rol, activo, ultimo_ingreso, fecha_creacion`,
    [data.nombre, data.correo, data.telefono ?? null, data.rol, hashedPassword, data.activo ?? true],
  )

  return rows[0]
}

export async function getTenants(): Promise<Tenant[]> {
  const { rows } = await query<Tenant>(
    `select id, nombre, nit, email_contacto, telefono_contacto, direccion, estado, ultimo_ingreso, fecha_creacion
     from admin_platform.tenants
     order by id desc`,
  )

  return rows
}

export async function createTenant(data: {
  nombre: string
  nit?: string | null
  email_contacto: string
  telefono_contacto?: string | null
  direccion?: string | null
  contraseña: string
  estado?: boolean
}): Promise<Tenant> {
  const { rows } = await query<Tenant>(
    `insert into admin_platform.tenants
       (nombre, nit, email_contacto, telefono_contacto, direccion, contraseña, estado)
     values ($1, $2, $3, $4, $5, $6, coalesce($7, true))
     returning id, nombre, nit, email_contacto, telefono_contacto, direccion, estado, ultimo_ingreso, fecha_creacion`,
    [
      data.nombre,
      data.nit ?? null,
      data.email_contacto,
      data.telefono_contacto ?? null,
      data.direccion ?? null,
      data.contraseña,
      data.estado ?? true,
    ],
  )

  return rows[0]
}

type MonthlyBreakdownRow = {
  month_key: string
  total: number
}

type DashboardMonth = {
  monthKey: string
  label: string
  usuarios: number
  empresas: number
}

export type DashboardMetrics = {
  totals: {
    totalUsers: number
    activeUsers: number
    inactiveUsers: number
    totalTenants: number
    activeTenants: number
    inactiveTenants: number
    activeToday: number
  }
  growth: {
    users: number
    tenants: number
    overall: number
  }
  monthly: DashboardMonth[]
}

function buildLastMonths(windowSize = 6): { monthKey: string; label: string }[] {
  const formatter = new Intl.DateTimeFormat("es-ES", { month: "short" })

  return Array.from({ length: windowSize }, (_, index) => {
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setMonth(date.getMonth() - (windowSize - 1 - index))

    const monthKey = date.toISOString().slice(0, 7)
    const label = formatter.format(date).replace(/\.$/, "")

    return { monthKey, label: label.charAt(0).toUpperCase() + label.slice(1) }
  })
}

function computeGrowth(current: number, previous: number): number {
  if (previous === 0) {
    return current === 0 ? 0 : 100
  }

  return ((current - previous) / previous) * 100
}

export async function getDashboardMetrics(windowSize = 6): Promise<DashboardMetrics> {
  const months = buildLastMonths(windowSize)

  const [
    usersTotalResult,
    usersActiveResult,
    tenantTotalResult,
    tenantActiveResult,
    activeTodayResult,
    usersMonthlyResult,
    tenantsMonthlyResult,
  ] = await Promise.all([
    query<{ count: string }>("select count(*) from admin_platform.admin_users"),
    query<{ count: string }>("select count(*) from admin_platform.admin_users where activo = true"),
    query<{ count: string }>("select count(*) from admin_platform.tenants"),
    query<{ count: string }>("select count(*) from admin_platform.tenants where estado = true"),
    query<{ count: string }>(
      "select count(*) from admin_platform.admin_users where date(ultimo_ingreso) = current_date",
    ),
    query<MonthlyBreakdownRow>(
      `select to_char(date_trunc('month', fecha_creacion), 'YYYY-MM') as month_key,
              count(*)::int as total
         from admin_platform.admin_users
        where fecha_creacion >= date_trunc('month', now()) - interval '${windowSize - 1} months'
          and fecha_creacion is not null
        group by month_key`,
    ),
    query<MonthlyBreakdownRow>(
      `select to_char(date_trunc('month', fecha_creacion), 'YYYY-MM') as month_key,
              count(*)::int as total
         from admin_platform.tenants
        where fecha_creacion >= date_trunc('month', now()) - interval '${windowSize - 1} months'
          and fecha_creacion is not null
        group by month_key`,
    ),
  ])

  const totalUsers = Number(usersTotalResult.rows[0]?.count ?? 0)
  const activeUsers = Number(usersActiveResult.rows[0]?.count ?? 0)
  const inactiveUsers = Math.max(totalUsers - activeUsers, 0)
  const totalTenants = Number(tenantTotalResult.rows[0]?.count ?? 0)
  const activeTenants = Number(tenantActiveResult.rows[0]?.count ?? 0)
  const inactiveTenants = Math.max(totalTenants - activeTenants, 0)
  const activeToday = Number(activeTodayResult.rows[0]?.count ?? 0)

  const usersMonthlyMap = new Map(
    usersMonthlyResult.rows.map((row) => [row.month_key, Number(row.total ?? 0)]) as Array<[string, number]>,
  )
  const tenantsMonthlyMap = new Map(
    tenantsMonthlyResult.rows.map((row) => [row.month_key, Number(row.total ?? 0)]) as Array<[string, number]>,
  )

  const monthly: DashboardMonth[] = months.map(({ monthKey, label }) => ({
    monthKey,
    label,
    usuarios: usersMonthlyMap.get(monthKey) ?? 0,
    empresas: tenantsMonthlyMap.get(monthKey) ?? 0,
  }))

  const currentMonth = monthly.at(-1) ?? { usuarios: 0, empresas: 0 }
  const previousMonth = monthly.at(-2) ?? { usuarios: 0, empresas: 0 }

  const usersGrowth = computeGrowth(currentMonth.usuarios, previousMonth.usuarios)
  const tenantsGrowth = computeGrowth(currentMonth.empresas, previousMonth.empresas)
  const overallGrowth = (usersGrowth + tenantsGrowth) / 2

  return {
    totals: {
      totalUsers,
      activeUsers,
      inactiveUsers,
      totalTenants,
      activeTenants,
      inactiveTenants,
      activeToday,
    },
    growth: {
      users: usersGrowth,
      tenants: tenantsGrowth,
      overall: overallGrowth,
    },
    monthly,
  }
}

export async function authenticateAdminUser(credentials: {
  correo: string
  contraseña: string
}): Promise<AdminUser | null> {
  const { rows } = await query<AdminUser & { contraseña: string }>(
    `select id, nombre, correo, telefono, rol, activo, ultimo_ingreso, fecha_creacion, contraseña
     from admin_platform.admin_users
     where correo = $1
     limit 1`,
    [credentials.correo],
  )

  const user = rows[0]

  if (!user) {
    return null
  }

  const passwordMatches = await bcrypt.compare(credentials.contraseña, user.contraseña)

  if (!passwordMatches) {
    return null
  }

  if (!user.activo) {
    return null
  }

  const plainUser: AdminUser = {
    id: user.id,
    nombre: user.nombre,
    correo: user.correo,
    telefono: user.telefono,
    rol: user.rol,
    activo: user.activo,
    ultimo_ingreso: user.ultimo_ingreso,
    fecha_creacion: user.fecha_creacion,
  }

  await query(
    `update admin_platform.admin_users
       set ultimo_ingreso = now()
     where id = $1`,
    [user.id],
  )

  return plainUser
}
