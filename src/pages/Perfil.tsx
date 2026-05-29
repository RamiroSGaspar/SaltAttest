import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { CheckCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { LABEL_ITEM_BLANDO } from "@/lib/mocks"
import type { Perfil as TPerfil, Reputacion } from "@/lib/arkiv/types"

// TODO: GET /api/perfil/:id llama a traerPerfil() de Arkiv cuando esté listo
// TODO: GET /api/avales/:id llama a traerAvales() + calcularEstrellas() de Arkiv

function MiniEstrellas({ valor }: { valor: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= Math.floor(valor)
              ? "text-yellow-400 text-sm leading-none"
              : i === Math.floor(valor) + 1 && valor % 1 >= 0.5
              ? "text-yellow-300 text-sm leading-none"
              : "text-muted-foreground/30 text-sm leading-none"
          }
        >
          ★
        </span>
      ))}
      <span className="ml-1 text-sm font-semibold tabular-nums">{valor.toFixed(1)}</span>
    </span>
  )
}

function SeccionEstrellas({ rep, hitos }: { rep: Reputacion; hitos: { id: string; texto: string }[] }) {
  const hitoMap = Object.fromEntries(hitos.map((h) => [h.id, h.texto]))
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <p className="font-semibold text-sm flex items-center gap-1.5">
            ★ Blandas <span className="text-lg font-bold text-yellow-500">{rep.estrellasBlandas.toFixed(1)}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {rep.detalleBlandas.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin datos todavía.</p>
          ) : (
            rep.detalleBlandas.map((d) => (
              <div key={d.item} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{LABEL_ITEM_BLANDO[d.item] ?? d.item}</span>
                <MiniEstrellas valor={d.promedio} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <p className="font-semibold text-sm flex items-center gap-1.5">
            ★ Técnicas <span className="text-lg font-bold text-yellow-500">{rep.estrellasTecnicas.toFixed(1)}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-2">
          {rep.detalleTecnicas.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sin datos todavía.</p>
          ) : (
            rep.detalleTecnicas.map((d) => (
              <div key={d.hitoId} className="flex items-center justify-between text-sm gap-4">
                <span className="text-muted-foreground truncate">{hitoMap[d.hitoId] ?? d.hitoId}</span>
                <MiniEstrellas valor={d.promedio} />
              </div>
            ))
          )}
        </CardContent>
      </Card>
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
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (noEncontrado || !perfil || !rep) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-muted-foreground">Perfil no encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/")}>Volver al inicio</Button>
      </div>
    )
  }

  const iniciales = perfil.nombre.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-20 w-20 shrink-0">
              <AvatarImage src={perfil.foto} alt={perfil.nombre} />
              <AvatarFallback className="text-lg">{iniciales}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold leading-tight">{perfil.nombre}</h1>
                {perfil.verificado && (
                  <Badge className="gap-1 text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                    <CheckCircle className="h-3 w-3" />
                    Verificado
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{perfil.rol}</p>
              <Badge variant="secondary" className="text-xs">{perfil.area}</Badge>
              <p className="text-sm text-muted-foreground pt-1">{perfil.bio}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "★ Blandas", valor: rep.estrellasBlandas },
          { label: "★ Técnicas", valor: rep.estrellasTecnicas },
        ].map(({ label, valor }) => (
          <Card key={label}>
            <CardContent className="pt-4 pb-4 flex flex-col items-center gap-1">
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold text-yellow-500">{valor.toFixed(1)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <SeccionEstrellas rep={rep} hitos={perfil.hitos} />

      {perfil.hitos.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <p className="font-semibold text-sm">Hitos</p>
          </CardHeader>
          <CardContent className="space-y-2">
            {perfil.hitos.map((hito) => {
              const detalle = rep.detalleTecnicas.find((d) => d.hitoId === hito.id)
              return (
                <div key={hito.id} className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-xs text-muted-foreground">•</span>
                    <span>{hito.texto}</span>
                  </div>
                  {detalle && <MiniEstrellas valor={detalle.promedio} />}
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <p className="font-semibold text-sm">Comentarios</p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Todavía no hay comentarios.</p>
        </CardContent>
      </Card>

      <Button size="lg" className="w-full" onClick={() => navigate(`/avalar?avalado=${perfil.perfilId}`)}>
        Avalar a {perfil.nombre.split(" ")[0]}
      </Button>
    </div>
  )
}
