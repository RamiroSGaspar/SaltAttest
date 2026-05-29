import type { Perfil, Reputacion } from "@/lib/arkiv/types"

const SYSTEM_PROMPT = `Sos el buscador de la red SaltaDev. Te dan una lista de perfiles y una búsqueda.
Respondé SOLO con un JSON válido, sin markdown ni texto extra:
{ "orden": ["perfilId1","perfilId2",...], "presentacion": "texto cálido de 2-3 oraciones presentando los resultados" }.
Priorizá a quienes mejor encajan con la búsqueda y tengan estrellas altas en el brazo relevante.`

function perfilATexto(perfil: Perfil, rep: Reputacion): string {
  const hitos = perfil.hitos.map((h) => h.texto).join(", ") || "ninguno"
  return (
    `- ID: ${perfil.perfilId}\n` +
    `  Nombre: ${perfil.nombre}\n` +
    `  Rol: ${perfil.rol} | Área: ${perfil.area}\n` +
    `  Bio: ${perfil.bio}\n` +
    `  Hitos: ${hitos}\n` +
    `  ★ Blandas: ${rep.estrellasBlandas.toFixed(1)} | ★ Técnicas: ${rep.estrellasTecnicas.toFixed(1)}`
  )
}

export async function buscarConIA(
  query: string,
  perfiles: Perfil[],
  reputaciones: Record<string, Reputacion>
): Promise<{ ordenados: Perfil[]; presentacion: string }> {
  const fallback = { ordenados: perfiles, presentacion: "" }

  try {
    const candidatos = perfiles
      .map((p) => perfilATexto(p, reputaciones[p.perfilId] ?? { perfilId: p.perfilId, estrellasBlandas: 0, estrellasTecnicas: 0, detalleBlandas: [], detalleTecnicas: [] }))
      .join("\n\n")

    const userMessage = `Búsqueda: "${query}"\n\nPerfiles disponibles:\n${candidatos}`

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY ?? "",
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    })

    if (!res.ok) return fallback

    const data = await res.json()
    const texto: string = data.content?.[0]?.text ?? ""
    const parsed = JSON.parse(texto) as { orden: string[]; presentacion: string }

    const ordenMap = new Map(parsed.orden.map((id, i) => [id, i]))
    const ordenados = [...perfiles].sort((a, b) => {
      const ia = ordenMap.get(a.perfilId) ?? Infinity
      const ib = ordenMap.get(b.perfilId) ?? Infinity
      return ia - ib
    })

    return { ordenados, presentacion: parsed.presentacion ?? "" }
  } catch {
    return fallback
  }
}
