# Site Settings CMS — Phase 2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Move business/contact settings from `frontend/lib/site.ts` into a DB singleton, editable in Filament, served by `GET /api/settings`, consumed via a `SettingsProvider`. No behavior change for current values.

**Architecture:** A single-row `settings` table seeded from `site.ts`, a Filament settings screen, and `GET /api/settings`. Frontend `getSettings()` + `SettingsProvider` feed client components; server components fetch directly. `phoneHref` derived on the frontend; hours structured → schema + a bilingual `formatHours`. `apiUrl`/`siteUrl`/`gbpUrl` stay in `site.ts`.

**Tech Stack:** Next.js 16 · Tailwind v4 · Laravel 13.19 · Filament v4.11 · MySQL · PHPUnit.

## Global Constraints

- Only these move to DB: phone, phone_local, whatsapp, instagram, instagram_handle, address, NAP (street_address, locality, region, postal_code, country), lat, lng, hours. **`apiUrl`, `siteUrl`, `gbpUrl`, and `nap.name` (business name) stay in `site.ts`.**
- `phoneHref` is derived (`"tel:" + phone.replace(/[^\d+]/g,"")`), not stored.
- Hours structured: `[{days:string[], open:string, close:string}]` (day names in English like the current `site.hours`, for schema.org). Display derived bilingually.
- Reuse Phase-1 patterns verbatim: API resource ← mirror `backend/app/Http/Resources/ServiceListResource.php`; provider ← mirror `frontend/components/ServicesProvider.tsx`; content fetch ← extend `frontend/lib/content.ts` (same `api<T>` helper, ISR 300, safe fallback).
- Filament v4.11 split-class conventions (see `backend/app/Filament/Resources/Services/**`).
- Tests: sqlite `:memory:`, `php artisan test`.
- No behavior change: seeded settings equal current `site.ts` values; `beautySalonSchema` output unchanged; contact bar still bilingual.
- Both dev servers run: frontend :3001, Laravel :8002.

Current `site.ts` values to migrate (verbatim):
```
phone            "+90 507 732 30 26"
phone_local      "0507 732 30 26"
whatsapp         "https://wa.me/905077323026"
instagram        "https://instagram.com/striastudio"
instagram_handle "@striastudio"
address          "Çankaya, Ankara"
street_address   "[Mahalle] Cd. No: 00"
locality         "Çankaya"
region           "Ankara"
postal_code      "06000"
country          "TR"
lat              39.9208
lng              32.8541
hours            [{ "days": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], "open":"10:00", "close":"19:00" }]
```

---

### Task 1: `settings` migration + `Setting` model (TDD)

**Files:**
- Create: `backend/database/migrations/xxxx_create_settings_table.php`
- Create: `backend/app/Models/Setting.php`
- Create: `backend/database/factories/SettingFactory.php`
- Test: `backend/tests/Feature/SettingModelTest.php`

**Interfaces:**
- Produces: `Setting` with `hours` cast `array`, `lat`/`lng` cast `decimal:7`, and a static `Setting::current(): Setting` = `static::firstOrCreate(['id' => 1])`.

- [ ] **Step 1: Failing test**

`backend/tests/Feature/SettingModelTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_current_returns_single_row(): void
    {
        $a = Setting::current();
        $b = Setting::current();
        $this->assertSame($a->id, $b->id);
        $this->assertSame(1, Setting::count());
    }

    public function test_hours_casts_to_array(): void
    {
        $s = Setting::current();
        $s->update(['hours' => [['days' => ['Monday'], 'open' => '10:00', 'close' => '19:00']]]);
        $this->assertSame('10:00', $s->fresh()->hours[0]['open']);
    }
}
```

- [ ] **Step 2: Run → RED** — `cd backend && php artisan test --filter=SettingModelTest` (fails: no model/table).

- [ ] **Step 3: Migration** — `php artisan make:migration create_settings_table`, `up()`:
```php
Schema::create('settings', function (Blueprint $table) {
    $table->id();
    $table->string('phone')->nullable();
    $table->string('phone_local')->nullable();
    $table->string('whatsapp')->nullable();
    $table->string('instagram')->nullable();
    $table->string('instagram_handle')->nullable();
    $table->string('address')->nullable();
    $table->string('street_address')->nullable();
    $table->string('locality')->nullable();
    $table->string('region')->nullable();
    $table->string('postal_code')->nullable();
    $table->string('country')->nullable();
    $table->decimal('lat', 10, 7)->nullable();
    $table->decimal('lng', 10, 7)->nullable();
    $table->json('hours')->nullable();
    $table->timestamps();
});
```

