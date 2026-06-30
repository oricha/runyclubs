# Prompt de implementación — Capability `global-search` (RunClubs.es)

> Prompt autocontenido para que un agente LLM (sin memoria de conversaciones previas)
> implemente la capability `global-search` del proyecto RunClubs.es siguiendo
> **Spec-Driven Development con OpenSpec**. Léelo entero antes de escribir código.
>
> **Aviso:** este repo tiene varios changes avanzando en paralelo. Las rutas y
> firmas citadas aquí son una **foto fija** tomada justo antes de escribir este
> prompt — antes de dar nada por sentado, vuelve a comprobar con `ls`/`cat` el
> estado real de los ficheros mencionados.

---

## 1. Rol

Eres un **ingeniero full-stack senior** (Next.js App Router + Prisma + PostgreSQL +
TypeScript) que trabaja siguiendo metodología **Spec-Driven Development** con el
framework **OpenSpec**. Escribes código y documentación en **español**. No tomas
atajos: completas en orden el ciclo de vida de OpenSpec (proposal → specs →
design → tasks → implementación → validación → archivado).

---

## 2. Contexto del proyecto y estado actual del repo

**RunClubs.es** es un directorio social de clubs de running y carreras grupales en
las 20 ciudades más importantes de España. Capabilities **archivadas** en este
momento (confírmalo con `openspec list --specs`): `design-system`, `data-model`,
`recurring-runs`, `runs-directory`, `run-detail`.

### Qué ya existe y debes reutilizar/completar tal cual

- **`components/search/SearchModal.tsx`** (de `design-system`) **ya es
  funcional a nivel de UI shell**: ya gestiona el atajo de teclado ⌘K/Ctrl+K, ya
  está montado en `components/layout/Header.tsx` (botón de lupa →
  `setSearchOpen(true)`), tiene el `Input` con estado local `query`, y muestra
  "Buscando…" / "Empieza a escribir…" como placeholders **sin lógica real
  todavía**. Tu trabajo es **completar este componente**, no crear uno nuevo
  desde cero ni duplicarlo.
- **`lib/runs.ts`** → `getRuns(filters: RunFilters)` ya soporta búsqueda libre
  vía `filters.q` (compara `title`, `location` y `club.name`, insensible a
  mayúsculas) sobre carreras futuras programadas. **Reutilízalo** para la parte
  de carreras de la búsqueda global — no escribas una consulta Prisma paralela
  para eso.
- **`lib/i18n/es.ts`** ya tiene `home.searchPlaceholder`, `nav.search`, y el
  helper `t(template, vars)`.

### Dependencia incompleta — compruébala antes de decidir cómo buscar clubs

La capability **`clubs-directory`** (que daría `lib/clubs.ts` / `getClubs()`)
puede no estar terminada todavía en el momento en que implementes esto. Antes de
escribir la parte de búsqueda de clubs:
```bash
openspec list --specs   # ¿aparece "clubs-directory"?
ls lib/clubs.ts          # ¿existe ya?
```
- **Si `lib/clubs.ts` ya existe y exporta algo tipo `getClubs(filters)`:**
  reutilízalo (pasando un filtro de búsqueda libre por nombre) en vez de
  duplicar lógica.
- **Si todavía no existe:** no esperes a que aparezca ni lo implementes tú
  completo (no es tu alcance). Escribe en `lib/search.ts` una consulta Prisma
  **mínima y propia, acotada solo a lo que necesita el buscador** (id, slug,
  nombre, ciudad, logo — nada de tipos, insignias, frecuencia ni ritmo), y deja
  documentado en `design.md` que es una implementación ligera y paralela a la
  futura capa de datos de `clubs-directory`, candidata a consolidarse cuando esa
  capability se complete (no es responsabilidad tuya hacerlo ahora).

**Antes de escribir nada, lee también:**
1. `PRD-runclubs-es.md` **§6.5** (`global-search` — US-9, criterios de
   aceptación) y **§13** (Fase 3).
2. `openspec/ROADMAP-FUNCIONALIDADES.md` — entrada **`add-global-search`** (Fase 3).
3. `1-runclubs-es-especificacion.md` **§4** y **§7** (icono de búsqueda en
   header, mención de ⌘K como funcionalidad clave).
4. `2-runclubs-es-documento-tecnico.md` **§9.6** (código de referencia original
   de `SearchModal` con debounce de 200ms y `fetch('/api/search?q=...')` — el
   componente real ya implementado difiere un poco de ese ejemplo, pero la idea
   de debounce + fetch + lista de resultados con `kind`/`title`/`href` es la
   misma).

---

## 3. Objetivo de este change

Completar la capability **`global-search`**: lógica de búsqueda en vivo (debounce
200ms) dentro del `SearchModal` ya existente, consultando un nuevo endpoint
**`GET /api/search?q=`** que devuelve resultados mixtos de carreras y clubs,
cada uno etiquetado con su tipo, navegables por clic.

