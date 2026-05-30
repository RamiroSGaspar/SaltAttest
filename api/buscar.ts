import type { VercelRequest, VercelResponse } from "@vercel/node"
import type { Perfil, Reputacion } from "../src/lib/arkiv/types.js"

const KEYWORDS_TECNICAS = new Set([
  "técnico", "developer", "devops", "data", "código", "programar",
  "backend", "frontend", "mobile", "ios", "android", "qa", "testing", "infra",
  "cloud", "ml", "ia", "machine",
])

const KEYWORDS_BLANDAS = new Set([
  "comunidad", "comunicar", "mentor", "colaborar", "blando",
  "participar", "ayudar", "liderazgo", "soft",
])

function palabrasClave(query: string): string[] {
  return query.toLowerCase().split(/\s+/).filter((w) => w.length > 3)
}

function encaja(perfil: Perfil, keywords: string[]): boolean {
  const haystack = [
    perfil.rol,
    perfil.area,
    perfil.bio,
    ...perfil.hitos.map((h) => h.texto),
  ].join(" ").toLowerCase()
  return keywords.some((kw) => haystack.includes(kw))
}

function tipoRanking(queryLower: string): "tecnica" | "blanda" | "promedio" {
  if ([...KEYWORDS_TECNICAS].some((kw) => queryLower.includes(kw))) return "tecnica"
  if ([...KEYWORDS_BLANDAS].some((kw) => queryLower.includes(kw))) return "blanda"
  return "promedio"
}

function score(rep: Reputacion, tipo: "tecnica" | "blanda" | "promedio"): number {
  if (tipo === "tecnica") return rep.estrellasTecnicas
  if (tipo === "blanda") return rep.estrellasBlandas
  return (rep.estrellasBlandas + rep.estrellasTecnicas) / 2
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

  const rep = (p: Perfil): Reputacion =>
    reputaciones[p.perfilId] ?? {
      perfilId: p.perfilId, estrellasBlandas: 0, estrellasTecnicas: 0,
      detalleBlandas: [], detalleTecnicas: [],
    }

  // PASO 1 — Filtrado por código
  const keywords = palabrasClave(query)
  const filtrados = keywords.length > 0 && perfiles.some((p) => encaja(p, keywords))
    ? perfiles.filter((p) => encaja(p, keywords))
    : perfiles

  // PASO 2 — Ranking por código
  const tipo = tipoRanking(query.toLowerCase())
  const top4 = [...filtrados]
    .sort((a, b) => score(rep(b), tipo) - score(rep(a), tipo))
    .slice(0, 4)

  if (top4.length === 0) {
    return res.json({ ordenados: [], presentacion: "" })
  }

  // PASO 3 — Claude escribe solo la presentación
  const resumen = top4
    .map((p) => {
      const r = rep(p)
      return `- ${p.nombre} (${p.rol}): ★Blandas ${r.estrellasBlandas.toFixed(1)}, ★Técnicas ${r.estrellasTecnicas.toFixed(1)}`
    })
    .join("\n")

  const userMessage =
    `El usuario buscó: "${query}"\n\n` +
    `Resultados encontrados:\n${resumen}\n\n` +
    `Escribí 2-3 oraciones cálidas y naturales presentando estos resultados.`

  try {
    const apiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: "Escribí 2-3 oraciones presentando estos resultados de búsqueda de forma cálida y natural. SOLO el texto, sin JSON.",
        messages: [{ role: "user", content: userMessage }],
      }),
    })

    if (!apiRes.ok) {
      const errBody = await apiRes.text().catch(() => "")
      console.error(`Anthropic API error ${apiRes.status}: ${errBody}`)
      return res.json({ ordenados: top4, presentacion: "" })
    }

    const data = await apiRes.json()
    const presentacion: string = data.content?.[0]?.text ?? ""

    res.json({ ordenados: top4, presentacion })
  } catch (err) {
    console.error("Error en /api/buscar:", err instanceof Error ? err.message : err)
    res.json({ ordenados: top4, presentacion: "" })
  }
}
