import "dotenv/config"
import { createWalletClient, createPublicClient, http } from "@arkiv-network/sdk"
import { privateKeyToAccount } from "@arkiv-network/sdk/accounts"
import { braga } from "@arkiv-network/sdk/chains"
import { jsonToPayload, ExpirationTime } from "@arkiv-network/sdk/utils"

const privateKey = process.env.PRIVATE_KEY as `0x${string}`
if (!privateKey) throw new Error("PRIVATE_KEY no encontrada en .env")

const account = privateKeyToAccount(privateKey)

const walletClient = createWalletClient({
  chain: braga,
  transport: http(),
  account,
})

const publicClient = createPublicClient({
  chain: braga,
  transport: http(),
})

async function main() {
  console.log("Cuenta:", account.address)

  // 1. Crear entidad de prueba
  console.log("\nCreando entidad de prueba en Braga...")
  const { entityKey, txHash } = await walletClient.createEntity({
    payload: jsonToPayload({ mensaje: "hola arkiv" }),
    contentType: "application/json",
    attributes: [
      { key: "app", value: "saltrust" },
      { key: "tipo", value: "test" },
    ],
    expiresIn: ExpirationTime.fromMinutes(30),
  })

  console.log("entityKey:", entityKey)
  console.log("txHash:   ", txHash)

  // 2. Leer la entidad de vuelta
  console.log("\nLeyendo entidad de vuelta con getEntity...")
  const entity = await publicClient.getEntity(entityKey)
  console.log("Contenido:", entity.toJson())
}

main().catch((err) => {
  console.error("Error:", err)
  process.exit(1)
})
