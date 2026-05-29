import type { Perfil, Reputacion } from "@/lib/arkiv/types"

export const PERFILES_MOCK: Perfil[] = [
  {
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
  },
  {
    perfilId: "perfil-002",
    nombre: "Juan Pérez",
    foto: "https://i.pravatar.cc/300?img=12",
    rol: "Backend Developer",
    area: "Backend",
    bio: "Go y sistemas distribuidos.",
    verificado: true,
    hitos: [{ id: "h3", texto: "Migró el sistema a microservicios" }],
  },
]

export const REPUTACIONES_MOCK: Record<string, Reputacion> = {
  "perfil-001": {
    perfilId: "perfil-001",
    estrellasBlandas: 4.2,
    estrellasTecnicas: 4.7,
    detalleBlandas: [
      { item: "comunicacion", promedio: 4.5 },
      { item: "colaboracion", promedio: 4.0 },
      { item: "participacion", promedio: 5.0 },
      { item: "ayuda", promedio: 3.5 },
      { item: "liderazgo", promedio: 4.0 },
    ],
    detalleTecnicas: [
      { hitoId: "h1", promedio: 4.5 },
      { hitoId: "h2", promedio: 4.8 },
    ],
  },
  "perfil-002": {
    perfilId: "perfil-002",
    estrellasBlandas: 4.8,
    estrellasTecnicas: 3.5,
    detalleBlandas: [],
    detalleTecnicas: [],
  },
}

export const LABEL_ITEM_BLANDO: Record<string, string> = {
  comunicacion: "Comunicación",
  colaboracion: "Colaboración",
  participacion: "Participación",
  ayuda: "Ayuda",
  liderazgo: "Liderazgo",
}
