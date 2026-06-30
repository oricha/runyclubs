## ADDED Requirements

### Requirement: Página /cuenta protegida
La ruta `/cuenta` MUST exigir sesión activa en Server Component además del middleware,
y MUST redirigir a `/acceso` si no hay usuario autenticado.

#### Scenario: Usuario sin sesión
- **WHEN** un usuario sin sesión accede a `/cuenta` (p. ej. bypass de middleware)
- **THEN** el Server Component MUST redirigir a `/acceso`

#### Scenario: Usuario autenticado
- **WHEN** un usuario con sesión visita `/cuenta`
- **THEN** MUST mostrarse cabecera con nombre, email y avatar (o iniciales)

### Requirement: Listado de clubs del usuario
La página MUST listar los `ClubMember` del usuario ordenados por `joinedAt` descendente,
con nombre, ciudad y enlace al club.

#### Scenario: Club con rol OWNER
- **WHEN** el usuario tiene rol `OWNER` en un club
- **THEN** MUST mostrarse badge «Fundador» en la tarjeta del club

#### Scenario: Club con rol ADMIN
- **WHEN** el usuario tiene rol `ADMIN` en un club
- **THEN** MUST mostrarse badge «Admin» en la tarjeta del club

#### Scenario: Sin membresías
- **WHEN** el usuario no pertenece a ningún club
- **THEN** MUST mostrarse mensaje vacío y CTA «Explora clubs» hacia `/clubs`

### Requirement: Carreras del usuario
La página MUST listar las carreras a las que el usuario está apuntado, separadas en
próximas (`startAt >= now()`) y pasadas (`startAt < now()`).

#### Scenario: Próximas carreras
- **WHEN** existen asistencias con `startAt` futuro
- **THEN** MUST mostrarse en sección «Próximas carreras» con badge «Próxima»

#### Scenario: Sin próximas carreras
- **WHEN** no hay asistencias futuras
- **THEN** MUST mostrarse mensaje vacío y CTA «Descubre carreras» hacia `/carreras`

#### Scenario: Carreras pasadas
- **WHEN** existen asistencias con `startAt` pasado
- **THEN** MUST mostrarse en sección «Carreras pasadas»

#### Scenario: Sin carreras pasadas
- **WHEN** no hay asistencias pasadas
- **THEN** la sección «Carreras pasadas» MUST ocultarse

### Requirement: Edición de nombre
El sistema MUST permitir actualizar `User.name` mediante Server Action con validación
de longitud (2–80 caracteres tras trim).

#### Scenario: Nombre válido
- **WHEN** el usuario guarda un nombre con al menos 2 caracteres
- **THEN** MUST persistirse en base de datos y reflejarse tras `revalidatePath('/cuenta')`

#### Scenario: Nombre inválido
- **WHEN** el nombre tiene menos de 2 caracteres tras trim
- **THEN** MUST devolverse error sin modificar la base de datos

### Requirement: Edición de ciudad
El sistema MUST permitir actualizar `User.city` con un slug de `CITY_DETAILS` o `null`.

#### Scenario: Ciudad seleccionada
- **WHEN** el usuario elige una ciudad del selector
- **THEN** MUST persistirse el slug en `User.city` y revalidarse `/cuenta`

#### Scenario: Sin ciudad
- **WHEN** el usuario elige la opción vacía del selector
- **THEN** MUST guardarse `null` en `User.city`

### Requirement: Avatar con fallback de iniciales
Si `session.user.image` es null, MUST mostrarse iniciales del nombre (primera letra del
nombre y del apellido si existe) en un círculo con fondo muted.

#### Scenario: Sin imagen de perfil
- **WHEN** el usuario no tiene `image` en sesión
- **THEN** MUST renderizarse iniciales en lugar de foto
