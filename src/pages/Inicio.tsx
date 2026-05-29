import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { TarjetaPerfil } from "@/components/TarjetaPerfil"
import type { Perfil, Reputacion } from "@/lib/arkiv/types"

const PERFILES_MOCK: Perfil[] = [
  {
    perfilId: "perfil-001",
    nombre: "María Gómez",
    foto: "https://i.pravatar.cc/300?img=47",
    rol: "Científica de Datos",
    area: "Data Science",
    bio: "Modelos de visión por computadora.",
    verificado: true,
    hitos: [
      { id: "h1", texto: "Charla sobre ML en meetup" },
      { id: "h2", texto: "Lideró modelo de fraude" },
    ],
  },
  {
    perfilId: "perfil-002",
    nombre: "Juan Pérez",
    foto: "https://i.pravatar.cc/300?img=12",
    rol: "Backend Developer",
    area: "Backend",
    bio: "Go y sistemas distribuidos.",
    verificado: true,
    hitos: [{ id: "h3", texto: "Migró el sistema a microservicios" }],
  },
]

const REPUTACIONES_MOCK: Record<string, Reputacion> = {
  "perfil-001": { perfilId: "perfil-001", estrellasBlandas: 4.2, estrellasTecnicas: 4.7 },
  "perfil-002": { perfilId: "perfil-002", estrellasBlandas: 4.8, estrellasTecnicas: 3.5 },
}

export default function Inicio() {
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<Perfil[] | null>(null)
  const navigate = useNavigate()

  function buscar() {
    // TODO: reemplazar por traerPerfiles() de Arkiv
    setResultados(PERFILES_MOCK)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") buscar()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">SaltaDev Trust</h1>
        <p className="text-muted-foreground">Encontrá perfiles verificados por la comunidad</p>
      </div>

      {/* Buscador */}
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Buscá por nombre, área o rol..."
          className="flex-1 h-12 rounded-lg border border-border bg-background px-4 text-base outline-none focus:ring-2 focus:ring-primary/30 transition"
        />
        <button
          onClick={buscar}
          className="h-12 px-5 rounded-lg bg-primary text-primary-foreground font-medium flex items-center gap-2 hover:bg-primary/90 transition"
        >
          <Search className="h-4 w-4" />
          Buscar
        </button>
      </div>

      {/* Resultados */}
      {resultados === null && (
        <p className="text-center text-muted-foreground text-sm pt-4">
          Ingresá un término y hacé click en Buscar.
        </p>
      )}

      {resultados !== null && resultados.length === 0 && (
        <p className="text-center text-muted-foreground text-sm pt-4">
          No se encontraron perfiles.
        </p>
      )}

      {resultados !== null && resultados.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {resultados.map((perfil) => (
            <button
              key={perfil.perfilId}
              onClick={() => navigate(`/perfil/${perfil.perfilId}`)}
              className="text-left focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg"
            >
              <TarjetaPerfil
                perfil={perfil}
                reputacion={REPUTACIONES_MOCK[perfil.perfilId] ?? { perfilId: perfil.perfilId, estrellasBlandas: 0, estrellasTecnicas: 0 }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
