# auth Specification

## Purpose
TBD - created by archiving change add-auth-magic-link. Update Purpose after archive.
## Requirements
### Requirement: Modelos de autenticación en Prisma
El sistema MUST persistir cuentas OAuth, sesiones y tokens de verificación según el
Prisma Adapter de Auth.js, sin alterar campos existentes del modelo `User`.

#### Scenario: Tablas de Auth.js creadas
- **WHEN** se aplica la migración `add-auth-tables`
- **THEN** MUST existir las tablas `Account`, `Session` y `VerificationToken` en PostgreSQL
- **THEN** el modelo `User` MUST incluir relaciones `accounts` y `sessions` sin perder datos sembrados

### Requirement: Configuración Auth.js v5
El sistema MUST exponer autenticación vía Auth.js v5 con adaptador Prisma, proveedores
Google y Resend (magic link), y route handler App Router en `/api/auth/[...nextauth]`.

#### Scenario: Route handler operativo
- **WHEN** Auth.js recibe peticiones GET/POST en `/api/auth/*`
- **THEN** MUST delegar en los handlers exportados desde `auth.ts`

#### Scenario: Sesión con identificador de usuario
- **WHEN** existe una sesión activa
- **THEN** `session.user.id` MUST contener el `id` del usuario en base de datos

### Requirement: Página de acceso /acceso
La ruta `/acceso` MUST ofrecer inicio de sesión con Google y magic link por email,
y MUST redirigir tras login a la URL indicada en `next` o `callbackUrl`.

#### Scenario: Usuario ya autenticado
- **WHEN** un usuario con sesión activa visita `/acceso`
- **THEN** MUST redirigirse a `next`, `callbackUrl` o `/` sin mostrar el formulario

#### Scenario: Magic link solicitado
- **WHEN** el usuario introduce un email válido y envía el formulario
- **THEN** MUST iniciarse el flujo Resend y MUST mostrarse confirmación de envío

#### Scenario: Inicio con Google
- **WHEN** el usuario pulsa «Continuar con Google» y completa OAuth
- **THEN** MUST crearse o vincularse la sesión y MUST redirigirse a `redirectTo`

### Requirement: Middleware de rutas protegidas
El middleware MUST exigir sesión activa para `/cuenta` y `/onboarding`, y MUST
redirigir usuarios no autenticados a `/acceso`.

#### Scenario: Acceso sin sesión a /cuenta
- **WHEN** un usuario sin sesión solicita `/cuenta` o subrutas
- **THEN** MUST redirigirse a `/acceso` con parámetro de retorno (`callbackUrl`)

#### Scenario: Acceso con sesión a /cuenta
- **WHEN** un usuario autenticado solicita `/cuenta`
- **THEN** el middleware MUST permitir el acceso (aunque la página aún no exista)

#### Scenario: Rutas públicas sin bloqueo
- **WHEN** un usuario sin sesión visita `/carreras`
- **THEN** MUST mostrarse el listado sin redirección a `/acceso`

### Requirement: Header condicional según sesión
El header MUST reflejar el estado de autenticación del usuario.

#### Scenario: Usuario sin sesión
- **WHEN** no hay sesión activa
- **THEN** el enlace de cuenta MUST apuntar a `/acceso` con icono de usuario anónimo

#### Scenario: Usuario con sesión
- **WHEN** hay sesión activa
- **THEN** el enlace MUST apuntar a `/cuenta` y MUST mostrar avatar o iniciales del usuario

### Requirement: Tipos TypeScript de sesión
El proyecto MUST extender los tipos de `next-auth` para incluir `user.id` en `Session`.

#### Scenario: Tipado en Server Components
- **WHEN** se accede a `session.user.id` tras `auth()`
- **THEN** TypeScript MUST reconocer `id` como `string` sin errores de compilación

