# club-onboarding Specification

## Purpose
TBD - created by archiving change add-club-onboarding. Update Purpose after archive.
## Requirements
### Requirement: Onboarding route requires authentication
The system MUST protect `/onboarding/club` so only authenticated users can access the club creation wizard.

#### Scenario: Unauthenticated access to onboarding
- **WHEN** a user without an active session navigates to `/onboarding/club`
- **THEN** the system MUST redirect to `/acceso` with a return URL to the onboarding route

#### Scenario: Authenticated access to onboarding
- **WHEN** a user with an active session navigates to `/onboarding/club`
- **THEN** the club creation wizard MUST be displayed

### Requirement: Multi-step wizard with per-step validation
The onboarding wizard MUST collect club data across five steps and MUST validate each step before allowing the user to advance.

#### Scenario: Step validation blocks advance
- **WHEN** the user clicks "Siguiente" on step 1 without a valid club name (minimum 2 characters)
- **THEN** an inline validation error MUST be shown
- **THEN** the wizard MUST NOT advance to the next step

#### Scenario: Minimum recurring runs required
- **WHEN** the user clicks "Siguiente" on step 2 with zero recurring runs
- **THEN** an inline validation error MUST be shown
- **THEN** the wizard MUST NOT advance to the next step

### Requirement: Unique slug generation from club name
The system MUST generate a URL-safe unique slug from the club name using `slugify`, resolving collisions with numeric suffixes.

#### Scenario: Slug collision resolution
- **WHEN** a club is created with a name whose base slug already exists
- **THEN** the system MUST assign a slug with a numeric suffix (e.g. `{base}-1`)

### Requirement: Atomic club creation transaction
The `createClub` Server Action MUST create the club and all related records atomically within a single database transaction.

#### Scenario: Successful club creation
- **WHEN** a valid `createClub` request is submitted by an authenticated user
- **THEN** a `Club` record MUST be created with `ownerId` set to the session user
- **THEN** `usesPlatform` MUST be `true` and `verified` MUST be `false`
- **THEN** `frequency` MUST equal the number of recurring runs created
- **THEN** at least one `RecurringRun` MUST be created for the club
- **THEN** `ClubType` rows MUST be created for each selected run type
- **THEN** a `ClubMember` row MUST be created with role `OWNER` for the creator

#### Scenario: Transaction rollback on failure
- **WHEN** any step inside the creation transaction fails
- **THEN** no partial club data MUST remain in the database

### Requirement: Future run instances generated after creation
After a club is successfully created, the system MUST invoke run generation so future `Run` instances exist for the new recurring runs.

#### Scenario: Runs created after onboarding
- **WHEN** `createClub` completes successfully
- **THEN** `generateRuns` MUST be called
- **THEN** at least one scheduled `Run` MUST exist for the new club when generation succeeds

### Requirement: Immediate publication without moderation queue
Newly created clubs MUST be visible in the clubs directory immediately without prior admin approval.

#### Scenario: Club visible after publish
- **WHEN** the user completes the wizard and publishes the club
- **THEN** the club MUST appear in `/clubs` listings with `verified: false`

### Requirement: Success screen after publication
After successful club creation, the wizard MUST display a success screen with navigation to the new club.

#### Scenario: Success screen actions
- **WHEN** `createClub` returns `{ success: true, slug }`
- **THEN** a success message MUST be shown with the club name
- **THEN** a "Ver mi club" action MUST navigate to `/clubs/{slug}`
- **THEN** a "Copiar enlace" action MUST copy the club URL to the clipboard

### Requirement: Server-side validation mirrors wizard validation
The `createClub` Server Action MUST re-validate all required fields and MUST return `{ success: false, error }` on invalid input without losing client wizard state.

#### Scenario: Server rejects invalid payload
- **WHEN** `createClub` receives a description shorter than 20 characters
- **THEN** MUST return `{ success: false, error: string }` without creating database records

