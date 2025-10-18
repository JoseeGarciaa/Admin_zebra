import { NextResponse } from "next/server"
import { z } from "zod"

import { authenticateAdminUser } from "@/lib/data"

const loginSchema = z.object({
  correo: z.string().email(),
  contraseña: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const credentials = loginSchema.parse(body)
    const user = await authenticateAdminUser(credentials)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Login error", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos inválidos", details: error.flatten() }, { status: 400 })
    }

    return NextResponse.json({ error: "No se pudo iniciar sesión" }, { status: 500 })
  }
}
