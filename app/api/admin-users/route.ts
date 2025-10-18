import { NextResponse } from "next/server"
import { z } from "zod"

import { createAdminUser, getAdminUsers } from "@/lib/data"

const createUserSchema = z.object({
  nombre: z.string().min(1),
  correo: z.string().email(),
  telefono: z.string().min(3).max(50).optional().nullable(),
  contraseña: z.string().min(4),
  rol: z.enum(["admin", "soporte"]),
  activo: z.boolean().optional(),
})

export async function GET() {
  try {
    const users = await getAdminUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Failed to load admin users", error)
    return NextResponse.json({ error: "No se pudieron cargar los usuarios" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createUserSchema.parse(body)
    const user = await createAdminUser(parsed)
    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error("Failed to create admin user", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.flatten() }, { status: 400 })
    }

    const message =
      error instanceof Error && error.message.includes("duplicate key")
        ? "Ya existe un usuario con ese correo"
        : "No se pudo crear el usuario"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
