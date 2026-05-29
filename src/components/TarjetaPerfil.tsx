import type { Perfil, Reputacion } from "@/lib/arkiv/types"

interface Props {
  perfil: Perfil
  reputacion: Reputacion
}

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

export function TarjetaPerfil({ perfil, reputacion }: Props) {
  const hitosVisibles = perfil.hitos.slice(0, 2)

  return (
    <div className="tarjeta-wow">
      <div className="tarjeta-top">
        <img
          className="tarjeta-foto"
          src={perfil.foto}
          alt={perfil.nombre}
          onError={(e) => { (e.target as HTMLImageElement).src = "https://i.pravatar.cc/300?img=1" }}
        />
        <div className="tarjeta-info">
          <div className="tarjeta-nombre-row">
            <span className="tarjeta-nombre">{perfil.nombre}</span>
            {perfil.verificado && (
              <div className="badge-verificado" title="Verificado">✓</div>
            )}
          </div>
          <div className="tarjeta-rol">{perfil.rol}</div>
          <div className="tarjeta-area">{perfil.area}</div>
        </div>
      </div>

      <div className="tarjeta-estrellas">
        <div className="estrella-bloque">
          <div className="estrella-label blando">
            <span className="dot" />
            Blandas
          </div>
          <Estrellas valor={reputacion.estrellasBlandas} colorClass="azul" />
        </div>
        <div className="estrella-bloque">
          <div className="estrella-label tecnico">
            <span className="dot" />
            Técnicas
          </div>
          <Estrellas valor={reputacion.estrellasTecnicas} colorClass="" />
        </div>
      </div>

      {hitosVisibles.length > 0 && (
        <div className="tarjeta-hitos">
          {hitosVisibles.map((hito) => (
            <div key={hito.id} className="tarjeta-hito">
              <span className="hito-dot" />
              <span>{hito.texto}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
