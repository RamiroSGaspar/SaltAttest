import { useState } from "react"
import { PlusCircle, X } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

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

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  )
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition"

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
    // TODO: reemplazar por crearPerfil() de Arkiv
    await new Promise((r) => setTimeout(r, 1000))
    setEstado("exito")
  }

  if (estado === "exito") {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-4xl">🎉</p>
        <h2 className="text-xl font-semibold">¡Perfil creado!</h2>
        <Button variant="outline" onClick={() => { setForm(EMPTY); setEstado("idle") }}>
          Crear otro perfil
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Registro de perfil</h1>

      <form onSubmit={enviar} className="space-y-5">
        <Card>
          <CardHeader className="pb-2">
            <p className="font-medium text-sm">Datos básicos</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Campo label="Nombre *">
              <input
                required
                value={form.nombre}
                onChange={(e) => set("nombre", e.target.value)}
                placeholder="Ada Lovelace"
                className={inputClass}
              />
            </Campo>

            <Campo label="Foto (URL)">
              <input
                type="url"
                value={form.foto}
                onChange={(e) => set("foto", e.target.value)}
                placeholder="https://..."
                className={inputClass}
              />
            </Campo>

            <div className="grid grid-cols-2 gap-3">
              <Campo label="Rol *">
                <input
                  required
                  value={form.rol}
                  onChange={(e) => set("rol", e.target.value)}
                  placeholder="Backend Developer"
                  className={inputClass}
                />
              </Campo>
              <Campo label="Área *">
                <input
                  required
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                  placeholder="Backend"
                  className={inputClass}
                />
              </Campo>
            </div>

            <Campo label="Bio">
              <textarea
                value={form.bio}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="Contá brevemente a qué te dedicás..."
                rows={3}
                className={inputClass + " resize-none"}
              />
            </Campo>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <p className="font-medium text-sm">Hitos / Logros</p>
          </CardHeader>
          <CardContent className="space-y-3">
            {form.hitos.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Agregá logros técnicos que la comunidad puede avalar.
              </p>
            )}
            {form.hitos.map((hito, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={hito}
                  onChange={(e) => actualizarHito(i, e.target.value)}
                  placeholder={`Logro ${i + 1}...`}
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => quitarHito(i)}
                  className="shrink-0 text-muted-foreground hover:text-destructive transition"
                  aria-label="Quitar logro"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={agregarHito} className="gap-1.5">
              <PlusCircle className="h-4 w-4" />
              Agregar logro
            </Button>
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando..." : "Crear perfil"}
        </Button>
      </form>
    </div>
  )
}