- [ ] **Step 4: Model** — `backend/app/Models/Setting.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'hours' => 'array',
        'lat' => 'decimal:7',
        'lng' => 'decimal:7',
    ];

    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1]);
    }
}
```

- [ ] **Step 5: Factory** — `backend/database/factories/SettingFactory.php`:
```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SettingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'phone' => '+90 500 000 00 00',
            'phone_local' => '0500 000 00 00',
            'whatsapp' => 'https://wa.me/900000000000',
            'instagram' => 'https://instagram.com/x',
            'instagram_handle' => '@x',
            'address' => 'Çankaya, Ankara',
            'street_address' => 'St 1',
            'locality' => 'Çankaya',
            'region' => 'Ankara',
            'postal_code' => '06000',
            'country' => 'TR',
            'lat' => 39.9208,
            'lng' => 32.8541,
            'hours' => [['days' => ['Monday'], 'open' => '10:00', 'close' => '19:00']],
        ];
    }
}
```

- [ ] **Step 6: Migrate + Run → GREEN** — `php artisan migrate && php artisan test --filter=SettingModelTest` (2 pass).

- [ ] **Step 7: Commit**
```bash
git add backend/database/migrations backend/app/Models/Setting.php backend/database/factories/SettingFactory.php backend/tests/Feature/SettingModelTest.php
git commit -m "feat(settings): settings table + model + current() singleton"
```

---

### Task 2: `SettingSeeder`

**Files:**
- Create: `backend/database/seeders/SettingSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`

- [ ] **Step 1: Seeder** — `updateOrCreate(['id'=>1], [...])` with the exact values from the Global Constraints table above (verbatim, incl. the hours JSON).
```php
<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::updateOrCreate(['id' => 1], [
            'phone' => '+90 507 732 30 26',
            'phone_local' => '0507 732 30 26',
            'whatsapp' => 'https://wa.me/905077323026',
            'instagram' => 'https://instagram.com/striastudio',
            'instagram_handle' => '@striastudio',
            'address' => 'Çankaya, Ankara',
            'street_address' => '[Mahalle] Cd. No: 00',
            'locality' => 'Çankaya',
            'region' => 'Ankara',
            'postal_code' => '06000',
            'country' => 'TR',
            'lat' => 39.9208,
            'lng' => 32.8541,
            'hours' => [[
                'days' => ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                'open' => '10:00',
                'close' => '19:00',
            ]],
        ]);
    }
}
```

- [ ] **Step 2: Register** in `DatabaseSeeder::run()`: `$this->call(SettingSeeder::class);`

- [ ] **Step 3: Seed** — `cd backend && php artisan db:seed --class=SettingSeeder` (no error).

- [ ] **Step 4: Verify** — `php artisan tinker --execute="\$s=App\Models\Setting::current(); echo \$s->phone.' | '.\$s->hours[0]['open'].' | '.\$s->lat;"` → `+90 507 732 30 26 | 10:00 | 39.9208000`.

- [ ] **Step 5: Commit**
```bash
git add backend/database/seeders
git commit -m "feat(settings): seed current site.ts values"
```

---

### Task 3: Settings API (TDD)

**Files:**
- Create: `backend/app/Http/Resources/SettingResource.php`
- Create: `backend/app/Http/Controllers/SettingController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/SettingApiTest.php`

**Interfaces:**
- Produces: `GET /api/settings` → `{ data: { phone, phone_local, whatsapp, instagram, instagram_handle, address, street_address, locality, region, postal_code, country, lat, lng, hours } }`.

- [ ] **Step 1: Failing test** — `backend/tests/Feature/SettingApiTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SettingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_settings_object(): void
    {
        Setting::current()->update(['phone' => '+90 507 732 30 26']);

        $this->getJson('/api/settings')
            ->assertOk()
            ->assertJsonPath('data.phone', '+90 507 732 30 26')
            ->assertJsonStructure(['data' => ['whatsapp', 'lat', 'lng', 'hours', 'address']]);
    }
}
```

