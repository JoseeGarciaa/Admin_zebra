import { NextResponse } from "next/server"
import { z } from "zod"

import { updateAdminUser, deleteAdminUser } from "@/lib/data"

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const updateUserSchema = z.object({
  nombre: z.string().min(1).optional(),
  correo: z.string().email().optional(),
  telefono: z.string().min(3).max(50).nullable().optional(),
  rol: z.enum(["admin", "soporte"]).optional(),
  activo: z.boolean().optional(),
  contraseña: z.string().min(4).optional(),
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = idParamSchema.parse(params)
    const body = await request.json()
    const payload = updateUserSchema.parse(body)
    const user = await updateAdminUser(id, payload)
    return NextResponse.json(user)
  } catch (error) {
    console.error("Failed to update admin user", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.flatten() }, { status: 400 })
    }

    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "Ya existe un usuario con ese correo"
        : error instanceof Error
          ? error.message
          : "No se pudo actualizar el usuario"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = idParamSchema.parse(params)
    await deleteAdminUser(id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Failed to delete admin user", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Identificador inválido" }, { status: 400 })
    }

    return NextResponse.json({ error: "No se pudo eliminar el usuario" }, { status: 500 })
  }
}
