import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
  label,
  value,
  onChange,
  excluir,
}: {
  label: string
  value: string
  onChange: (id: string) => void
  excluir?: string
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-col gap-2">
        {PERFILES_MOCK.filter((p) => p.perfilId !== excluir).map((perfil) => (
          <button
            key={perfil.perfilId}
            onClick={() => onChange(perfil.perfilId)}
            className={[
              "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition",
              value === perfil.perfilId
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border hover:bg-muted",
            ].join(" ")}
          >
            <img src={perfil.foto} alt={perfil.nombre} className="h-9 w-9 rounded-full object-cover" />
            <div>
              <p className="text-sm font-medium leading-tight">{perfil.nombre}</p>
              <p className="text-xs text-muted-foreground">{perfil.rol}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function Estrellas({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="text-3xl leading-none transition-transform hover:scale-110 focus:outline-none"
          aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
        >
          <span className={(hover || value) >= n ? "text-yellow-400" : "text-muted-foreground/30"}>★</span>
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

  // Resetear pasos dependientes cuando cambia una selección previa
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
    // TODO: POST /api/avalar llama a crearAval() de Arkiv con WalletClient cuando esté listo
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
      <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-4xl">🎉</p>
        <h2 className="text-xl font-semibold">¡Aval registrado!</h2>
        <Button variant="outline" onClick={() => {
          setAvalado(""); setAvalador(""); setBrazo(""); setObjetivo("")
          setPuntuacion(0); setComentario(""); setEstado("idle")
        }}>
          Avalar a alguien más
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Avalar a alguien</h1>

      <Card>
        <CardHeader className="pb-2">
          <p className="font-medium">Paso 1 — ¿A quién avalás?</p>
        </CardHeader>
        <CardContent>
          <SelectorPerfil label="" value={avalado} onChange={seleccionarAvalado} />
        </CardContent>
      </Card>

      {avalado && (
        <Card>
          <CardHeader className="pb-2">
            <p className="font-medium">Paso 2 — ¿Quién sos?</p>
          </CardHeader>
          <CardContent className="space-y-2">
            <SelectorPerfil label="" value={avalador} onChange={setAvalador} />
            {autoAval && (
              <p className="text-sm text-destructive font-medium">No podés avalarte a vos mismo.</p>
            )}
          </CardContent>
        </Card>
      )}

      {avalado && avalador && !autoAval && (
        <Card>
          <CardHeader className="pb-2">
            <p className="font-medium">Paso 3 — ¿Qué tipo de aval?</p>
          </CardHeader>
          <CardContent className="flex gap-3">
            {(["blando", "tecnico"] as const).map((b) => (
              <Button
                key={b}
                variant={brazo === b ? "default" : "outline"}
                onClick={() => seleccionarBrazo(b)}
                className="flex-1"
              >
                {b === "blando" ? "Blandas" : "Técnicas"}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {brazo && (
        <Card>
          <CardHeader className="pb-2">
            <p className="font-medium">Paso 4 — ¿Sobre qué?</p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {brazo === "blando"
              ? ITEMS_BLANDOS.map((item) => (
                  <Button
                    key={item.key}
                    variant={objetivo === item.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setObjetivo(item.key); setPuntuacion(0) }}
                  >
                    {item.label}
                  </Button>
                ))
              : (perfilAvalado?.hitos ?? []).map((hito) => (
                  <Button
                    key={hito.id}
                    variant={objetivo === hito.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => { setObjetivo(hito.id); setPuntuacion(0) }}
                  >
                    {hito.texto}
                  </Button>
                ))}
            {brazo === "tecnico" && perfilAvalado?.hitos.length === 0 && (
              <p className="text-sm text-muted-foreground">Este perfil no tiene hitos técnicos.</p>
            )}
          </CardContent>
        </Card>
      )}

      {objetivo && (
        <Card>
          <CardHeader className="pb-2">
            <p className="font-medium">Paso 5 — Puntuación</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Estrellas value={puntuacion} onChange={setPuntuacion} />

            {puntuacion > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Comentario (opcional)</p>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Contá algo sobre esta persona..."
                  rows={3}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 resize-none transition"
                />
                <Button
                  onClick={enviar}
                  disabled={estado === "enviando"}
                  className="w-full"
                  size="lg"
                >
                  {estado === "enviando" ? "Enviando..." : "Avalar"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