- [ ] **Step 2: Run → RED** — `php artisan test --filter=SettingApiTest`.

- [ ] **Step 3: Resource** — `backend/app/Http/Resources/SettingResource.php`:
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'phone' => $this->phone,
            'phone_local' => $this->phone_local,
            'whatsapp' => $this->whatsapp,
            'instagram' => $this->instagram,
            'instagram_handle' => $this->instagram_handle,
            'address' => $this->address,
            'street_address' => $this->street_address,
            'locality' => $this->locality,
            'region' => $this->region,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'hours' => $this->hours ?? [],
        ];
    }
}
```

- [ ] **Step 4: Controller** — `backend/app/Http/Controllers/SettingController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Http\Resources\SettingResource;
use App\Models\Setting;

class SettingController extends Controller
{
    public function show()
    {
        return new SettingResource(Setting::current());
    }
}
```

- [ ] **Step 5: Route** — append to `backend/routes/api.php`:
```php
use App\Http\Controllers\SettingController;

Route::get('/settings', [SettingController::class, 'show']);
```

- [ ] **Step 6: Run → GREEN** — `php artisan test --filter=SettingApiTest` (1 pass).

- [ ] **Step 7: Live** — `curl -s http://127.0.0.1:8002/api/settings` → returns the seeded object.

- [ ] **Step 8: Commit**
```bash
git add backend/app/Http backend/routes/api.php backend/tests/Feature/SettingApiTest.php
git commit -m "feat(settings): public GET /api/settings"
```

---

### Task 4: Filament settings screen (checkpoint)

**Files:**
- Create: `backend/app/Filament/Pages/ManageSettings.php` (+ blade view) — OR a single-record `SettingResource` (fallback).

**Context:** Filament v4.11 (see `backend/app/Filament/Resources/Services/**` for component/namespace conventions). This is a **singleton** editor.

- [ ] **Step 1: Choose the approach that boots cleanly (checkpoint)**
Try a custom Filament Page with a form first:
- `ManageSettings extends Filament\Pages\Page implements HasForms; use InteractsWithForms;`
- `public ?array $data = [];`
- `mount()`: `$this->form->fill(Setting::current()->attributesToArray());`
- `form(Schema $schema)`: components grouped (İletişim: phone, phone_local, whatsapp, instagram, instagram_handle, address; Adres: street_address, locality, region, postal_code, country; Konum: lat, lng; Çalışma Saatleri: `Repeater::make('hours')->schema([Select::make('days')->multiple()->options([...7 days...]), TextInput::make('open'), TextInput::make('close')])`), `->statePath('data')`.
- A `save()` action: `Setting::current()->update($this->form->getState());` + success notification.
- Minimal blade view rendering `{{ $this->form }}` + a save button (or a header action calling `save`).

**If the custom-page+form pattern is problematic in v4.11**, fall back to a
`SettingResource` (`php artisan make:filament-resource Setting`) with the same form
groups, and make its landing page redirect to editing record id=1 (create one via
the seeder; hide the Create action). Record which approach you used.

- [ ] **Step 2: Gate (no browser)**
- `php -l` clean on new PHP files.
- `php artisan route:list --path=admin | grep -i setting` → the settings page/resource route present.
- `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8002/admin/<settings-path>` → 302 (auth redirect, not 500).
- `php artisan filament:optimize-clear` → no error.
- The `hours` repeater must store the SAME shape as the model/API/seed: `[{days:[], open, close}]` (a normal repeater with `days`/`open`/`close` fields does this). Confirm in code.

- [ ] **Step 3: Commit**
```bash
git add backend/app/Filament backend/resources/views
git commit -m "feat(admin): Filament settings screen"
```

---

### Task 5: `lib/content` settings + helpers + `SettingsProvider` + layout

**Files:**
- Modify: `frontend/lib/content.ts`
- Create: `frontend/components/SettingsProvider.tsx`
- Modify: `frontend/app/layout.tsx`

