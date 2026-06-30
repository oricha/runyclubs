## ADDED Requirements

### Requirement: Public newsletter subscription via Server Action
The system MUST expose a public Server Action `subscribeToNewsletter` that persists subscriber emails to the `NewsletterSubscriber` table without requiring user authentication.

#### Scenario: New subscriber email
- **WHEN** a visitor submits a valid email address that is not yet in the database
- **THEN** the system MUST create a `NewsletterSubscriber` record
- **THEN** MUST return `{ success: true, alreadySubscribed: false }`

#### Scenario: Duplicate subscriber email
- **WHEN** a visitor submits a valid email address that already exists in the database
- **THEN** the system MUST NOT create a duplicate row
- **THEN** MUST return `{ success: true, alreadySubscribed: true }`

#### Scenario: Invalid email rejected
- **WHEN** a visitor submits an invalid email format
- **THEN** the Server Action MUST return `{ success: false, error: string }`
- **THEN** MUST NOT write to the database

### Requirement: Newsletter form in footer calls Server Action
The `NewsletterForm` component in the footer MUST call `subscribeToNewsletter` on submit and MUST reflect loading, success, duplicate, and error states in the UI.

#### Scenario: Successful subscription UI
- **WHEN** `subscribeToNewsletter` returns `success: true` and `alreadySubscribed: false`
- **THEN** the form MUST hide and MUST display the success message from i18n

#### Scenario: Duplicate subscription UI
- **WHEN** `subscribeToNewsletter` returns `success: true` and `alreadySubscribed: true`
- **THEN** the form MUST hide and MUST display the neutral duplicate message from i18n

#### Scenario: Loading state during submission
- **WHEN** the Server Action is in progress
- **THEN** the submit button and email input MUST be disabled
- **THEN** MUST show a loading label from i18n

#### Scenario: Server error UI
- **WHEN** `subscribeToNewsletter` returns `success: false`
- **THEN** the form MUST remain visible
- **THEN** MUST display an error message to the user

### Requirement: Server Action error handling
The `subscribeToNewsletter` Server Action MUST catch database and unexpected errors and MUST never throw unhandled exceptions to the client.

#### Scenario: Database failure
- **WHEN** the database operation fails
- **THEN** MUST return `{ success: false, error: string }` without throwing
