# SaltAttest

> *Encontrá a la persona indicada dentro de SaltaDev —un mentor, alguien para tu equipo de hackathon o un referente en un área— y confiá en que realmente sabe, porque su reputación no es auto-declarada: la avala la comunidad y queda registrada de forma que nadie puede falsificar ni borrar.*

**Track:** Arkiv Network — Ideathon + Hackathon Puna Tech 2026

---

## El problema

SaltaDev es una comunidad activa, pero su conocimiento colectivo vive en un canal de WhatsApp saturado y desordenado. Cuando alguien necesita algo concreto —un especialista en una tecnología, ayuda para un proyecto, un mentor— ese pedido suele perderse en el ruido: nadie responde, o la conversación se entierra bajo los mensajes siguientes.

Y cuando alguien sí responde, aparece el problema más profundo: **¿cómo sabés que esa persona realmente sabe lo que dice saber?** Cualquiera puede afirmar que “la tiene clara” en algo. No hay forma de distinguir a quien efectivamente tiene experiencia de quien solo se anima a contestar. El talento real de la comunidad termina siendo invisible, y la confianza depende del boca a boca o de la suerte.

---

## La solución

**SaltAttest** es una red social cerrada de SaltaDev donde los miembros arman su perfil con su información técnica y, sobre todo, **se avalan entre sí**. El aval de la comunidad es lo que convierte un perfil de *“lo que yo digo de mí”* en *“lo que la comunidad confirma de mí”*.

Sobre esa base de reputación verificable corre una **IA que actúa como buscador en lenguaje natural**: le pedís a quién necesitás y te devuelve a las personas más avaladas que encajan, presentadas de forma clara y natural —no como una lista cruda de base de datos.

Lo innovador no es “un directorio con buscador”. Es que **las recomendaciones de la IA son confiables porque se apoyan en reputación que no se puede inflar**: la IA no prioriza a quien mejor se vende, sino a quien la comunidad efectivamente respalda.

### Para qué sirve

- Buscar un **mentor** en un área o tecnología
- Armar **equipo para un hackathon** o proyecto
- Identificar un **referente** de la comunidad en determinada área
- Tener a alguien en cuenta para un **trabajo**

**SaltAttest no es un LinkedIn más chico ni una bolsa de empleo.** Es, ante todo, una herramienta de comunidad.

---

## Por qué Arkiv y no una base de datos común

Los datos básicos de un perfil podrían vivir en cualquier lado. Pero los **avales** son distintos: son el activo de confianza de la comunidad, y por eso importa que tengan tres propiedades que una base de datos centralizada no garantiza:

- **Que no se puedan falsificar.** Un administrador con acceso a una base común podría inventar avales o inflar a alguien. En Arkiv, cada aval queda firmado y anclado on-chain; nadie puede fabricar avales en nombre de otro.
- **Que no se puedan borrar a escondidas.** En una base normal, un registro se edita o elimina sin dejar rastro. En Arkiv, el historial es verificable: la reputación que construiste no depende de la buena voluntad de quien administra el servidor.
- **Que no dependan de un único punto que pueda perderse.** La reputación de la comunidad no debería evaporarse por un error de servidor, un cierre de proyecto o una decisión unilateral.

**Arkiv es el lugar correcto para lo que tiene que ser confiable y permanente —los avales—**, y es lo que hace que la confianza de toda la plataforma sea real y no una promesa de “confiá en nosotros”.

---

## Encaje en el track Arkiv

| Requisito del track | Cómo lo cumple el proyecto |
|---------------------|---------------------------|
| Arkiv como pieza **central**, no decorativa | La reputación verificable (los avales) es el núcleo del producto y vive en Arkiv. Sin Arkiv, no hay confianza, y sin confianza no hay proyecto. |
| Integración **funcional** (sin mock data) | Perfiles y avales se crean, leen y consultan realmente sobre la red Braga. |
| **IA + datos verificables** (ambas) | La IA busca y presenta personas; los datos sobre los que decide son verificables y no se pueden inflar. La IA es confiable *porque* los datos lo son. |
| Justificar **por qué on-chain y no un Google Sheet** | Los avales necesitan ser infalsificables, no borrables a escondidas y no dependientes de un único servidor. |

---

## Qué datos viven en Arkiv

Todos los datos de identidad y reputación viven como entidades con atributos queryables en testnet **Braga**.

### Perfiles (`tipo: "perfil"`)

```
app:      "saltrust"
tipo:     "perfil"
perfilId: "perfil-abc123"
area:     "Backend"
rol:      "Backend Developer"
```

El payload contiene el perfil completo: nombre, foto, bio e hitos técnicos.

### Avales (`tipo: "aval"`)

```
app:      "saltrust"
tipo:     "aval"
avalado:  "perfil-abc123"
avalador: "perfil-xyz789"
brazo:    "tecnico"          ← "blando" | "tecnico"
objetivo: "h1"               ← skill o hitoId
```

La puntuación (1–5) y el comentario viajan en el payload, **no como atributos queryables**, para evitar rankings manipulables por filtrado directo.

Todas las entidades usan `app: "saltrust"` como namespace, garantizando que las consultas de SaltAttest nunca colisionen con otras apps en Arkiv.

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Frontend | Vite + React + TypeScript |
| UI | CSS design system propio (Space Grotesk + DM Sans) |
| Routing | react-router-dom v7 |
| Blockchain | `@arkiv-network/sdk` — testnet Braga |
| IA | Anthropic API — `claude-haiku-4-5` |
| Backend / API | Vercel Serverless Functions |
| Deploy | Vercel |

### Cómo funciona la IA

El buscador recibe la lista de perfiles con sus estrellas y el texto de búsqueda libre. Claude interpreta el pedido, rankea los perfiles por relevancia y reputación, y devuelve una presentación en lenguaje natural —no una lista SQL. La API key nunca se expone al cliente; la llamada a Anthropic ocurre server-side en `api/buscar.ts`.

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

La app corre en `http://localhost:5173`. Las API routes de Vercel se pueden testear localmente con `vercel dev` (requiere Vercel CLI).

### 4. Seed de datos en Arkiv (opcional, una sola vez)

Para cargar los 12 perfiles y sus avales de muestra en Braga:

```bash
npm run seed
```

Esto crea todas las entidades en la red Arkiv en batch. Mientras no haya datos en Braga, la app muestra los 12 perfiles mock como fallback para que la demo no se vea vacía.

---

## Demo desplegada

[URL de Vercel]

---

## Declaración de uso de IA

Este proyecto fue desarrollado con asistencia de **Claude Code** (Anthropic) como herramienta de desarrollo: generación de código, debugging y arquitectura.

La funcionalidad de búsqueda inteligente de la app usa **`claude-haiku-4-5`** en tiempo de ejecución para rankear perfiles según relevancia semántica y presentarlos en lenguaje natural.

---

## Licencia

MIT
