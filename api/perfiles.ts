import type { VercelRequest, VercelResponse } from "@vercel/node"
import { traerPerfiles } from "../src/lib/arkiv/index.js"
import { PERFILES_MOCK, REPUTACIONES_MOCK } from "./_data.js"

const dedup = <T extends { perfilId: string }>(arr: T[]) =>
  arr.filter((p, i, a) => a.findIndex((x) => x.perfilId === p.perfilId) === i)

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const perfiles = dedup(await traerPerfiles())
    if (perfiles.length === 0) {
      return res.json({ perfiles: dedup(PERFILES_MOCK), reputaciones: REPUTACIONES_MOCK })
    }
    res.json({ perfiles, reputaciones: {} })
  } catch {
    res.json({ perfiles: dedup(PERFILES_MOCK), reputaciones: REPUTACIONES_MOCK })
  }
}
