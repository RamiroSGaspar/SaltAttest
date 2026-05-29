import type { VercelRequest, VercelResponse } from "@vercel/node"
import { PERFILES_MOCK, REPUTACIONES_MOCK } from "../_data"

// TODO: reemplazar con traerPerfil(id) de Arkiv
export default function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query as { id: string }
  const perfil = PERFILES_MOCK.find((p) => p.perfilId === id)

  if (!perfil) return res.status(404).json({ error: "Perfil no encontrado" })

  const reputacion = REPUTACIONES_MOCK[id] ?? {
    perfilId: id,
    estrellasBlandas: 0,
    estrellasTecnicas: 0,
    detalleBlandas: [],
    detalleTecnicas: [],
  }

  res.json({ perfil, reputacion })
}
