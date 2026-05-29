import { createPublicClient, createWalletClient, http } from "@arkiv-network/sdk"
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts"
import { braga } from "@arkiv-network/sdk/chains"
import { jsonToPayload, ExpirationTime } from "@arkiv-network/sdk/utils"
import { eq } from "@arkiv-network/sdk/query"
import type { Perfil, Aval, Reputacion } from "./types"

export type { Perfil, Aval, Reputacion }
export type { Hito } from "./types"

// ── Clientes ────────────────────────────────────────────────────────────────────────────

export const publicClient = createPublicClient({
  chain: braga,
  transport: http(),
})

// Solo para scripts/servidor — nunca importar desde el frontend.
function getWalletClient() {
  const pk = process.env.PRIVATE_KEY as `0x${string}`
  if (!pk) throw new Error("PRIVATE_KEY no definida en el entorno")
  return createWalletClient({
    chain: braga,
    transport: http(),
    account: privateKeyToAccount(pk),
  })
}

// ── Escrituras (servidor / scripts) ─────────────────────────────────────────────

export async function crearPerfil(datos: Omit<Perfil, "verificado"> & { verificado?: boolean }): Promise<string> {
  const walletClient = getWalletClient()
  const perfil: Perfil = { verificado: false, ...datos }

  await walletClient.createEntity({
    payload: jsonToPayload(perfil),
    contentType: "application/json",
    attributes: [
      { key: "app", value: "saltrust" },
      { key: "tipo", value: "perfil" },
      { key: "perfilId", value: perfil.perfilId },
      { key: "area", value: perfil.area },
      { key: "rol", value: perfil.rol },
    ],
    expiresIn: ExpirationTime.fromDays(7),
  })

  return perfil.perfilId
}

export async function crearAval(datos: Aval): Promise<string> {
  if (datos.avalador === datos.avalado) {
    throw new Error("Un miembro no puede avalarse a sí mismo")
  }

  const walletClient = getWalletClient()

  await walletClient.createEntity({
    payload: jsonToPayload(datos),
    contentType: "application/json",
    attributes: [
      { key: "app", value: "saltrust" },
      { key: "tipo", value: "aval" },
      { key: "avalado", value: datos.avalado },
      { key: "avalador", value: datos.avalador },
      { key: "brazo", value: datos.brazo },
      { key: "objetivo", value: datos.objetivo },
    ],
    expiresIn: ExpirationTime.fromDays(7),
  })

  return datos.avalId
}

// ── Lecturas (frontend / servidor) ──────────────────────────────────────────────

export async function traerPerfil(perfilId: string): Promise<Perfil | null> {
  const result = await publicClient
    .buildQuery()
    .where(eq("app", "saltrust"))
    .where(eq("tipo", "perfil"))
    .where(eq("perfilId", perfilId))
    .withPayload(true)
    .withAttributes(true)
    .limit(1)
    .fetch()

  const entity = result.entities[0]
  if (!entity) return null
  return entity.toJson() as Perfil
}

export async function traerPerfiles(filtro?: { area?: string; rol?: string }): Promise<Perfil[]> {
  let query = publicClient
    .buildQuery()
    .where(eq("app", "saltrust"))
    .where(eq("tipo", "perfil"))

  if (filtro?.area) query = query.where(eq("area", filtro.area))
  if (filtro?.rol) query = query.where(eq("rol", filtro.rol))

  const result = await query.withPayload(true).withAttributes(true).limit(200).fetch()

  return result.entities.map((e) => e.toJson() as Perfil)
}

export async function traerAvales(perfilId: string): Promise<Aval[]> {
  const result = await publicClient
    .buildQuery()
    .where(eq("app", "saltrust"))
    .where(eq("tipo", "aval"))
    .where(eq("avalado", perfilId))
    .withPayload(true)
    .withAttributes(true)
    .limit(200)
    .fetch()

  return result.entities.map((e) => e.toJson() as Aval)
}

// ── Cálculo de estrellas (JS puro, sin Arkiv) ────────────────────────────────────────────

export function calcularEstrellas(avales: Aval[]): Reputacion {
  const perfilId = avales[0]?.avalado ?? ""

  function agrupar(items: Aval[]): Map<string, number[]> {
    const grupos = new Map<string, number[]>()
    for (const a of items) {
      if (!grupos.has(a.objetivo)) grupos.set(a.objetivo, [])
      grupos.get(a.objetivo)!.push(a.puntuacion)
    }
    return grupos
  }

  function promedioDeGrupos(grupos: Map<string, number[]>): number {
    if (grupos.size === 0) return 0
    const promedios = [...grupos.values()].map(
      (pts) => pts.reduce((s, p) => s + p, 0) / pts.length
    )
    return Math.round((promedios.reduce((s, p) => s + p, 0) / promedios.length) * 10) / 10
  }

  function round1(n: number) { return Math.round(n * 10) / 10 }

  const blandos = avales.filter((a) => a.brazo === "blando")
  const tecnicos = avales.filter((a) => a.brazo === "tecnico")

  const gruposBlandos = agrupar(blandos)
  const gruposTecnicos = agrupar(tecnicos)

  const detalleBlandas = [...gruposBlandos.entries()].map(([item, pts]) => ({
    item,
    promedio: round1(pts.reduce((s, p) => s + p, 0) / pts.length),
  }))

  const detalleTecnicas = [...gruposTecnicos.entries()].map(([hitoId, pts]) => ({
    hitoId,
    promedio: round1(pts.reduce((s, p) => s + p, 0) / pts.length),
  }))

  return {
    perfilId,
    estrellasBlandas: promedioDeGrupos(gruposBlandos),
    estrellasTecnicas: promedioDeGrupos(gruposTecnicos),
    detalleBlandas,
    detalleTecnicas,
  }
}
