# SaltAttest

> Red de reputación verificable para la comunidad SaltaDev — avales on-chain en Arkiv, búsqueda inteligente con IA.

---

## El problema

En comunidades tech locales como SaltaDev, la reputación de una persona circula
de boca en boca o queda atrapada en LinkedIn endorsements que nadie lee. No hay
forma de saber quién realmente colaboró en un proyecto, quién enseñó a otros, o
quién entregó lo que prometió. La confianza no tiene infraestructura.

## La solución

**SaltAttest** es una red donde los miembros de SaltaDev se avalan mutuamente con
puntuaciones verificables, almacenadas de forma permanente en la blockchain de
Arkiv. Cada aval registra:

- **Quién** avala a quién
- **Qué brazo**: habilidades blandas (comunicación, colaboración, liderazgo) o
  técnicas (hitos concretos del perfil)
- **Puntuación** de 1 a 5 estrellas
- **Comentario** opcional

Los avales son inmutables: una vez escritos en Arkiv, no se pueden borrar ni
falsificar. La reputación se construye en el tiempo y nadie la puede reescribir.

Además, la pantalla principal incluye un **buscador con IA en lenguaje natural**
impulsado por Claude: escribís "necesito un backend developer con experiencia en
Kubernetes" y el modelo rankea los perfiles más relevantes explicando por qué.

---

## Por qué Arkiv

Los avales necesitan ser confiables para tener valor. Una base de datos centralizada
puede ser editada por el administrador. Un Excel compartido puede ser modificado.
Arkiv garantiza que:

- Cada entidad (perfil, aval) tiene un hash inmutable en testnet Braga.
- El `$creator` de cada entidad es la wallet de la app, pero el `avalador` viaja
  en el payload — nadie puede reclamar un aval que no recibió.
- La consulta es pública: cualquiera puede auditar los avales de cualquier persona
  sin depender de SaltAttest como intermediario.

---

## Track

**Arkiv Network**

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | Vite + React + TypeScript |
| UI | shadcn/ui + Tailwind CSS v3 |
| Routing | react-router-dom v7 |
| Blockchain | `@arkiv-network/sdk` — testnet Braga |
| IA | Anthropic API — `claude-haiku-4-5` |
| Backend / API | Vercel Serverless Functions |
| Deploy | Vercel |

---

## Qué datos viven en Arkiv

Todos los datos de identidad y reputación viven en Arkiv como entidades con
atributos queryables:

### Perfiles (`tipo: "perfil"`)

```
app: "saltrust"
tipo: "perfil"
perfilId: "perfil-abc123"
area: "Backend"
rol: "Backend Developer"
```

El payload contiene el perfil completo (nombre, foto, bio, hitos).

### Avales (`tipo: "aval"`)

```
app: "saltrust"
tipo: "aval"
avalado: "perfil-abc123"
avalador: "perfil-xyz789"
brazo: "tecnico"
objetivo: "h1"
```

El payload contiene la puntuación y el comentario. La puntuación **no** es un
atributo queryable — solo viaja en payload — para evitar rankings manipulables
por filtrado directo.

Todas las entidades usan el atributo `app: "saltrust"` como namespace, garantizando
que las consultas de SaltAttest nunca colisionen con otras apps en Arkiv.

---

## Integraciones IA

| Uso | Modelo | Dónde |
|-----|--------|-------|
| Buscador semántico de perfiles | `claude-haiku-4-5` | `api/buscar.ts` (server-side) |
| Desarrollo del proyecto | Claude Code (Sonnet) | IDE |

El buscador recibe la lista de perfiles con sus estrellas, el texto de búsqueda, y
devuelve un orden rankeado + una presentación en lenguaje natural de los resultados.
La API key nunca se expone al cliente.

---

## Equipo

- [Nombre] — [@usuario_github]
- [Nombre] — [@usuario_github]

---

## Correr localmente

### 1. Clonar e instalar

```bash
git clone https://github.com/ramirosgaspar/saltadev-trust.git
cd saltadev-trust
npm install
```

### 2. Configurar variables de entorno

Crear un archivo `.env` en la raíz:

```env
# Clave privada de la wallet de la app (testnet Braga — sin fondos reales)
PRIVATE_KEY=0x...

# API key de Anthropic para el buscador con IA
ANTHROPIC_API_KEY=sk-ant-...
```

> Para obtener fondos en Braga: https://braga.hoodi.arkiv.network/faucet/
> La wallet de la app es `0xB6165137395424954Aeb22145800DFBeEB981640`.

### 3. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La app corre en `http://localhost:5173`. Las API routes de Vercel se pueden
testear localmente con `vercel dev` (requiere Vercel CLI).

### 4. Seed de datos en Arkiv (opcional)

Para cargar perfiles reales en Braga y ver la integración on-chain:

```bash
npm run smoke-test
```

Mientras no haya datos en Braga, la app muestra los 12 perfiles mock de la
comunidad SaltaDev como fallback.

---

## Demo desplegada

[URL de Vercel]

---

## Declaración de uso de IA

Este proyecto fue desarrollado con asistencia de **Claude Code** (Anthropic) como
herramienta de desarrollo: generación de código, debugging y arquitectura.

La funcionalidad de búsqueda inteligente de la app usa **claude-haiku-4-5** en
tiempo de ejecución para rankear perfiles según relevancia semántica.

---

## Licencia

MIT
