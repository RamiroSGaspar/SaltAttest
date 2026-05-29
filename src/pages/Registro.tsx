import { useState } from "react"

type Estado = "idle" | "enviando" | "exito"

interface FormData {
  nombre: string
  foto: string
  rol: string
  area: string
  bio: string
  hitos: string[]
}

const EMPTY: FormData = { nombre: "", foto: "", rol: "", area: "", bio: "", hitos: [] }

export default function Registro() {
  const [form, setForm] = useState<FormData>(EMPTY)
  const [estado, setEstado] = useState<Estado>("idle")

  function set(field: keyof Omit<FormData, "hitos">, value: string) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function agregarHito() {
    setForm((f) => ({ ...f, hitos: [...f.hitos, ""] }))
  }

  function actualizarHito(i: number, value: string) {
    setForm((f) => {
      const hitos = [...f.hitos]
      hitos[i] = value
      return { ...f, hitos }
    })
  }

  function quitarHito(i: number) {
    setForm((f) => ({ ...f, hitos: f.hitos.filter((_, idx) => idx !== i) }))
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setEstado("enviando")
    await fetch("/api/crear-perfil", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        hitos: form.hitos
          .filter((h) => h.trim())
          .map((texto, i) => ({ id: `hito-${i + 1}`, texto })),
      }),
    })
    setEstado("exito")
  }

  if (estado === "exito") {
    return (
      <div className="container-sm">
        <div className="exito-wrap">
          <div className="exito-icon">🎉</div>
          <h2>¡Perfil creado!</h2>
          <p>Ya podés recibir avales de la comunidad.</p>
          <button
            className="btn-primary"
            style={{ maxWidth: 240, margin: "0 auto" }}
            onClick={() => { setForm(EMPTY); setEstado("idle") }}
          >
            Crear otro perfil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container-sm">
      <div className="registro-wrap">
        <h2>Crear perfil</h2>
        <p className="page-subtitle">Registrate en SaltAttest para que la comunidad pueda avalarte.</p>

        <form onSubmit={enviar}>
          <div className="form-section" style={{ marginBottom: "1rem" }}>
            <div className="form-section-title">Datos básicos</div>

            <div className="campos-grid" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input
                  required
                  className="form-input"
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  placeholder="Ada Lovelace"
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL de foto</label>
                <input
                  type="url"
                  className="form-input"
                  value={form.foto}
                  onChange={(e) => set("foto", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rol *</label>
                <input
                  required
                  className="form-input"
                  value={form.rol}
                  onChange={(e) => set("rol", e.target.value)}
                  placeholder="Backend Developer"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Área *</label>
                <input
                  required
                  className="form-input"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  placeholder="Backend"
                />
              </div>
              <div className="form-group campo-full">
                <label className="form-label">Bio</label>
                <textarea
                  className="form-textarea"
                  value={form.bio}
                  onChange={(e) => set("bio", e.target.value)}
                  placeholder="Contá brevemente a qué te dedicás..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="form-section" style={{ marginBottom: "1.5rem" }}>
            <div className="form-section-title">Hitos / Logros</div>
            <p className="no-hitos-hint" style={{ marginTop: "0.75rem" }}>
              Agregá logros técnicos que la comunidad puede avalar.
            </p>
            {form.hitos.map((hito, i) => (
              <div key={i} className="hito-row">
                <input
                  className="form-input"
                  value={hito}
                  onChange={(e) => actualizarHito(i, e.target.value)}
                  placeholder={`Logro ${i + 1}...`}
                />
                <button
                  type="button"
                  className="btn-remove-hito"
                  onClick={() => quitarHito(i)}
                  aria-label="Quitar logro"
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" className="btn-add-hito" onClick={agregarHito}>
              + Agregar logro
            </button>
          </div>

          <button type="submit" className="btn-primary" disabled={estado === "enviando"}>
            {estado === "enviando" ? "Creando..." : "Crear perfil"}
          </button>
        </form>
      </div>
    </div>
  )
}
