import type { VercelRequest, VercelResponse } from "@vercel/node"
import { traerPerfiles, traerAvales, calcularEstrellas } from "../src/lib/arkiv/index.js"
import type { Reputacion } from "../src/lib/arkiv/types.js"
import { PERFILES_MOCK, REPUTACIONES_MOCK } from "./_data.js"

const dedup = <T extends { perfilId: string }>(arr: T[]) =>
  arr.filter((p, i, a) => a.findIndex((x) => x.perfilId === p.perfilId) === i)

function fallbackRep(perfilId: string): Reputacion {
  return { perfilId, estrellasBlandas: 0, estrellasTecnicas: 0, detalleBlandas: [], detalleTecnicas: [] }
}

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const perfiles = dedup(await traerPerfiles())
    if (perfiles.length === 0) {
      return res.json({ perfiles: dedup(PERFILES_MOCK), reputaciones: REPUTACIONES_MOCK })
    }

    const avalesPorPerfil = await Promise.all(
      perfiles.map((p) => traerAvales(p.perfilId))
    )

    const reputaciones: Record<string, Reputacion> = {}
    for (let i = 0; i < perfiles.length; i++) {
      const avales = avalesPorPerfil[i]
      reputaciones[perfiles[i].perfilId] =
        avales.length > 0 ? calcularEstrellas(avales) : fallbackRep(perfiles[i].perfilId)
    }

    res.json({ perfiles, reputaciones })
  } catch {
    res.json({ perfiles: dedup(PERFILES_MOCK), reputaciones: REPUTACIONES_MOCK })
  }
}
