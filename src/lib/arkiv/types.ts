export interface Hito {
  id: string
  texto: string
}

export interface Perfil {
  perfilId: string
  nombre: string
  foto: string
  rol: string
  area: string
  bio: string
  verificado: boolean
  hitos: Hito[]
}

export interface Aval {
  avalId: string
  avalado: string
  avalador: string
  brazo: "blando" | "tecnico"
  objetivo: string
  puntuacion: number
  comentario?: string
  fecha: string
}

export interface DetalleBlando {
  item: string
  promedio: number
}

export interface DetalleTecnico {
  hitoId: string
  promedio: number
}

export interface Reputacion {
  perfilId: string
  estrellasBlandas: number
  estrellasTecnicas: number
  detalleBlandas: DetalleBlando[]
  detalleTecnicas: DetalleTecnico[]
}
