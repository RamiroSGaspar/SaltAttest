import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { TarjetaPerfil } from "@/components/TarjetaPerfil"
import type { Perfil, Reputacion } from "@/lib/arkiv/types"
import { buscarConIA } from "@/lib/ia/buscar"

export default function Inicio() {
  const [query, setQuery] = useState("")
  const [resultados, setResultados] = useState<Perfil[] | null>(null)
  const [reputaciones, setReputaciones] = useState<Record<string, Reputacion>>({})
  const [presentacion, setPresentacion] = useState("")
  const [buscando, setBuscando] = useState(false)
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null)
  const navigate = useNavigate()

  async function buscar() {
    if (buscando) return
    setBuscando(true)
    setPresentacion("")
    setResultados(null)
    setErrorBusqueda(null)

    const apiRes = await fetch("/api/perfiles").catch(() => null)
    const { perfiles, reputaciones: reps } = apiRes?.ok
      ? await apiRes.json()
      : { perfiles: [], reputaciones: {} }

    setReputaciones(reps)

    const { ordenados, presentacion: texto, error } = await buscarConIA(query, perfiles, reps)
    setResultados(ordenados)
    setPresentacion(texto)
    setErrorBusqueda(error ?? null)
    setBuscando(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") buscar()
  }

  return (
    <div className="container">
      <section className="hero-section">
        <h1>Encontrá a la persona indicada <span>en SaltaDev</span></h1>
        <p>Reputación verificable por la comunidad. Buscá en lenguaje natural y confiá en que quien encontrás realmente sabe.</p>
      </section>

      <div className="search-wrapper">
        <input
          type="text"
          className="search-bar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder='Ej: "busco un científico de datos con experiencia en visión por computadora"'
          disabled={buscando}
        />
        <span className="search-icon">🔍</span>
        <button className="search-btn" onClick={buscar} disabled={buscando}>
          {buscando ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {buscando && (
        <div className="spinner-wrap">
          <div className="spinner" />
          <p>Claude está analizando los perfiles...</p>
        </div>
      )}

      {!buscando && errorBusqueda && (
        <div className="error-busqueda">
          <p>{errorBusqueda}</p>
        </div>
      )}

      {!buscando && resultados === null && !errorBusqueda && (
        <div className="empty-state">
          <p>Ingresá un término y hacé click en Buscar.</p>
        </div>
      )}

      {!buscando && resultados !== null && resultados.length === 0 && (
        <div className="empty-state">
          <p>No se encontraron perfiles para esa búsqueda.</p>
        </div>
      )}

      {!buscando && resultados !== null && resultados.length > 0 && (
        <>
          {presentacion && (
            <div className="ia-presentacion">{presentacion}</div>
          )}
          <p className="results-label">{resultados.length} resultado{resultados.length !== 1 ? "s" : ""}</p>
          <div className="cards-grid">
            {resultados.map((perfil) => (
              <button
                key={perfil.perfilId}
                onClick={() => navigate(`/perfil/${perfil.perfilId}`)}
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", width: "100%", textAlign: "left" }}
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
        </>
      )}
    </div>
  )
}
