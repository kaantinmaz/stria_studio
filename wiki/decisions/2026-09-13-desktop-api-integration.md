# Desktop API Integration

## Context

The native macOS studio application needs to manage the same customers,
appointments, services, and working hours as the Laravel/Filament backend. A
local JSON file cannot safely coexist with Filament writes, and directly exposing
the full database model would let the desktop overwrite payment, photo, campaign,
mobile-account, or session-package data it does not own.

## Decision

Laravel owns the canonical studio data and exposes a dedicated
`/api/desktop` JSON contract. Filament admin users authenticate with a revocable,
seven-day Sanctum bearer token carrying only `desktop:manage`.

The desktop loads one state snapshot and writes customers, appointments, and
main-site working hours through field-limited endpoints. Customer and appointment
objects include an opaque revision derived from the complete stored record;
PATCH requires the last revision and returns `409` with the current record when
any field changed elsewhere. Working hours use `expected_hours` for the same
compare-before-write behavior.

Appointment validation remains on the server. Confirmed appointments must fit
main-site hours and cannot overlap another confirmed appointment. Existing
session packages retain their current backend invariants: session metadata is
read-only in the desktop contract, a child cannot change customer or service
away from its root, and package resync runs after package edits.

Desktop endpoints omit delete, photo, payment, campaign-linking, mobile-account
pairing, and package-construction operations. Their underlying fields stay
untouched by customer and appointment updates.

## Consequences

- Filament and macOS share one canonical database without silent last-writer-wins
  overwrites.
- The API was deployed on 2026-09-13 after source hash checks, backup, PHP syntax checks and local tests. Production data was read only for shape/count verification; native write checks used isolated SQLite fixtures. See [deployment record](../../docs/DESKTOP_API.md).
- Changes made outside the desktop appear after the next state fetch. This
  version has no live push synchronization.
- Existing working-hour schedules with split or duplicate periods for one day
  cannot round-trip through the desktop's single-period-per-day model; the API
  returns a conflict instead of collapsing them.
- The desktop can display session metadata but needs a future contract extension
  to create, delete, split, or merge session packages or manage preserved fields.

## Sources

- [[raw/2026-09-13-desktop-integration-source-note]]
