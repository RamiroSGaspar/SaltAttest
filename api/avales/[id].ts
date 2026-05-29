import type { VercelRequest, VercelResponse } from "@vercel/node"
import { traerAvales, calcularEstrellas } from "../../src/lib/arkiv/index.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string }

  try {
    const avales = await traerAvales(id)
    const reputacion = calcularEstrellas(avales)
    res.json({ avales, reputacion })
  } catch {
    res.json({
      avales: [],
      reputacion: {
        perfilId: id,
        estrellasBlandas: 0,
        estrellasTecnicas: 0,
        detalleBlandas: [],
        detalleTecnicas: [],
      },
    })
  }
}
