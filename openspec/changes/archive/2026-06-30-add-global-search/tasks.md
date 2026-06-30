## 1. Capa de datos

- [x] 1.1 Crear `lib/search.ts` con `SearchResultItem`, `searchAll()` y consulta mínima de clubs

## 2. Endpoint GET /api/search

- [x] 2.1 Crear `app/api/search/route.ts` con validación de `q` y delegación en `searchAll()`

## 3. Debounce y cancelación en SearchModal

- [x] 3.1 Añadir debounce 200 ms y `AbortController` en `SearchModal.tsx`
- [x] 3.2 Conectar `fetch('/api/search?q=...')` y gestión de estados

## 4. UI de resultados y navegación

- [x] 4.1 Renderizar lista de resultados con `kind`, `title` y `subtitle`
- [x] 4.2 Navegación al clic (router.push + cerrar modal) y estados vacío/sin resultados

## 5. Verificación

- [x] 5.1 Probar `GET /api/search?q=...` con curl (términos reales y sin coincidencias)
- [x] 5.2 Verificar modal en navegador (debounce, resultados mixtos, condición de carrera)
- [x] 5.3 Ejecutar `npm run build` y `npm run lint`
- [x] 5.4 Validar y archivar change OpenSpec
