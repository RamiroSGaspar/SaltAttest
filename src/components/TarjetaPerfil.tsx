import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import type { Perfil, Reputacion } from "@/lib/arkiv/types"

interface Props {
  perfil: Perfil
  reputacion: Reputacion
}

function Estrellas({ valor, etiqueta }: { valor: number; etiqueta: string }) {
  const llenas = Math.floor(valor)
  const fraccion = valor - llenas

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground font-medium w-20">{etiqueta}</span>
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={
              i <= llenas
                ? "text-yellow-400 text-base leading-none"
                : i === llenas + 1 && fraccion >= 0.5
                ? "text-yellow-300 text-base leading-none"
                : "text-muted-foreground/30 text-base leading-none"
            }
          >
            ★
          </span>
        ))}
      </div>
      <span className="text-sm font-semibold tabular-nums">{valor.toFixed(1)}</span>
    </div>
  )
}

export function TarjetaPerfil({ perfil, reputacion }: Props) {
  const iniciales = perfil.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  const hitosVisibles = perfil.hitos.slice(0, 2)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={perfil.foto} alt={perfil.nombre} />
            <AvatarFallback>{iniciales}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-semibold leading-tight truncate">{perfil.nombre}</h3>
              {perfil.verificado && (
                <Badge className="gap-1 text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                  <CheckCircle className="h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{perfil.rol}</p>
            <Badge variant="secondary" className="mt-1.5 text-xs">
              {perfil.area}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Estrellas separadas */}
        <div className="space-y-1.5">
          <Estrellas valor={reputacion.estrellasBlandas} etiqueta="★ Blandas" />
          <Estrellas valor={reputacion.estrellasTecnicas} etiqueta="★ Técnicas" />
        </div>

        {/* Hitos */}
        {hitosVisibles.length > 0 && (
          <div className="border-t pt-3 space-y-1.5">
            {hitosVisibles.map((hito) => (
              <div key={hito.id} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 text-xs">•</span>
                <span className="leading-snug">{hito.texto}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