### Alcance (Decisión de scoping — síguelo tal cual)

**Sí entra en el alcance de este change:**
- `lib/search.ts` — función `searchAll(query: string): Promise<SearchResultItem[]>`
  que combina resultados de `getRuns({ q: query, ... })` (vía `lib/runs.ts`) y de
  clubs (vía `lib/clubs.ts` si existe, o tu propia consulta mínima si no, ver §2),
  mapeados a un tipo común:
  ```ts
  export interface SearchResultItem {
    id: string;
    kind: "carrera" | "club";
    title: string;
    subtitle?: string;   // p. ej. ciudad o fecha formateada
    href: string;         // "/carreras/[slug]" o "/clubs/[slug]"
  }
  ```
  Añade este tipo donde corresponda (puede vivir en `lib/search.ts` mismo, no
  hace falta forzarlo dentro de `types/index.ts` si es un tipo puramente de
  presentación de esta capability — decide y documenta).
- Límite de resultados razonable por categoría (p. ej. 5 carreras + 5 clubs,
  máx. 10 en total) — decide el número y documéntalo.
- `GET /api/search?q=` (`app/api/search/route.ts`): si `q` está vacío o ausente,
  devuelve `{ items: [] }` sin tocar la base de datos (no malgastes consultas).
- Completar `components/search/SearchModal.tsx`:
  - Debounce de ~200ms sobre `query` antes de disparar la búsqueda.
  - Cancelación de peticiones obsoletas (usa `AbortController`, o una bandera de
    "petición vigente") para evitar que una respuesta lenta de una búsqueda
    antigua sobrescriba los resultados de una búsqueda más reciente — esto es un
    requisito de corrección, no un "nice to have": una carrera de resultados
    desordenada es un bug visible.
  - Estados: vacío (placeholder inicial ya existente), cargando, sin resultados,
    con resultados (lista clicable que navega con `next/link` o `router.push` y
    cierra el modal al navegar).
  - Cada resultado muestra su `kind` (carrera/club) en mayúsculas como ya hace
    el ejemplo de doc 2, más `title` y, si lo decides, `subtitle`.
- Los resultados de carreras enlazan a `/carreras/[slug]` (ya existe, capability
  `run-detail`). Los resultados de club enlazan a `/clubs/[slug]` — **esa página
  todavía no existe** (capability `club-detail`, pendiente); dará 404 hasta que
  se implemente. Es esperado, no lo soluciones tú.

**Non-goals explícitos (no los implementes en este change):**
- **No** implementes `clubs-directory` ni `club-detail` completos — solo la
  consulta mínima de respaldo descrita en §2 si hace falta.
- **No** construyas una página de resultados de búsqueda standalone
  (`/buscar` o similar) — el PRD solo pide el modal ⌘K, no una página dedicada.
- **No** implementes ranking avanzado, tolerancia a errores tipográficos ni
  búsqueda fonética — un `contains`/`insensitive` simple sobre los campos
  relevantes es suficiente para esta fase.
- **No** es obligatorio implementar navegación por teclado (flechas ↑/↓ + Enter)
  entre resultados — es una mejora opcional (`Could`), no la bloquees ni la
  fuerces si te falta tiempo; si la añades, indícalo en `design.md`.
- **No** toques el atajo de teclado ⌘K/Ctrl+K ni el montaje en `Header.tsx` —
  ya funcionan, no los reescribas salvo necesidad estricta.

---

## 4. Especificación funcional (PRD §6.5 — síguela con precisión)

**US-9.** Como usuario, quiero buscar clubs y carreras desde cualquier página con
un atajo de teclado.
- **Given** estoy en cualquier página
- **When** pulso ⌘K/Ctrl+K o el icono de lupa
- **Then** se abre un modal de búsqueda; al escribir (debounce 200ms) veo
  resultados mixtos de clubs y carreras con su tipo etiquetado.

### Reglas de negocio derivadas (razonables, decide y documenta si difieres)

- La búsqueda solo debe considerar carreras futuras programadas (ya lo garantiza
  `getRuns`, no lo dupliques).
- Si la consulta es muy corta (p. ej. 1 carácter), puedes optar por no buscar
  todavía para evitar ruido — decide un umbral mínimo razonable y documéntalo.

---

## 5. Decisiones que debes tomar tú (documéntalas en `design.md` como "Decisión")

- **Origen de los datos de club** (§2): reutilización de `lib/clubs.ts` si existe,
  o consulta mínima propia si no.
- **Umbral mínimo de caracteres** para disparar la búsqueda.
- **Orden de los resultados combinados**: ¿carreras primero y luego clubs, o
  intercalados por relevancia simple? Cualquiera es válida si es consistente y
  está documentada.
- **Ubicación del tipo `SearchResultItem`**: en `lib/search.ts` o en `types/index.ts`.
- **Mecanismo de cancelación de peticiones obsoletas**: `AbortController` u otra
  estrategia equivalente — justifica la elegida.

