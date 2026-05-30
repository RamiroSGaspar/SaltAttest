import { useState } from "react"
import { useNavigate } from "react-router-dom"

type Hito = { id: string; texto: string }

export default function Registro() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState("")
  const [foto, setFoto] = useState("")
  const [rol, setRol] = useState("")
  const [area, setArea] = useState("")
  const [bio, setBio] = useState("")
  const [hitos, setHitos] = useState<Hito[]>([])
  const [enviando, setEnviando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState("")

  function agregarHito() {
    setHitos([...hitos, { id: `h${Date.now()}`, texto: "" }])
  }

  function actualizarHito(id: string, texto: string) {
    setHitos(hitos.map((h) => (h.id === id ? { ...h, texto } : h)))
  }

  function eliminarHito(id: string) {
    setHitos(hitos.filter((h) => h.id !== id))
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre || !rol || !area || !bio) {
      setError("Completá todos los campos obligatorios.")
      return
    }
    setEnviando(true)
    setError("")

    const perfilId = `perfil-${Date.now()}`
    const perfil = {
      perfilId,
      nombre,
      foto: foto || `https://i.pravatar.cc/300?u=${perfilId}`,
      rol,
      area,
      bio,
      verificado: false,
      hitos: hitos.filter((h) => h.texto.trim()),
    }

    try {
      const res = await fetch("/api/crear-perfil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(perfil),
      })
      if (!res.ok) throw new Error("Error del servidor")
      setExito(true)
      setTimeout(() => navigate(`/perfil/${perfilId}`), 2000)
    } catch {
      setError("No se pudo crear el perfil. Intentá de nuevo.")
    } finally {
      setEnviando(false)
    }
  }

  if (exito) {
    return (
      <div className="container-sm">
        <div className="exito-wrap">
          <div className="exito-icon">✓</div>
          <h2>Perfil creado</h2>
          <p>Redirigiendo a tu perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container-sm">
      <div className="registro-wrap">
        <h2>Crear perfil</h2>
        <p className="page-subtitle">Registrate en SaltaDev Trust para que la comunidad pueda avalarte.</p>

        <form onSubmit={enviar}>
          <div className="form-section" style={{ marginBottom: "1rem" }}>
            <div className="form-section-title">Datos básicos</div>
            <div className="form-section-label">Cuéntanos quién sos</div>

            <div className="campos-grid">
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input
                  className="form-input"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL de foto (opcional)</label>
                <input
                  className="form-input"
                  value={foto}
                  onChange={(e) => setFoto(e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Rol *</label>
                <input
                  className="form-input"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  placeholder="Ej: Backend Developer"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Área *</label>
                <input
                  className="form-input"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="Ej: Backend"
                  required
                />
              </div>

              <div className="form-group campo-full">
                <label className="form-label">Bio *</label>
                <textarea
                  className="form-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Contá en 2-3 oraciones qué hacés y qué te apasiona"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section" style={{ marginBottom: "1rem" }}>
            <div className="form-section-title">Hitos técnicos</div>
            <div className="form-section-label">Logros concretos que la comunidad puede avalar</div>

            {hitos.length === 0 && (
              <p className="no-hitos-hint">Sin hitos aún. Agregá tus logros más relevantes.</p>
            )}

            {hitos.map((hito) => (
              <div key={hito.id} className="hito-row">
                <input
                  className="form-input"
                  value={hito.texto}
                  onChange={(e) => actualizarHito(hito.id, e.target.value)}
                  placeholder="Ej: Lideré la migración a microservicios"
                />
                <button
                  type="button"
                  className="btn-remove-hito"
                  onClick={() => eliminarHito(hito.id)}
                >
                  ×
                </button>
              </div>
            ))}

            <button type="button" className="btn-add-hito" onClick={agregarHito}>
              + Agregar hito
            </button>
          </div>

          {error && (
            <div className="auto-aval-warning" style={{ marginBottom: "1rem" }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? "Creando perfil..." : "Crear perfil"}
          </button>
        </form>
      </div>
    </div>
  )
}
