# 2026-09-13 Desktop Integration Source Note

## Source scope

This note records the desktop integration contract agreed on 2026-09-13 and
facts observed in these source files:

- macOS client: `Sources/StriaStudio/DesktopAPI.swift` and
  `Sources/StriaStudio/Models.swift`
- Laravel desktop implementation: `routes/api.php`,
  `app/Http/Controllers/Desktop/AuthController.php`,
  `app/Http/Controllers/Desktop/StudioController.php`,
  `app/Http/Middleware/EnsureDesktopAdmin.php`,
  `app/Support/DesktopApi.php`, and
  `app/Support/DesktopAppointmentSchedule.php`
- existing data invariants: `app/Support/AppointmentSessions.php`, the
  `Customer`, `Appointment`, `Service`, and `Setting` models, and their database
  migrations

## Recorded facts

- The dedicated API namespace is `/api/desktop` with login, logout, state,
  customer create/update, appointment create/update, and working-hours update.
- Authentication uses a seven-day Laravel Sanctum bearer token restricted to
  the `desktop:manage` ability and to users accepted by the Filament admin
  access rule.
- `GET /state` returns customers, appointments, services, main-site working
  hours, and the `Europe/Istanbul` timezone. Hours use seven Sunday-first day
  objects and minutes after midnight.
- Customer and appointment PATCH requests use optimistic concurrency. Every
  entity response contains an opaque SHA-256 `revision`; a mismatched revision
  returns `409` with the current entity. Hours use the same compare-before-write
  rule through `expected_hours`.
- Confirmed appointment writes are checked against main-site working hours and
  other confirmed appointments.
- Desktop writes are field-limited. Customer photos, Instagram, and mobile-user
  link are not exposed and remain untouched. Appointment payment, photo,
  campaign, and mobile-user fields remain untouched. Session metadata is
  read-only; existing package rules are resynchronized after relevant edits.
- No desktop delete, photo-management, payment-management, campaign-linking, or
  session-package construction endpoint is part of this version.
- A local QA fixture was created under `/tmp/stria-desktop-qa.yREOLR` with PHP
  8.5.3, a new SQLite database, isolated Laravel storage, array cache, file
  sessions, array mail, and synchronous queue. It contains one disposable admin,
  two fictitious customers, one 60-minute service, main-site hours Monday through
  Saturday 09:00–19:00, and one confirmed appointment on the next weekday in the
  current month at 15:00.
- The fixture does not load or modify the repository `.env`, MAMP/live database,
  or real customer data. Its startup script aborts if shared Laravel config cache
  appears or port 8017 is occupied.
- As of this note, the desktop backend has not been deployed to production;
  current production behavior is unchanged.

## Sources

- Source files listed under "Source scope"
- 2026-09-13 desktop integration brief and implementation review
