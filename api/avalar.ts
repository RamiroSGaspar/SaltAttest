import type { VercelRequest, VercelResponse } from "@vercel/node"
import { crearAval } from "../src/lib/arkiv/index.js"
import type { Aval } from "../src/lib/arkiv/index.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const body = req.body as Omit<Aval, "avalId" | "fecha">

  const datos: Aval = {
    ...body,
    avalId: crypto.randomUUID(),
    fecha: new Date().toISOString(),
  }

  try {
    const avalId = await crearAval(datos)
    res.json({ ok: true, avalId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error al registrar el aval"
    res.status(500).json({ ok: false, error: message })
  }
}
