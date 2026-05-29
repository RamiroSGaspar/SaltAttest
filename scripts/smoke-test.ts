import "dotenv/config"
import { crearPerfil, crearAval, traerPerfil, traerAvales, calcularEstrellas } from "../src/lib/arkiv/index"

async function main() {
  const perfilId = `perfil-smoke-${Date.now()}`
  const avalId = `aval-smoke-${Date.now()}`

  // 1. Crear perfil de prueba
  console.log("1. Creando perfil de prueba...")
  await crearPerfil({
    perfilId,
    nombre: "Ada Lovelace",
    foto: "",
    rol: "Desarrolladora",
    area: "Backend",
    bio: "Perfil de smoke test",
    verificado: false,
    hitos: [{ id: "hito-1", texto: "Armó el primer algoritmo" }],
  })
  console.log("   perfilId:", perfilId)

  // 2. Crear aval de prueba
  console.log("\n2. Creando aval de prueba...")
  await crearAval({
    avalId,
    avalado: perfilId,
    avalador: "perfil-evaluador",
    brazo: "blando",
    objetivo: "comunicacion",
    puntuacion: 4,
    comentario: "Muy clara explicando conceptos",
    fecha: new Date().toISOString(),
  })
  console.log("   avalId:", avalId)

  // 3. Leer perfil de vuelta
  console.log("\n3. Leyendo perfil de Arkiv...")
  const perfil = await traerPerfil(perfilId)
  console.log("   Perfil:", JSON.stringify(perfil, null, 2))

  // 4. Leer avales
  console.log("\n4. Leyendo avales...")
  const avales = await traerAvales(perfilId)
  console.log("   Avales encontrados:", avales.length)

  // 5. Calcular estrellas
  console.log("\n5. Calculando estrellas...")
  const rep = calcularEstrellas(avales)
  console.log("   Reputacion:", rep)
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
