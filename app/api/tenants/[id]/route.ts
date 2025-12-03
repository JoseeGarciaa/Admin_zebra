import { NextResponse } from "next/server"
import { z } from "zod"

import { deleteTenant, getTenantById, updateTenant } from "@/lib/data"

const updateTenantSchema = z.object({
  nombre: z.string().min(1).optional(),
  nit: z.string().min(3).max(50).optional().nullable(),
  email_contacto: z.string().email().optional(),
  telefono_contacto: z.string().min(3).max(50).optional().nullable(),
  direccion: z.string().min(3).max(200).optional().nullable(),
  contraseña: z.string().min(4).optional().nullable(),
  estado: z.boolean().optional(),
})

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const tenant = await getTenantById(id)

    if (!tenant) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    }

    return NextResponse.json(tenant)
  } catch (error) {
    console.error("Failed to load tenant", error)
    return NextResponse.json({ error: "No se pudo cargar el tenant" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    const body = await request.json()
    const parsed = updateTenantSchema.parse(body)
    const updated = await updateTenant(id, parsed)
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Failed to update tenant", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.flatten() }, { status: 400 })
    }

    if (error instanceof Error && error.message.includes("Tenant no encontrado")) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    }

    const details = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: "No se pudo actualizar el tenant", details }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 })
  }

  try {
    await deleteTenant(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete tenant", error)

    if (error instanceof Error && error.message.includes("Tenant no encontrado")) {
      return NextResponse.json({ error: "Tenant no encontrado" }, { status: 404 })
    }

    const details = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json({ error: "No se pudo eliminar el tenant", details }, { status: 500 })
  }
}
