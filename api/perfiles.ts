import type { VercelRequest, VercelResponse } from "@vercel/node"
import { traerPerfiles } from "../src/lib/arkiv/index.js"
import { PERFILES_MOCK, REPUTACIONES_MOCK } from "./_data.js"

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const perfiles = await traerPerfiles()
    if (perfiles.length === 0) {
      return res.json({ perfiles: PERFILES_MOCK, reputaciones: REPUTACIONES_MOCK })
    }
    res.json({ perfiles, reputaciones: {} })
  } catch {
    res.json({ perfiles: PERFILES_MOCK, reputaciones: REPUTACIONES_MOCK })
  }
}