**Interfaces:**
- Produces: `Settings` type; `getSettings(): Promise<Settings | null>`; `phoneHref(phone: string): string`; `formatHours(hours: {days:string[];open:string;close:string}[], lang: "tr"|"en"): string`; `SettingsProvider({settings, children})` + `useSettings(): Settings`.
- `SETTINGS_FALLBACK` (a non-null default) so `useSettings()` never returns null.

- [ ] **Step 1: Extend `lib/content.ts`**
Add:
```ts
export type Hours = { days: string[]; open: string; close: string };
export type Settings = {
  phone: string; phone_local: string;
  whatsapp: string; instagram: string; instagram_handle: string;
  address: string;
  street_address: string; locality: string; region: string; postal_code: string; country: string;
  lat: number | string | null; lng: number | string | null;
  hours: Hours[];
};

export const SETTINGS_FALLBACK: Settings = {
  phone: "+90 507 732 30 26", phone_local: "0507 732 30 26",
  whatsapp: "https://wa.me/905077323026",
  instagram: "https://instagram.com/striastudio", instagram_handle: "@striastudio",
  address: "Çankaya, Ankara",
  street_address: "[Mahalle] Cd. No: 00", locality: "Çankaya", region: "Ankara", postal_code: "06000", country: "TR",
  lat: 39.9208, lng: 32.8541,
  hours: [{ days: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"], open: "10:00", close: "19:00" }],
};

export async function getSettings(): Promise<Settings | null> {
  const out = await api<{ data: Settings }>("/settings");
  return out?.data ?? null;
}

export function phoneHref(phone: string): string {
  return "tel:" + (phone || "").replace(/[^\d+]/g, "");
}

const DAY_NAMES: Record<string, { tr: string; en: string }> = {
  Monday: { tr: "Pzt", en: "Mon" }, Tuesday: { tr: "Sal", en: "Tue" },
  Wednesday: { tr: "Çar", en: "Wed" }, Thursday: { tr: "Per", en: "Thu" },
  Friday: { tr: "Cum", en: "Fri" }, Saturday: { tr: "Cmt", en: "Sat" },
  Sunday: { tr: "Paz", en: "Sun" },
};

export function formatHours(hours: Hours[], lang: "tr" | "en"): string {
  if (!hours?.length) return "";
  return hours
    .map((h) => {
      const ds = h.days.map((d) => DAY_NAMES[d]?.[lang] ?? d);
      const dayLabel = ds.length > 1 ? `${ds[0]} – ${ds[ds.length - 1]}` : ds[0];
      return `${dayLabel} · ${h.open} – ${h.close}`;
    })
    .join(", ");
}
```

- [ ] **Step 2: `SettingsProvider`** — mirror `ServicesProvider.tsx`; default context value = `SETTINGS_FALLBACK`; provider accepts `settings: Settings | null` and provides `settings ?? SETTINGS_FALLBACK`:
```tsx
"use client";
import { createContext, useContext } from "react";
import { SETTINGS_FALLBACK, type Settings } from "@/lib/content";

const SettingsContext = createContext<Settings>(SETTINGS_FALLBACK);

export function SettingsProvider({ settings, children }: { settings: Settings | null; children: React.ReactNode }) {
  return <SettingsContext.Provider value={settings ?? SETTINGS_FALLBACK}>{children}</SettingsContext.Provider>;
}
export function useSettings(): Settings {
  return useContext(SettingsContext);
}
```

- [ ] **Step 3: `layout.tsx`** — fetch settings + services in parallel, wrap:
```tsx
import { SettingsProvider } from "@/components/SettingsProvider";
import { getServices, getSettings } from "@/lib/content";
// ...
const [services, settings] = await Promise.all([getServices(), getSettings()]);
// ...
<LanguageProvider>
  <SettingsProvider settings={settings}>
    <ServicesProvider services={services}>{children}</ServicesProvider>
  </SettingsProvider>
</LanguageProvider>
```
Keep `<JsonLd data={beautySalonSchema()} />` — but `beautySalonSchema` becomes async in Task 7; for now if it needs settings, Task 7 handles it. In THIS task leave the existing `beautySalonSchema()` call as-is (it still reads `site.*` until Task 7/8). Do not break it.

- [ ] **Step 4: Verify** — `cd frontend && npx tsc --noEmit` → clean; `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/` → 200. No consumer changed yet.

