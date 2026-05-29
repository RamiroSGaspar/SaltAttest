import { TarjetaPerfil } from "@/components/TarjetaPerfil"
import type { Perfil, Reputacion } from "@/lib/arkiv/types"

const perfil: Perfil = {
  perfilId: "perfil-001",
  nombre: "María Gómez",
  foto: "https://i.pravatar.cc/300?img=47",
  rol: "Científica de Datos",
  area: "Data Science",
  bio: "Modelos de visión por computadora.",
  verificado: true,
  hitos: [
    { id: "h1", texto: "Charla sobre ML en meetup" },
    { id: "h2", texto: "Lideró modelo de fraude" },
  ],
}

const reputacion: Reputacion = {
  perfilId: "perfil-001",
  estrellasBlandas: 4.2,
  estrellasTecnicas: 4.7,
}

export default function Inicio() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Inicio / Buscador</h1>
      <TarjetaPerfil perfil={perfil} reputacion={reputacion} />
    </div>
  )
}
