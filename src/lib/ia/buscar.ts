import type { Perfil, Reputacion } from "@/lib/arkiv/types"

export async function buscarConIA(
  query: string,
  perfiles: Perfil[],
  reputaciones: Record<string, Reputacion>
): Promise<{ ordenados: Perfil[]; presentacion: string }> {
  const fallback = { ordenados: perfiles, presentacion: "" }
  try {
    const res = await fetch("/api/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, perfiles, reputaciones }),
    })
    if (!res.ok) return fallback
    return res.json()
  } catch {
    return fallback
  }
}
