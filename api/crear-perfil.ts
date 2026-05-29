import type { VercelRequest, VercelResponse } from "@vercel/node"
import { crearPerfil } from "../src/lib/arkiv/index.js"
import type { Perfil } from "../src/lib/arkiv/index.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const body = req.body as Omit<Perfil, "perfilId" | "verificado">

  const datos = {
    ...body,
    perfilId: `perfil-${crypto.randomUUID().slice(0, 8)}`,
    verificado: false,
  }

  try {
    const perfilId = await crearPerfil(datos)
    res.json({ perfilId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al crear el perfil"
    res.status(500).json({ ok: false, error: message })
  }
}