---

## 6. Metodología obligatoria (OpenSpec)

```bash
# 1. Crea la carpeta del change con sus 3 ficheros + delta de spec
openspec/changes/add-global-search/proposal.md
openspec/changes/add-global-search/design.md
openspec/changes/add-global-search/tasks.md
openspec/changes/add-global-search/specs/global-search/spec.md

# 2. Valida antes de implementar
openspec validate add-global-search --strict

# 3. Implementa siguiendo tasks.md, marcando cada casilla [x] al completarla

# 4. Verifica (ver §7) y vuelve a validar
openspec validate add-global-search --strict

# 5. Archiva: promueve el delta a la spec vigente
openspec archive add-global-search -y
```

### Contenido esperado de cada fichero

- **`proposal.md`**: por qué (depende de `data-model` y reutiliza `lib/runs.ts`
  de `runs-directory`; depende parcialmente de `clubs-directory` para los datos
  de club, con el plan B descrito en §2 si no está lista), qué cambia,
  capability `global-search` (New Capability), impacto, y una sección
  `## Non-goals` con los puntos del §3.
- **`design.md`**: las decisiones del §5, el contrato de `searchAll`/`SearchResultItem`,
  cómo se evita la condición de carrera entre peticiones, y el estado real de
  `clubs-directory` en el momento de implementar (qué encontraste, qué decidiste).
- **`tasks.md`**: agrupa en algo como — (1) Capa de datos (`lib/search.ts`),
  (2) Endpoint `GET /api/search`, (3) Debounce y cancelación en `SearchModal`,
  (4) Estados de UI (vacío/cargando/sin resultados/con resultados) y navegación,
  (5) Verificación.
- **`specs/global-search/spec.md`**: formato OpenSpec
  (`## ADDED Requirements` → `### Requirement: ...` → `#### Scenario: ...` con
  **WHEN**/**THEN**). **Recuerda (lección de los changes anteriores):** cada
  enunciado de requisito debe contener la palabra clave **`MUST`** o **`SHALL`**
  en inglés (RFC 2119) aunque el resto de la frase esté en español, o
  `openspec validate --strict` fallará.

  Requisitos mínimos a cubrir: apertura del modal por atajo de teclado o clic
  (ya implementado, puedes referenciarlo como base), búsqueda con debounce sin
  resultados obsoletos, resultados mixtos etiquetados por tipo, navegación al
  hacer clic, manejo de "sin resultados".

---

## 7. Implementación y verificación (no te limites a "compila")

1. Confirma PostgreSQL real disponible (mismo `.env` que el resto de
   capabilities). Si no lo tienes, documenta qué no pudiste verificar.
2. Con datos reales (clubs y carreras sembrados):
   - Haz peticiones directas a `GET /api/search?q=...` con varios términos
     (nombre de un club real, palabra del título de una carrera real, término
     sin coincidencias) y confirma que la respuesta es coherente.
   - Abre cualquier página en un navegador (usa el MCP de Playwright si está
     disponible), pulsa ⌘K (o el icono de lupa), escribe progresivamente un
     término y comprueba: debounce (no una petición por cada tecla), aparición
     de resultados mixtos etiquetados, clic en un resultado navega y cierra el
     modal, término sin resultados muestra el estado vacío, sin errores ni
     warnings en consola del navegador.
   - Prueba específicamente teclear rápido y luego borrar — confirma que no
     aparecen resultados de una búsqueda anterior ya descartada (condición de
     carrera).
3. Ejecuta `npm run build` y `npm run lint` del proyecto completo — deben seguir
   en verde.
4. Marca todas las casillas de `tasks.md`, repite
   `openspec validate add-global-search --strict` y archiva con
   `openspec archive add-global-search -y`. Confirma con `openspec list --specs`.

---

## 8. Qué NO hacer

- No reescribas `lib/runs.ts`, `lib/prisma.ts`, `types/index.ts` (salvo
  necesidad estricta y justificada), ni el atajo de teclado ya funcional en
  `SearchModal.tsx`/`Header.tsx`.
- No implementes `clubs-directory`/`club-detail` completos.
- No construyas una página de resultados dedicada.
- No marques una tarea como completada si no la has verificado de verdad.

---

## 9. Formato de tu informe final al usuario

Resume: qué se implementó, qué se verificó realmente (incluye si los datos de
club vinieron de `lib/clubs.ts` real o de tu consulta mínima de respaldo, y por
qué), enlaces a los ficheros clave (`lib/search.ts`, `app/api/search/route.ts`,
`components/search/SearchModal.tsx`), confirmación de que `openspec validate` y
`openspec archive` se completaron, y propone la siguiente capability del roadmap
(`geolocation` o `clubs-directory`/`club-detail` si seguían pendientes, Fase 3)
como siguiente paso.
