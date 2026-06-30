## ADDED Requirements

### Requirement: Campo isSuperAdmin en User
El modelo `User` MUST incluir `isSuperAdmin Boolean @default(false)` para identificar
superadministradores de la plataforma.

#### Scenario: Usuario por defecto no es superadmin
- **WHEN** se crea un usuario nuevo
- **THEN** `isSuperAdmin` MUST ser `false`

### Requirement: Modelo AdminAuditLog
El sistema MUST persistir acciones administrativas en `AdminAuditLog` con `actorId`,
`action`, `targetId` opcional, `metadata` JSON y `createdAt`.

#### Scenario: Registro de acción
- **WHEN** un superadmin ejecuta una acción administrativa soportada
- **THEN** MUST crearse una fila en `AdminAuditLog` con el actor y la acción

### Requirement: Sesión con isSuperAdmin
La sesión Auth.js MUST incluir `session.user.isSuperAdmin` leído del usuario en BD.

#### Scenario: Superadmin autenticado
- **WHEN** un usuario con `isSuperAdmin: true` tiene sesión activa
- **THEN** `session.user.isSuperAdmin` MUST ser `true`

### Requirement: Protección de ruta /admin
La ruta `/admin` MUST exigir sesión (middleware) y MUST comprobar `isSuperAdmin` en
Server Component.

#### Scenario: Sin sesión
- **WHEN** un visitante sin sesión accede a `/admin`
- **THEN** MUST redirigirse a `/acceso?next=/admin`

#### Scenario: Usuario sin privilegios
- **WHEN** un usuario autenticado sin `isSuperAdmin` accede a `/admin`
- **THEN** MUST redirigirse a `/` sin mostrar el panel

#### Scenario: Superadmin
- **WHEN** un usuario con `isSuperAdmin: true` accede a `/admin`
- **THEN** MUST mostrarse el panel de administración

### Requirement: Dar de baja club
La acción `disableClub` MUST establecer `Club.verified = false` y MUST registrar
`club.disable` en auditoría.

#### Scenario: Baja de club
- **WHEN** un superadmin confirma dar de baja un club
- **THEN** `verified` MUST pasar a `false`
- **THEN** MUST existir entrada `club.disable` en `AdminAuditLog`

### Requirement: Publicar club
La acción `enableClub` MUST establecer `Club.verified = true` y MUST registrar
`club.enable` en auditoría.

#### Scenario: Publicación de club
- **WHEN** un superadmin publica un club desactivado
- **THEN** `verified` MUST pasar a `true`
- **THEN** MUST existir entrada `club.enable` en `AdminAuditLog`

### Requirement: Asignar owner de club
La acción `assignClubOwner` MUST actualizar `Club.ownerId` y MUST upsert
`ClubMember` con rol `OWNER` para el usuario encontrado por email.

#### Scenario: Email no registrado
- **WHEN** el email no corresponde a ningún usuario
- **THEN** MUST devolverse error «Usuario no encontrado» sin modificar el club

#### Scenario: Asignación exitosa
- **WHEN** el email corresponde a un usuario existente
- **THEN** MUST actualizarse owner y membresía OWNER
- **THEN** MUST registrarse `club.assign_owner` en auditoría

### Requirement: Alta de club por admin
La acción `createClubAsAdmin` MUST crear un club con datos mínimos, `verified: false`,
`ClubMember` OWNER y MUST registrar `club.create` en auditoría.

#### Scenario: Ciudad o owner inválidos
- **WHEN** falta la ciudad o el usuario owner
- **THEN** MUST devolverse error sin crear el club

#### Scenario: Alta exitosa
- **WHEN** nombre, ciudad y owner son válidos
- **THEN** MUST crearse el club con slug único
- **THEN** MUST registrarse `club.create` en auditoría

### Requirement: Log de auditoría en panel
El panel MUST mostrar las últimas 50 entradas de `AdminAuditLog` con fecha, actor,
acción y target (nombre del club si aplica).

#### Scenario: Visualización del log
- **WHEN** un superadmin abre `/admin`
- **THEN** MUST mostrarse hasta 50 entradas ordenadas por `createdAt` descendente

### Requirement: Ruta admin oculta
La ruta `/admin` MUST NOT aparecer en Header, Footer ni sitemap público.

#### Scenario: Navegación pública
- **WHEN** un visitante navega la UI pública
- **THEN** MUST NOT existir enlace visible a `/admin`
