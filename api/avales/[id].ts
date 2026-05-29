import type { VercelRequest, VercelResponse } from "@vercel/node"

// TODO: reemplazar con traerAvales(id) de Arkiv
export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({ avales: [] })
}
