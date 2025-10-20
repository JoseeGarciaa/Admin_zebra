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

export async function getDashboardMetrics(): Promise<{
  totalUsers: number
  activeUsers: number
  totalTenants: number
  activeTenants: number
}> {
  const [usersTotalResult, usersActiveResult, tenantTotalResult, tenantActiveResult] = await Promise.all([
    query<{ count: string }>("select count(*) from admin_platform.admin_users"),
    query<{ count: string }>("select count(*) from admin_platform.admin_users where activo = true"),
    query<{ count: string }>("select count(*) from admin_platform.tenants"),
    query<{ count: string }>("select count(*) from admin_platform.tenants where estado = true"),
  ])

  return {
    totalUsers: Number(usersTotalResult.rows[0]?.count ?? 0),
    activeUsers: Number(usersActiveResult.rows[0]?.count ?? 0),
    totalTenants: Number(tenantTotalResult.rows[0]?.count ?? 0),
    activeTenants: Number(tenantActiveResult.rows[0]?.count ?? 0),
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
