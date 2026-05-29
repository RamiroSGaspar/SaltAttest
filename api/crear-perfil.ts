import type { VercelRequest, VercelResponse } from "@vercel/node"

// TODO: reemplazar con crearPerfil() de Arkiv usando WalletClient
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end()
  res.json({ perfilId: "mock-nuevo" })
}
