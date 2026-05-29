import type { VercelRequest, VercelResponse } from "@vercel/node"
import type { Perfil, Reputacion } from "../src/lib/arkiv/types.js"

const SYSTEM_PROMPT = `Sos el buscador de SaltaDev. Analizá la búsqueda y devolvé SOLO los perfiles que realmente encajan con lo que se pide.
Si alguien busca "científico de datos", no incluyas backends ni diseñadores. No agregues perfiles irrelevantes solo para completar la lista.
Devolvé máximo 4-5 perfiles, mínimo 0 (si ninguno encaja, devolvé "orden": []).
Ordená de mayor a menor relevancia, priorizando a quienes tengan estrellas altas en el brazo relevante.
Respondé SOLO con un JSON válido, sin markdown ni texto extra:
{ "orden": ["perfilId1","perfilId2",...], "presentacion": "texto cálido de 2-3 oraciones presentando los resultados; si no hay coincidencias, decí amablemente que no encontraste perfiles que encajen con esa búsqueda" }`

function perfilATexto(perfil: Perfil, rep: Reputacion): string {
  const hitos = perfil.hitos.map((h) => h.texto).join(", ") || "ninguno"
  return (
    `- ID: ${perfil.perfilId}\n` +
    `  Nombre: ${perfil.nombre} | Rol: ${perfil.rol} | Área: ${perfil.area}\n` +
    `  Bio: ${perfil.bio}\n` +
    `  Hitos: ${hitos}\n` +
    `  ★ Blandas: ${rep.estrellasBlandas.toFixed(1)} | ★ Técnicas: ${rep.estrellasTecnicas.toFixed(1)}`
  )
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const { query, perfiles, reputaciones } = req.body as {
    query: string
    perfiles: Perfil[]
    reputaciones: Record<string, Reputacion>
  }

  const fallback = { ordenados: perfiles, presentacion: "" }

  try {
    const candidatos = perfiles
      .map((p) =>
        perfilATexto(p, reputaciones[p.perfilId] ?? {
          perfilId: p.perfilId, estrellasBlandas: 0, estrellasTecnicas: 0,
          detalleBlandas: [], detalleTecnicas: [],
        })
      )
      .join("\n\n")

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: `Búsqueda: "${query}"\n\nPerfiles disponibles:\n${candidatos}` }],
      }),
    })

    if (!apiRes.ok) return res.json(fallback)

    const data = await apiRes.json()
    const texto: string = data.content?.[0]?.text ?? ""
    const parsed = JSON.parse(texto) as { orden: string[]; presentacion: string }

    const porId = new Map(perfiles.map((p) => [p.perfilId, p]))
    const ordenados = parsed.orden
      .map((id) => porId.get(id))
      .filter((p): p is Perfil => p !== undefined)

    res.json({ ordenados, presentacion: parsed.presentacion ?? "" })
  } catch {
    res.json(fallback)
  }
}