- [ ] **Step 5: Commit**
```bash
git add frontend/lib/content.ts frontend/components/SettingsProvider.tsx frontend/app/layout.tsx
git commit -m "feat(settings): content getSettings + helpers + SettingsProvider"
```

---

### Task 6: Rewire client consumers

**Files:**
- Modify: `frontend/components/Nav.tsx`, `Footer.tsx`, `Hero.tsx`, `Contact.tsx`, `CallLabel.tsx`, `WhatsAppFab.tsx`

**Interfaces:** consume `useSettings()` + `phoneHref` + `formatHours`.

For each, replace `site.<field>` with `settings.<field>` (via `const settings = useSettings();`) and `site.phoneHref` with `phoneHref(settings.phone)`:
- **Nav.tsx**: `settings.phone` (contact bar + call button), `phoneHref(settings.phone)`, `settings.instagram` (ig link), `settings.whatsapp` (wa). Contact bar `barLoc` → `settings.address`; `barHours` → `formatHours(settings.hours, lang)` (both were `t.barLoc`/`t.barHours` — swap to settings-derived; `lang` already available). Keep `t.callLabel`, `t.navCta` etc.
- **Footer.tsx**: `settings.address`, `phoneHref(settings.phone)`, `settings.phone` (via `t.phone`? — replace `t.phone` usages that show the number with `settings.phone`), `settings.instagram`, `settings.instagram_handle`, `settings.whatsapp`. `t.barHours` in footer → `formatHours(settings.hours, lang)`.
- **Hero.tsx**: `settings.whatsapp`, `phoneHref(settings.phone)`.
- **Contact.tsx**: `settings.whatsapp`, `phoneHref(settings.phone)`, `settings.phone` (the phone display button).
- **CallLabel.tsx**: `settings.phone_local` (replace `site.phoneLocal`).
- **WhatsAppFab.tsx**: currently a server component using `site.wa`. Convert to a client component (`"use client"`) reading `useSettings().whatsapp`. (It renders inside layout, which is under SettingsProvider — a client child is fine.)

Note: `t.phone`, `t.barHours`, `t.barLoc` in the i18n dict are now superseded by settings-derived values in these components. Do NOT delete them from i18n in this task (Task 8 cleanup) — just stop reading them here where replaced.

- [ ] **Step 1** — rewire all 6 components (read each fully first; preserve markup/classes; swap data source only).
- [ ] **Step 2: Verify** — `cd frontend && npx tsc --noEmit` → clean; `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/` → 200; `curl -s http://127.0.0.1:3001/ | grep -c "507 732 30 26"` → ≥1 (phone from settings renders); `grep -rn "site\.\(phone\|phoneHref\|phoneLocal\|wa\|ig\|igHandle\|address\)" components/Nav.tsx components/Footer.tsx components/Hero.tsx components/Contact.tsx components/CallLabel.tsx components/WhatsAppFab.tsx` → no matches.
- [ ] **Step 3: Commit**
```bash
git add frontend/components/Nav.tsx frontend/components/Footer.tsx frontend/components/Hero.tsx frontend/components/Contact.tsx frontend/components/CallLabel.tsx frontend/components/WhatsAppFab.tsx
git commit -m "feat(settings): client components read contact info from settings"
```

---

### Task 7: Rewire server consumers (schema + StudioMap) + async beautySalonSchema

**Files:**
- Modify: `frontend/components/schema.ts`, `frontend/components/StudioMap.tsx`, `frontend/app/layout.tsx`

**Interfaces:** `beautySalonSchema(settings)` becomes a function taking settings; `StudioMap` reads settings.

- [ ] **Step 1: `schema.ts` `beautySalonSchema`**
Change signature to accept settings: `beautySalonSchema(s: Settings)`. Replace `site.nap.*` with `s.street_address/locality/region/postal_code/country`, `site.geo` with `s.lat/s.lng`, `site.phoneHref` with `phoneHref(s.phone)` (import from content), `site.hours` with `s.hours`, `site.ig`+`site.gbpUrl` in `sameAs` → `[s.instagram, site.gbpUrl].filter(Boolean)`. **Keep** `site.nap.name` (business name), `site.siteUrl`, `site.gbpUrl` from `site.ts` (config). `openingHoursSpecification` maps `s.hours`.

