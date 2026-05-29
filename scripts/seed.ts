import "dotenv/config"
import { createWalletClient, http } from "@arkiv-network/sdk"
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts"
import { braga } from "@arkiv-network/sdk/chains"
import { jsonToPayload, ExpirationTime } from "@arkiv-network/sdk/utils"
import { PERFILES_MOCK } from "../api/_data.js"

const ITEMS_BLANDOS = ["comunicacion", "colaboracion", "participacion", "ayuda", "liderazgo"]

// Puntuaciones variadas para que las estrellas se vean diferenciadas
const PUNTUACIONES = [5, 4, 3, 5, 4, 4, 3, 5, 3, 4, 5, 4, 3, 5, 4]

function getWalletClient() {
  const pk = process.env.PRIVATE_KEY as `0x${string}`
  if (!pk) throw new Error("PRIVATE_KEY no definida en .env")
  return createWalletClient({
    chain: braga,
    transport: http(),
    account: privateKeyToAccount(pk),
  })
}

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

function buildAvalCreates(
  perfil: (typeof PERFILES_MOCK)[0],
  counterRef: { n: number }
) {
  const creates = []

  // Avales blandos: uno por cada ítem fijo
  for (const item of ITEMS_BLANDOS) {
    const puntuacion = PUNTUACIONES[counterRef.n % PUNTUACIONES.length]
    counterRef.n++
    const avalId = `aval-seed-${perfil.perfilId}-b-${item}`
    const aval = {
      avalId,
      avalado: perfil.perfilId,
      avalador: `avalador-${String(counterRef.n).padStart(3, "0")}`,
      brazo: "blando",
      objetivo: item,
      puntuacion,
      comentario: "",
      fecha: new Date().toISOString(),
    }
    creates.push({
      payload: jsonToPayload(aval),
      contentType: "application/json" as const,
      attributes: [
        { key: "app", value: "saltrust" },
        { key: "tipo", value: "aval" },
        { key: "avalado", value: perfil.perfilId },
        { key: "avalador", value: aval.avalador },
        { key: "brazo", value: "blando" },
        { key: "objetivo", value: item },
      ],
      expiresIn: ExpirationTime.fromDays(7),
    })
  }

  // Avales técnicos: uno por cada hito del perfil
  for (const hito of perfil.hitos) {
    const puntuacion = PUNTUACIONES[counterRef.n % PUNTUACIONES.length]
    counterRef.n++
    const avalId = `aval-seed-${perfil.perfilId}-t-${hito.id}`
    const aval = {
      avalId,
      avalado: perfil.perfilId,
      avalador: `avalador-${String(counterRef.n).padStart(3, "0")}`,
      brazo: "tecnico",
      objetivo: hito.id,
      puntuacion,
      comentario: "",
      fecha: new Date().toISOString(),
    }
    creates.push({
      payload: jsonToPayload(aval),
      contentType: "application/json" as const,
      attributes: [
        { key: "app", value: "saltrust" },
        { key: "tipo", value: "aval" },
        { key: "avalado", value: perfil.perfilId },
        { key: "avalador", value: aval.avalador },
        { key: "brazo", value: "tecnico" },
        { key: "objetivo", value: hito.id },
      ],
      expiresIn: ExpirationTime.fromDays(7),
    })
  }

  return creates
}

async function main() {
  const walletClient = getWalletClient()
  console.log("Iniciando seed en Arkiv Braga...\n")

  // 1. Crear los 12 perfiles en un único batch
  console.log(`1. Creando ${PERFILES_MOCK.length} perfiles en batch...`)
  try {
    await walletClient.mutateEntities({
      creates: PERFILES_MOCK.map(buildPerfilCreate),
    })
    console.log(`   OK: ${PERFILES_MOCK.length} perfiles creados\n`)
  } catch (err) {
    console.error("   ERROR creando perfiles:", err instanceof Error ? err.message : err)
    process.exit(1)
  }

  // 2. Crear avales de muestra: un batch por perfil
  const counter = { n: 1 }
  let totalAvales = 0

  console.log("2. Creando avales de muestra por perfil...")
  for (const perfil of PERFILES_MOCK) {
    const creates = buildAvalCreates(perfil, counter)
    try {
      await walletClient.mutateEntities({ creates })
      totalAvales += creates.length
      console.log(`   OK: ${perfil.nombre} — ${creates.length} avales (${ITEMS_BLANDOS.length} blandos + ${perfil.hitos.length} técnicos)`)
    } catch (err) {
      console.error(`   ERROR en avales de ${perfil.nombre}:`, err instanceof Error ? err.message : err)
    }
  }

  console.log(`\nSeed completado:`)
  console.log(`  Perfiles creados: ${PERFILES_MOCK.length}`)
  console.log(`  Avales creados:   ${totalAvales}`)
}

main().catch((err) => {
  console.error("\nError fatal en seed:", err instanceof Error ? err.message : err)
  process.exit(1)
})
