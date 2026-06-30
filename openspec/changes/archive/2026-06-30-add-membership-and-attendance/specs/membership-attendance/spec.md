## ADDED Requirements

### Requirement: Join run with active session
The system MUST allow an authenticated user to register attendance for an internal run by creating a `RunAttendee` record when they submit the join action.

#### Scenario: User joins internal run
- **WHEN** an authenticated user submits join on a run with `signupType = "internal"`
- **THEN** a `RunAttendee` row MUST be created linking the user and run
- **THEN** the run detail page MUST show the button in "going" state
- **THEN** the attendee count MUST increase by one after revalidation

### Requirement: Leave run with active session
The system MUST allow an authenticated user to cancel attendance by removing their `RunAttendee` record when they submit the leave action.

#### Scenario: User leaves run
- **WHEN** an authenticated user who is attending submits the leave action
- **THEN** the `RunAttendee` row MUST be removed
- **THEN** the button MUST return to "join" state
- **THEN** the attendee count MUST decrease by one after revalidation

### Requirement: Join club with active session
The system MUST allow an authenticated user to join a club by creating a `ClubMember` record with role `MEMBER`.

#### Scenario: User joins club
- **WHEN** an authenticated user submits join on a club detail page
- **THEN** a `ClubMember` row MUST be created with role `MEMBER`
- **THEN** the button MUST show member state
- **THEN** the member count MUST increase after revalidation

### Requirement: Leave club with active session
The system MUST allow an authenticated user to leave a club by removing their `ClubMember` record.

#### Scenario: User leaves club
- **WHEN** an authenticated member submits the leave action
- **THEN** the `ClubMember` row MUST be removed
- **THEN** the button MUST return to join state

### Requirement: Idempotent join operations
Join actions MUST be idempotent; repeated submissions MUST NOT create duplicate attendance or membership records.

#### Scenario: Double join on run
- **WHEN** an authenticated user submits join twice for the same run
- **THEN** exactly one `RunAttendee` row MUST exist for that user and run

#### Scenario: Double join on club
- **WHEN** an authenticated user submits join twice for the same club
- **THEN** exactly one `ClubMember` row MUST exist for that user and club

### Requirement: Redirect unauthenticated users to login
The system MUST redirect users without an active session to `/acceso` with a `next` parameter pointing to the current resource URL when they attempt join or leave via Server Action.

#### Scenario: Unauthenticated join run action
- **WHEN** a user without session triggers `joinRun` or `leaveRun`
- **THEN** the system MUST redirect to `/acceso?next=/carreras/{slug}`

#### Scenario: Unauthenticated join club action
- **WHEN** a user without session triggers `joinClub` or `leaveClub`
- **THEN** the system MUST redirect to `/acceso?next=/clubs/{slug}`

#### Scenario: Unauthenticated user sees login link on run button
- **WHEN** a user without session views an internal run detail page
- **THEN** the join button MUST link to `/acceso?next=/carreras/{slug}`

### Requirement: External signup runs unaffected
Runs with `signupType = "external"` MUST NOT render the internal join button; `ExternalSignupButton` MUST remain the only signup control.

#### Scenario: External run detail
- **WHEN** a run has `signupType = "external"` and a valid external URL
- **THEN** `JoinRunButton` MUST NOT be rendered
- **THEN** `ExternalSignupButton` MUST be shown instead
