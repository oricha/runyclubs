# awards-badges Specification

## Purpose
TBD - created by archiving change add-awards-badges. Update Purpose after archive.
## Requirements
### Requirement: Canonical award catalog
The system MUST expose a canonical award catalog in `lib/awards.ts` that defines keys, icons, labels, and descriptions for all supported badge types.

#### Scenario: Catalog lookup by key
- **WHEN** code calls `getAwardDefinition("founders")`
- **THEN** MUST return the definition with icon, label, and description for the founders badge

#### Scenario: Unknown key returns undefined
- **WHEN** code calls `getAwardDefinition("unknown-key")`
- **THEN** MUST return `undefined` without throwing

### Requirement: AwardBadge renders with accessible tooltip
The `AwardBadge` component MUST render a single award with an accessible label and tooltip showing the award name and optional description.

#### Scenario: Compact badge with tooltip
- **WHEN** `AwardBadge` is rendered with `showLabel={false}` and a known award
- **THEN** MUST display the award icon
- **THEN** MUST expose an accessible name via `aria-label` or visible text
- **THEN** MUST show a tooltip with the award label on hover or focus

#### Scenario: Unknown award key fallback
- **WHEN** `AwardBadge` receives an award key not present in the catalog
- **THEN** MUST render using the `icon` and `label` from the award prop
- **THEN** MUST NOT throw or fail to render

### Requirement: AwardStack compact mode for listings
The `AwardStack` component MUST support a compact mode that displays award icons in a horizontal row suitable for club cards.

#### Scenario: Compact stack renders icons
- **WHEN** `AwardStack` is rendered with `variant="compact"` and a non-empty awards list
- **THEN** MUST render one `AwardBadge` per award with `size="sm"` and no inline label

### Requirement: AwardStack expanded mode for detail pages
The `AwardStack` component MUST support an expanded mode with a toggle button that reveals awards with icon and label.

#### Scenario: Expand awards on club detail
- **WHEN** the user clicks the "Ver premios del club" button in expanded mode
- **THEN** MUST reveal all awards with icon and label visible
- **THEN** the control MUST be a native `<button>` with keyboard focus support

#### Scenario: Collapse expanded awards
- **WHEN** the user clicks the toggle again while awards are expanded
- **THEN** MUST hide the award list and restore the collapsed label

### Requirement: Verified badge derived from club verified flag
When a club has `verified: true`, the UI MUST display the verified badge using the canonical catalog definition without requiring a `ClubAward` database row.

#### Scenario: Verified club shows verified badge
- **WHEN** `resolveClubAwards` is called with `verified: true`
- **THEN** MUST include the verified badge from `AWARD_CATALOG` in the resolved list

### Requirement: Visual verification surface exists
The project MUST provide at least one page or integration where award components can be verified visually before club listing pages exist.

#### Scenario: Demo page renders catalog badges
- **WHEN** a developer navigates to `/demo/awards`
- **THEN** MUST see `AwardBadge` and both `AwardStack` variants with sample data including founders, top-club, and verified badges

