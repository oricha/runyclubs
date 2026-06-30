## 1. Migración Prisma

- [x] 1.1 Añadir modelos `Account`, `Session`, `VerificationToken` y relaciones en `User`
- [x] 1.2 Ejecutar `npx prisma migrate dev --name add-auth-tables`

## 2. Paquetes y auth.ts

- [x] 2.1 Instalar `next-auth@beta` y `@auth/prisma-adapter`
- [x] 2.2 Crear `auth.ts` con Google, Resend, PrismaAdapter y callbacks

## 3. Route handler

- [x] 3.1 Crear `app/api/auth/[...nextauth]/route.ts`

## 4. Página /acceso

- [x] 4.1 Crear `app/acceso/page.tsx`, acciones server y `/acceso/verificar`

## 5. Middleware

- [x] 5.1 Crear `middleware.ts` para `/cuenta` y `/onboarding`

## 6. Header condicional

- [x] 6.1 Refactorizar `Header` (Server) + `HeaderClient` con sesión

## 7. Tipos, i18n y .env.example

- [x] 7.1 Crear `types/next-auth.d.ts`, claves `auth.*`, actualizar `.env.example`

## 8. Verificación

- [x] 8.1 Verificar tablas en BD, middleware y build/lint
- [x] 8.2 Validar y archivar change OpenSpec
