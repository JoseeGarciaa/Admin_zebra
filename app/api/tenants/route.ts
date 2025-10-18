import { NextResponse } from "next/server"
import { z } from "zod"

import { createTenant, getTenants } from "@/lib/data"

const createTenantSchema = z.object({
  nombre: z.string().min(1),
  nit: z.string().min(3).max(50).optional().nullable(),
  email_contacto: z.string().email(),
  telefono_contacto: z.string().min(3).max(50).optional().nullable(),
  direccion: z.string().min(3).max(200).optional().nullable(),
  contraseña: z.string().min(4),
  estado: z.boolean().optional(),
})

export async function GET() {
  try {
    const tenants = await getTenants()
    return NextResponse.json(tenants)
  } catch (error) {
    console.error("Failed to load tenants", error)
    return NextResponse.json({ error: "No se pudieron cargar los tenants" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createTenantSchema.parse(body)
    const tenant = await createTenant(parsed)
    return NextResponse.json(tenant, { status: 201 })
  } catch (error) {
    console.error("Failed to create tenant", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.flatten() }, { status: 400 })
    }

    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "El tenant ya existe con esos datos"
        : "No se pudo crear el tenant"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
