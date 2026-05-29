import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { LABEL_ITEM_BLANDO } from "@/lib/mocks"
import type { Perfil as TPerfil, Reputacion } from "@/lib/arkiv/types"

function Estrellas({ valor, colorClass }: { valor: number; colorClass: "azul" | "" }) {
  return (
    <div className="estrellas-row">
      {[1, 2, 3, 4, 5].map((i) => {
        const llena = i <= Math.floor(valor)
        const media = !llena && i === Math.ceil(valor) && valor % 1 >= 0.25
        return (
          <span
            key={i}
            className={`estrella-icon${llena || media ? ` llena${colorClass ? ` ${colorClass}` : ""}` : ""}`}
            style={media ? { opacity: 0.55 } : undefined}
          >
            ★
          </span>
        )
      })}
      <span className={`estrella-numero ${colorClass === "azul" ? "blando" : "tecnico"}`}>
        {valor.toFixed(1)}
      </span>
    </div>
  )
}

export default function Perfil() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState<TPerfil | null>(null)
  const [rep, setRep] = useState<Reputacion | null>(null)
  const [cargando, setCargando] = useState(true)
  const [noEncontrado, setNoEncontrado] = useState(false)

  useEffect(() => {
    if (!id) return
    setCargando(true)
    setNoEncontrado(false)

    Promise.all([
      fetch(`/api/perfil/${id}`),
      fetch(`/api/avales/${id}`),
    ])
      .then(async ([perfilRes]) => {
        if (!perfilRes.ok) { setNoEncontrado(true); return }
        const { perfil: p, reputacion: r } = await perfilRes.json()
        setPerfil(p)
        setRep(r)
      })
      .catch(() => setNoEncontrado(true))
      .finally(() => setCargando(false))
  }, [id])

  if (cargando) {
    return (
      <div className="spinner-wrap" style={{ paddingTop: "5rem" }}>
        <div className="spinner" />
        <p>Cargando perfil...</p>
      </div>
    )
  }

  if (noEncontrado || !perfil || !rep) {
    return (
      <div className="not-found-wrap">
        <p>Perfil no encontrado.</p>
        <button className="btn-ghost" onClick={() => navigate("/")}>
          ← Volver al buscador
        </button>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 760 }}>
      <button className="back-link" onClick={() => navigate("/")}>
        ← Volver al buscador
      </button>

      <div className="perfil-header">
        <img
          className="perfil-foto-grande"
          src={perfil.foto}
          alt={perfil.nombre}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://i.pravatar.cc/300?img=1" }}
        />
        <div className="perfil-datos">
          <h1>
            {perfil.nombre}
            {perfil.verificado && (
              <div className="badge-verificado" title="Verificado">✓</div>
            )}
          </h1>
          <div className="perfil-rol-line">{perfil.rol}</div>
          <div className="perfil-area-line">{perfil.area}</div>
          <div className="perfil-bio-line">{perfil.bio}</div>
        </div>
      </div>

      <div className="perfil-estrellas-grande">
        <div className="estrella-bloque-grande">
          <div className="estrella-label blando">
            <span className="dot" />
            Habilidades Blandas
          </div>
          <Estrellas valor={rep.estrellasBlandas} colorClass="azul" />
        </div>
        <div className="estrella-bloque-grande">
          <div className="estrella-label tecnico">
            <span className="dot" />
            Habilidades Técnicas
          </div>
          <Estrellas valor={rep.estrellasTecnicas} colorClass="" />
        </div>
      </div>

      {rep.detalleBlandas.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="seccion-titulo">
            <span className="icon">◆</span> Detalle de habilidades blandas
          </div>
          {rep.detalleBlandas.map((d) => (
            <div key={d.item} className="detalle-blando-row">
              <span className="item-name">{LABEL_ITEM_BLANDO[d.item] ?? d.item}</span>
              <Estrellas valor={d.promedio} colorClass="azul" />
            </div>
          ))}
        </div>
      )}

      {perfil.hitos.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="seccion-titulo">
            <span className="icon">◆</span> Hitos y logros
          </div>
          {perfil.hitos.map((hito) => {
            const detalle = rep.detalleTecnicas.find((d) => d.hitoId === hito.id)
            return (
              <div key={hito.id} className="hito-item">
                <div className="hito-item-text">
                  <span className="dot" />
                  {hito.texto}
                </div>
                {detalle ? (
                  <div className="hito-item-avg">★ {detalle.promedio.toFixed(1)}</div>
                ) : (
                  <div className="hito-item-avg" style={{ color: "var(--text-muted)" }}>—</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="section-divider" />

      <div style={{ marginBottom: "1.5rem" }}>
        <div className="seccion-titulo">
          <span className="icon" style={{ color: "var(--accent-secondary)" }}>◆</span>
          Comentarios de avaladores
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          Todavía no hay comentarios.
        </p>
      </div>

      <button className="btn-avalar-perfil" onClick={() => navigate(`/avalar?avalado=${perfil.perfilId}`)}>
        Avalar a {perfil.nombre.split(" ")[0]}
      </button>
    </div>
  )
}
