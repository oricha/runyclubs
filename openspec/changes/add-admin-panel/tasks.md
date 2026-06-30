## 1. Schema y migración

- [x] 1.1 Añadir `isSuperAdmin` y `AdminAuditLog` en `schema.prisma`
- [x] 1.2 Ejecutar `npx prisma migrate dev --name add-admin-panel`

## 2. Auth y middleware

- [x] 2.1 Extender `types/next-auth.d.ts` con `isSuperAdmin`
- [x] 2.2 Actualizar callback session en `auth.config.ts`
- [x] 2.3 Añadir `/admin/:path*` al matcher de `middleware.ts`

## 3. Server Actions

- [x] 3.1 Crear `lib/actions/admin.ts` con guard y acciones CRUD admin

## 4. UI del panel

- [x] 4.1 Crear componentes client en `components/admin/`
- [x] 4.2 Crear `app/admin/page.tsx` con tabla clubs y audit log
- [x] 4.3 Añadir claves `admin.*` en `lib/i18n/es.ts`

## 5. Verificación

- [x] 5.1 `npx openspec validate add-admin-panel --strict`
- [x] 5.2 `npx tsc --noEmit`
