import type { VercelRequest, VercelResponse } from "@vercel/node"
import { traerPerfil, traerAvales, calcularEstrellas } from "../../src/lib/arkiv/index.js"
import { PERFILES_MOCK, REPUTACIONES_MOCK } from "../_data.js"

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string }

  try {
    const [perfil, avales] = await Promise.all([traerPerfil(id), traerAvales(id)])

    if (!perfil) {
      const mock = PERFILES_MOCK.find((p) => p.perfilId === id)
      if (!mock) return res.status(404).json({ error: "Perfil no encontrado" })
      return res.json({ perfil: mock, reputacion: REPUTACIONES_MOCK[id] ?? fallbackRep(id) })
    }

    const reputacion = avales.length > 0 ? calcularEstrellas(avales) : fallbackRep(id)
    res.json({ perfil, reputacion })
  } catch {
    const mock = PERFILES_MOCK.find((p) => p.perfilId === id)
    if (!mock) return res.status(404).json({ error: "Perfil no encontrado" })
    res.json({ perfil: mock, reputacion: REPUTACIONES_MOCK[id] ?? fallbackRep(id) })
  }
}

function fallbackRep(perfilId: string) {
  return { perfilId, estrellasBlandas: 0, estrellasTecnicas: 0, detalleBlandas: [], detalleTecnicas: [] }
}