- [ ] **Step 2: `layout.tsx`** — pass settings to schema: `<JsonLd data={beautySalonSchema(settings ?? SETTINGS_FALLBACK)} />` (import `SETTINGS_FALLBACK`). `settings` already fetched in Task 5.

- [ ] **Step 3: `StudioMap.tsx`** — currently server component reading `site.geo`. Make it read settings: simplest = make it a client component (`"use client"`) using `useSettings()` for `lat`/`lng`. (It's used on the `/iletisim` page which is a server page rendering `<StudioMap/>`; a client child is fine.)

- [ ] **Step 4: Verify** — `cd frontend && npx tsc --noEmit` → clean; `curl -s http://127.0.0.1:3001/ | grep -c "BeautySalon"` → ≥1 (schema still emitted); `curl -s http://127.0.0.1:3001/ | grep -c "openingHoursSpecification"` → ≥1; `curl -s http://127.0.0.1:3001/iletisim | grep -c "maps?q="` → ≥1 (map still renders from settings geo).
- [ ] **Step 5: Commit**
```bash
git add frontend/components/schema.ts frontend/components/StudioMap.tsx frontend/app/layout.tsx
git commit -m "feat(settings): schema + map read from settings"
```

---

### Task 8: Cleanup `site.ts` + i18n + full verification

**Files:**
- Modify: `frontend/lib/site.ts`, `frontend/lib/i18n.ts`

- [ ] **Step 1: Confirm no importers of migrated fields**
```bash
cd frontend
grep -rn "site\.\(phone\|phoneLocal\|phoneHref\|wa\|ig\|igHandle\|address\|nap\|geo\|hours\)" app components lib || echo "no migrated-field importers"
```
Expected: prints "no migrated-field importers". (`site.apiUrl`, `site.siteUrl`, `site.gbpUrl`, `site.nap.name` may remain — those stay.) If a `site.nap.name` reader exists (schema business name), that's allowed — keep `nap: { name }` in site.ts.

- [ ] **Step 2: Trim `site.ts`** — keep `apiUrl`, `siteUrl`, `gbpUrl`, and `nap: { name: "Stria Studio" }` (business name only). Remove `phone, phoneLocal, phoneHref, wa, ig, igHandle, address, geo, hours` and the NAP address sub-fields (streetAddress/locality/region/postalCode/country — now in settings). Keep `nap.name`.

- [ ] **Step 3: Trim i18n** — remove `barLoc` and `barHours` from the `Dict` type + both locales (now derived from settings via `formatHours`/`address`). Confirm no remaining readers: `grep -rn "barLoc\|barHours" app components` → none.

- [ ] **Step 4: Full verification**
```bash
cd frontend && npx tsc --noEmit && npm run build 2>&1 | tail -20
```
Clean build; all routes prerender. Then live:
- `curl -s http://127.0.0.1:3001/ | grep -c "507 732 30 26"` → ≥1 (phone from settings)
- `curl -s http://127.0.0.1:3001/ | grep -c "BeautySalon"` → ≥1 (schema)
- contact bar hours render (`curl -s http://127.0.0.1:3001/ | grep -c "10:00"` → ≥1)
- `/iletisim` map renders
- `cd ../backend && php artisan test` → all pass (Setting model + API + prior suites green)
- Admin: `/admin/<settings>` edits persist and reflect on the site within the revalidate window.

- [ ] **Step 5: Commit**
```bash
git add frontend/lib/site.ts frontend/lib/i18n.ts
git commit -m "refactor(settings): drop migrated site.ts + i18n fields (now admin-managed)"
```

---

## Final verification (Phase 2)
- [ ] `cd frontend && npx tsc --noEmit && npm run build` → clean.
- [ ] `cd backend && php artisan test` → all pass.
- [ ] Site renders identically to before (phone, WhatsApp, Instagram, address, hours, map) — now sourced from DB.
- [ ] `beautySalonSchema` emits the same LocalBusiness shape (telephone, address, geo, openingHoursSpecification, sameAs) from settings.
- [ ] Contact bar shows hours + address in both TR and EN (via `formatHours`/`address`).
- [ ] Editing a setting in `/admin` (e.g. phone) reflects on the site within the revalidate window.
