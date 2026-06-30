## 1. Configuración Prisma + PostgreSQL

- [x] 1.1 Instalar `prisma@7.8.0` (dev) y `@prisma/client@7.8.0` (prod); añadir `tsx` para el seed
- [x] 1.2 Crear `.env.example` con `DATABASE_URL`; confirmar `.env` en `.gitignore`
- [x] 1.3 Levantar PostgreSQL local (Docker en puerto 5433) y crear `.env` local con `DATABASE_URL`
- [x] 1.4 Configurar `prisma.seed` en `package.json` y `prisma.config.ts` (Prisma v7)

## 2. Esquema y migraciones

- [x] 2.1 Crear `prisma/schema.prisma` con enums y modelos núcleo (sin entidades diferidas)
- [x] 2.2 Ejecutar `npx prisma validate` y `npx prisma migrate dev --name init`
- [x] 2.3 Crear `lib/prisma.ts` (singleton + adapter `@prisma/adapter-pg` para Prisma v7)

## 3. Tipos TypeScript de dominio

- [x] 3.1 Crear `types/index.ts` según doc 2 §7 con campos ampliados de `Run`

## 4. Seed

- [x] 4.1 Crear `prisma/seed.ts` idempotente: 20 ciudades, 11 tipos, usuario demo, 20 clubs
- [x] 4.2 Incluir `ClubType`, `ClubAward` (cuando aplique) y `RecurringRun` por club
- [x] 4.3 Definir recurrencias razonables para clubs sin entrada en doc 3 §4
- [x] 4.4 Ejecutar `npx prisma db seed`

## 5. Verificación

- [x] 5.1 Verificar conteos: 20 City, 11 RunTypeTag, 20 Club; awards (5) y recurringRuns (36) presentes
- [x] 5.2 Verificar consulta con `include` de relaciones (city, types, recurringRuns)
- [x] 5.3 Ejecutar `npm run build` y `npm run lint` (design-system intacto)
- [x] 5.4 `openspec validate add-data-model --strict` y `openspec archive add-data-model -y`
