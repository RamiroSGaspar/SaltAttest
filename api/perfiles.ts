import type { VercelRequest, VercelResponse } from "@vercel/node"
import { PERFILES_MOCK, REPUTACIONES_MOCK } from "./_data.js"

// TODO: reemplazar con traerPerfiles() de Arkiv
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({ perfiles: PERFILES_MOCK, reputaciones: REPUTACIONES_MOCK })
}
