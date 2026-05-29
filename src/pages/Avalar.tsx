import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { PERFILES_MOCK } from "@/lib/mocks"
import type { Perfil } from "@/lib/arkiv/types"

const ITEMS_BLANDOS: { key: string; label: string }[] = [
  { key: "comunicacion", label: "Comunicación" },
  { key: "colaboracion", label: "Colaboración" },
  { key: "participacion", label: "Participación" },
  { key: "ayuda", label: "Ayuda" },
  { key: "liderazgo", label: "Liderazgo" },
]

function SelectorPerfil({
  value,
  onChange,
  excluir,
}: {
  value: string
  onChange: (id: string) => void
  excluir?: string
}) {
  return (
    <div>
      {PERFILES_MOCK.filter((p) => p.perfilId !== excluir).map((perfil) => (
        <button
          key={perfil.perfilId}
          onClick={() => onChange(perfil.perfilId)}
          className={`perfil-btn-select${value === perfil.perfilId ? " selected" : ""}`}
        >
          <img src={perfil.foto} alt={perfil.nombre} onError={(e) => { (e.target as HTMLImageElement).src = "https://i.pravatar.cc/300?img=1" }} />
          <div>
            <div className="ps-nombre">{perfil.nombre}</div>
            <div className="ps-rol">{perfil.rol}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="star-picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={`star-btn${(hover || value) >= n ? " active" : ""}`}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

type Estado = "idle" | "enviando" | "exito"

export default function Avalar() {
  const [searchParams] = useSearchParams()
  const [avalado, setAvalado] = useState(searchParams.get("avalado") ?? "")
  const [avalador, setAvalador] = useState("")
  const [brazo, setBrazo] = useState<"blando" | "tecnico" | "">("")
  const [objetivo, setObjetivo] = useState("")
  const [puntuacion, setPuntuacion] = useState(0)
  const [comentario, setComentario] = useState("")
  const [estado, setEstado] = useState<Estado>("idle")

  const perfilAvalado: Perfil | undefined = PERFILES_MOCK.find((p) => p.perfilId === avalado)
  const autoAval = avalado !== "" && avalador !== "" && avalado === avalador

  function seleccionarAvalado(id: string) {
    setAvalado(id)
    setBrazo("")
    setObjetivo("")
    setPuntuacion(0)
    if (avalador === id) setAvalador("")
  }

  function seleccionarBrazo(b: "blando" | "tecnico") {
    setBrazo(b)
    setObjetivo("")
    setPuntuacion(0)
  }

  async function enviar() {
    setEstado("enviando")
    await fetch("/api/avalar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        avalId: `aval-${Date.now()}`,
        avalado,
        avalador,
        brazo,
        objetivo,
        puntuacion,
        comentario,
        fecha: new Date().toISOString(),
      }),
    })
    setEstado("exito")
  }

  if (estado === "exito") {
    return (
      <div className="container-sm">
        <div className="exito-wrap">
          <div className="exito-icon">✅</div>
          <h2>¡Aval registrado!</h2>
          <p>Tu aval quedó registrado de forma verificable en la red.</p>
          <button
            className="btn-primary"
            style={{ maxWidth: 260, margin: "0 auto" }}
            onClick={() => {
              setAvalado(""); setAvalador(""); setBrazo(""); setObjetivo("")
              setPuntuacion(0); setComentario(""); setEstado("idle")
            }}
          >
            Emitir otro aval
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container avalar-container">
      <div className="avalar-wrap">
        <h2>Emitir un aval</h2>
        <p className="page-subtitle">Respalda a un miembro de la comunidad. Tu aval queda registrado de forma verificable.</p>

        <div className={`avalar-selectors${avalado ? " dos-columnas" : ""}`}>
          <div className="form-section">
            <div className="form-section-title">Paso 1</div>
            <div className="form-section-label">¿A quién avalás?</div>
            <SelectorPerfil value={avalado} onChange={seleccionarAvalado} />
          </div>

          {avalado && (
            <div className="form-section">
              <div className="form-section-title">Paso 2</div>
              <div className="form-section-label">¿Quién sos?</div>
              <SelectorPerfil value={avalador} onChange={setAvalador} excluir={avalado} />
              {autoAval && (
                <div className="auto-aval-warning">No podés avalarte a vos mismo.</div>
              )}
            </div>
          )}
        </div>

        {avalado && avalador && !autoAval && (
          <div className="form-section">
            <div className="form-section-title">Paso 3</div>
            <div className="form-section-label">¿Qué tipo de aval?</div>
            <div className="brazo-selector">
              <div
                className={`brazo-option${brazo === "blando" ? " selected-blando" : ""}`}
                onClick={() => seleccionarBrazo("blando")}
              >
                <span className="brazo-icon">🤝</span>
                <span className="brazo-label">Blandas</span>
              </div>
              <div
                className={`brazo-option${brazo === "tecnico" ? " selected-tecnico" : ""}`}
                onClick={() => seleccionarBrazo("tecnico")}
              >
                <span className="brazo-icon">⚙️</span>
                <span className="brazo-label">Técnicas</span>
              </div>
            </div>
          </div>
        )}

        {brazo && (
          <div className="form-section">
            <div className="form-section-title">Paso 4</div>
            <div className="form-section-label">
              {brazo === "blando" ? "¿Qué habilidad avalás?" : "¿Qué hito avalás?"}
            </div>
            <div className="items-grid">
              {brazo === "blando"
                ? ITEMS_BLANDOS.map((item) => (
                    <button
                      key={item.key}
                      className={`item-btn${objetivo === item.key ? " selected" : ""}`}
                      onClick={() => { setObjetivo(item.key); setPuntuacion(0) }}
                    >
                      {item.label}
                    </button>
                  ))
                : (perfilAvalado?.hitos ?? []).map((hito) => (
                    <button
                      key={hito.id}
                      className={`item-btn${objetivo === hito.id ? " selected" : ""}`}
                      onClick={() => { setObjetivo(hito.id); setPuntuacion(0) }}
                    >
                      {hito.texto}
                    </button>
                  ))}
              {brazo === "tecnico" && perfilAvalado?.hitos.length === 0 && (
                <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  Este perfil no tiene hitos técnicos.
                </p>
              )}
            </div>
          </div>
        )}

        {objetivo && (
          <div className="form-section">
            <div className="form-section-title">Paso 5</div>
            <div className="form-section-label">Puntuación</div>
            <div className="form-group">
              <StarPicker value={puntuacion} onChange={setPuntuacion} />
            </div>
            {puntuacion > 0 && (
              <>
                <div className="form-group">
                  <label className="form-label">Comentario (opcional)</label>
                  <textarea
                    className="form-textarea"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Contá por qué avalás esto..."
                  />
                </div>
                <button
                  className="btn-primary"
                  onClick={enviar}
                  disabled={estado === "enviando"}
                >
                  {estado === "enviando" ? "Enviando..." : "Enviar aval →"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
