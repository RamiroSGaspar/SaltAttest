import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, Loader2 } from "lucide-react"
import { TarjetaPerfil } from "@/components/TarjetaPerfil"
import type { Perfil, Reputacion } from "@/lib/arkiv/types"
import { buscarConIA } from "@/lib/ia/buscar"

export default function Inicio() {
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<Perfil[] | null>(null)
  const [reputaciones, setReputaciones] = useState<Record<string, Reputacion>>({})
  const [presentacion, setPresentacion] = useState("")
  const [buscando, setBuscando] = useState(false)
  const navigate = useNavigate()

  async function buscar() {
    if (buscando) return
    setBuscando(true)
    setPresentacion("")
    setResultados(null)

    // TODO: GET /api/perfiles llama a traerPerfiles() de Arkiv cuando esté listo
    const apiRes = await fetch("/api/perfiles").catch(() => null)
    const { perfiles, reputaciones: reps } = apiRes?.ok
      ? await apiRes.json()
      : { perfiles: [], reputaciones: {} }

    setReputaciones(reps)

    const { ordenados, presentacion: texto } = await buscarConIA(query, perfiles, reps)
    setResultados(ordenados)
    setPresentacion(texto)
    setBuscando(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") buscar()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SaltaDev Trust</h1>
        <p className="text-muted-foreground">Encontrá perfiles verificados por la comunidad</p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscá por nombre, área o rol..."
          disabled={buscando}
          className="flex-1 h-12 rounded-lg border border-border bg-background px-4 text-base outline-none focus:ring-2 focus:ring-primary/30 transition disabled:opacity-50"
        />
        <button
          onClick={buscar}
          disabled={buscando}
          className="h-12 px-5 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition disabled:opacity-60"
        >
          {buscando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {buscando && (
        <div className="flex flex-col items-center gap-3 py-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">Claude está analizando los perfiles...</p>
        </div>
      )}

      {!buscando && resultados === null && (
        <p className="text-center text-muted-foreground text-sm pt-4">
          Ingresá un término y hacé click en Buscar.
        </p>
      )}

      {!buscando && resultados !== null && resultados.length === 0 && (
        <p className="text-center text-muted-foreground text-sm pt-4">No se encontraron perfiles.</p>
      )}

      {!buscando && resultados !== null && resultados.length > 0 && (
        <div className="space-y-5">
          {presentacion && (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3 leading-relaxed">
              {presentacion}
            </p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resultados.map((perfil) => (
              <button
                key={perfil.perfilId}
                onClick={() => navigate(`/perfil/${perfil.perfilId}`)}
                className="text-left focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg"
              >
                <TarjetaPerfil
                  perfil={perfil}
                  reputacion={
                    reputaciones[perfil.perfilId] ?? {
                      perfilId: perfil.perfilId,
                      estrellasBlandas: 0,
                      estrellasTecnicas: 0,
                      detalleBlandas: [],
                      detalleTecnicas: [],
                    }
                  }
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
