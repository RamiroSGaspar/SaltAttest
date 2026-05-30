import type { VercelRequest, VercelResponse } from "@vercel/node"
import { createWalletClient, createPublicClient, http } from "@arkiv-network/sdk"
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts"
import { braga } from "@arkiv-network/sdk/chains"
import { jsonToPayload, ExpirationTime } from "@arkiv-network/sdk/utils"
import { eq } from "@arkiv-network/sdk/query"
import { PERFILES_MOCK } from "./_data.js"

const ITEMS_BLANDOS = ["comunicacion", "colaboracion", "participacion", "ayuda", "liderazgo"]
const PUNTUACIONES = [5, 4, 3, 5, 4, 4, 3, 5, 3, 4, 5, 4, 3, 5, 4]

function buildPerfilCreate(perfil: (typeof PERFILES_MOCK)[0]) {
  return {
    payload: jsonToPayload(perfil),
    contentType: "application/json" as const,
    attributes: [
      { key: "app", value: "saltrust" },
      { key: "tipo", value: "perfil" },
      { key: "perfilId", value: perfil.perfilId },
      { key: "area", value: perfil.area },
      { key: "rol", value: perfil.rol },
    ],
    expiresIn: ExpirationTime.fromDays(7),
  }
}

function buildAvalCreates(perfil: (typeof PERFILES_MOCK)[0], counterRef: { n: number }) {
  const creates = []

  for (const item of ITEMS_BLANDOS) {
    const puntuacion = PUNTUACIONES[counterRef.n % PUNTUACIONES.length]
    counterRef.n++
    creates.push({
      payload: jsonToPayload({
        avalId: `aval-seed-${perfil.perfilId}-b-${item}`,
        avalado: perfil.perfilId,
        avalador: `avalador-${String(counterRef.n).padStart(3, "0")}`,
        brazo: "blando",
        objetivo: item,
        puntuacion,
        comentario: "",
        fecha: new Date().toISOString(),
      }),
      contentType: "application/json" as const,
      attributes: [
        { key: "app", value: "saltrust" },
        { key: "tipo", value: "aval" },
        { key: "avalado", value: perfil.perfilId },
        { key: "avalador", value: `avalador-${String(counterRef.n).padStart(3, "0")}` },
        { key: "brazo", value: "blando" },
        { key: "objetivo", value: item },
      ],
      expiresIn: ExpirationTime.fromDays(7),
    })
  }

  for (const hito of perfil.hitos) {
    const puntuacion = PUNTUACIONES[counterRef.n % PUNTUACIONES.length]
    counterRef.n++
    creates.push({
      payload: jsonToPayload({
        avalId: `aval-seed-${perfil.perfilId}-t-${hito.id}`,
        avalado: perfil.perfilId,
        avalador: `avalador-${String(counterRef.n).padStart(3, "0")}`,
        brazo: "tecnico",
        objetivo: hito.id,
        puntuacion,
        comentario: "",
        fecha: new Date().toISOString(),
      }),
      contentType: "application/json" as const,
      attributes: [
        { key: "app", value: "saltrust" },
        { key: "tipo", value: "aval" },
        { key: "avalado", value: perfil.perfilId },
        { key: "avalador", value: `avalador-${String(counterRef.n).padStart(3, "0")}` },
        { key: "brazo", value: "tecnico" },
        { key: "objetivo", value: hito.id },
      ],
      expiresIn: ExpirationTime.fromDays(7),
    })
  }

  return creates
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") return res.status(405).end()

  try {
    const publicClient = createPublicClient({ chain: braga, transport: http() })

    const existing = await publicClient
      .buildQuery()
      .where(eq("app", "saltrust"))
      .where(eq("tipo", "perfil"))
      .limit(1)
      .fetch()

    if (existing.entities.length > 0) {
      const count = await publicClient
        .buildQuery()
        .where(eq("app", "saltrust"))
        .where(eq("tipo", "perfil"))
        .limit(200)
        .fetch()
      return res.json({
        ok: false,
        mensaje: `Seed ya fue ejecutado, hay ${count.entities.length} perfiles en Arkiv`,
      })
    }

    const pk = process.env.PRIVATE_KEY as `0x${string}`
    if (!pk) return res.status(500).json({ ok: false, error: "PRIVATE_KEY no configurada" })

    const walletClient = createWalletClient({
      chain: braga,
      transport: http(),
      account: privateKeyToAccount(pk),
    })

    await walletClient.mutateEntities({
      creates: PERFILES_MOCK.map(buildPerfilCreate),
    })

    const counter = { n: 1 }
    let avalesCreados = 0

    for (const perfil of PERFILES_MOCK) {
      const creates = buildAvalCreates(perfil, counter)
      await walletClient.mutateEntities({ creates })
      avalesCreados += creates.length
    }

    res.json({ ok: true, perfilesCreados: PERFILES_MOCK.length, avalesCreados })
  } catch (err) {
    console.error("Error en /api/run-seed:", err instanceof Error ? err.message : err)
    res.status(500).json({ ok: false, error: err instanceof Error ? err.message : String(err) })
  }
}
