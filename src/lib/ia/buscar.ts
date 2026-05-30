import type { Perfil, Reputacion } from "@/lib/arkiv/types"

export async function buscarConIA(
  query: string,
  perfiles: Perfil[],
  reputaciones: Record<string, Reputacion>
): Promise<{ ordenados: Perfil[]; presentacion: string; error?: string }> {
  try {
    const res = await fetch("/api/buscar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, perfiles, reputaciones }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({})) as { error?: string }
      return { ordenados: perfiles, presentacion: "", error: data.error ?? `Error del servidor (${res.status})` }
    }
    return res.json()
  } catch {
    return { ordenados: perfiles, presentacion: "", error: "No se pudo conectar con el servidor." }
  }
}
