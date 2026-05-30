import type { VercelRequest, VercelResponse } from "@vercel/node"
import type { Perfil, Reputacion } from "../src/lib/arkiv/types.js"

const SYSTEM_PROMPT = `Sos el buscador de SaltaDev. El usuario busca a alguien con características específicas. Analizá cada candidato y devolvé SOLO los que realmente encajan.

REGLAS ESTRICTAS:
1. Filtrá por ROL y ÁREA primero. Si buscan 'data science', solo devolvés Data Scientists. Si buscan 'devops', solo DevOps. Si buscan 'frontend', solo Frontend Developers.
2. Dentro de los que encajan por rol, ordená por la estrella más relevante:
   - Si la búsqueda pide alguien técnico/especialista → ordenar por ★Técnicas desc.
   - Si pide comunicador/mentor/comunidad → ordenar por ★Blandas desc.
   - Si es ambiguo → ordenar por promedio de ambas estrellas desc.
3. Devolvé MÁXIMO 3-4 perfiles, MÍNIMO 0. Si nadie encaja, devolvé [].
4. NUNCA incluyas perfiles de un área diferente a la buscada.
5. Respondé SOLO con JSON válido sin markdown:
   { "orden": ["perfilId1","perfilId2",...], "presentacion": "texto cálido de 2-3 oraciones presentando los resultados y por qué encajan" }`

function perfilALinea(perfil: Perfil, rep: Reputacion): string {
  const hitos = perfil.hitos.map((h) => h.texto).join(", ") || "ninguno"
  return `- ${perfil.perfilId} | ${perfil.nombre} | Rol: ${perfil.rol} | Área: ${perfil.area} | ★Blandas: ${rep.estrellasBlandas.toFixed(1)} | ★Técnicas: ${rep.estrellasTecnicas.toFixed(1)} | Hitos: ${hitos}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end()

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY no configurada en el entorno")
    return res.status(500).json({ error: "ANTHROPIC_API_KEY no configurada" })
  }

  const { query, perfiles, reputaciones } = req.body as {
    query: string
    perfiles: Perfil[]
    reputaciones: Record<string, Reputacion>
  }

  const fallback = { ordenados: perfiles, presentacion: "" }

  try {
    const candidatos = perfiles
      .map((p) =>
        perfilALinea(p, reputaciones[p.perfilId] ?? {
          perfilId: p.perfilId, estrellasBlandas: 0, estrellasTecnicas: 0,
          detalleBlandas: [], detalleTecnicas: [],
        })
      )
      .join("\n")

    const userMessage =
      `Búsqueda: "${query}"\n\n` +
      `Candidatos disponibles:\n${candidatos}\n\n` +
      `Si la búsqueda es muy ambigua o genérica (sin rol claro), devolvé los 4 con mejor promedio de ★Blandas y ★Técnicas.`

    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    })

    if (!apiRes.ok) {
      const errBody = await apiRes.text().catch(() => "")
      console.error(`Anthropic API error ${apiRes.status}: ${errBody}`)
      return res.json(fallback)
    }

    const data = await apiRes.json()
    const texto: string = data.content?.[0]?.text ?? ""

    let parsed: { orden: string[]; presentacion: string }
    try {
      parsed = JSON.parse(texto)
    } catch (parseErr) {
      console.error("Error parseando respuesta de Claude:", parseErr, "| texto recibido:", texto)
      return res.json(fallback)
    }

    const porId = new Map(perfiles.map((p) => [p.perfilId, p]))
    const ordenados = parsed.orden
      .map((id) => porId.get(id))
      .filter((p): p is Perfil => p !== undefined)

    res.json({ ordenados, presentacion: parsed.presentacion ?? "" })
  } catch (err) {
    console.error("Error en /api/buscar:", err instanceof Error ? err.message : err)
    res.json(fallback)
  }
}
