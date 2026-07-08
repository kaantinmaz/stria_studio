# Services CMS — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the service catalog into the DB, editable via Filament, served by a public API, consumed by the frontend — no content loss, no SEO regression.

**Architecture:** A Laravel `services` table (bilingual + JSON repeaters) seeded from the current static data, a Filament `ServiceResource`, and `GET /api/services` + `/api/services/{slug}`. The frontend fetches via `lib/content.ts`; a `ServicesProvider` (one server fetch in `layout.tsx`) feeds the client components that used the static `SERVICES`, while server pages fetch directly. EN empty → TR fallback via `pickLang`.

**Tech Stack:** Next.js 16 (App Router, TS) · Tailwind v4 · Laravel 13.19 · Filament v4.11 · MySQL · PHPUnit.

## Global Constraints

- Bilingual TR/EN; **TR is default/server-rendered**. Frontend picks with EN→TR fallback: `pickLang(tr, en, lang) = lang === "en" ? (en || tr) : tr`.
- API base `site.apiUrl` (`http://127.0.0.1:8002` dev), served under `/api`. Frontend server fetches use `{ next: { revalidate: 300 } }`.
- Reuse existing helpers/patterns verbatim: blog API pattern (`PostListResource`/`PostApiResource`/`BlogController`), `absUrl`, `buildMetadata`, `breadcrumbSchema`, `JsonLd`, `Breadcrumbs`, `ImageSlot`, `LanguageProvider`/`useLang`.
- Filament v4.11 split-class resources (`Resource` + `Schemas/*Form` + `Tables/*Table`); namespaces `Filament\Schemas\Schema`, `Filament\Schemas\Components\Tabs`, `Filament\Actions\*`. Ground-truth = the generator's stub for this version.
- Tests run against sqlite `:memory:` (RefreshDatabase). `php artisan test`.
- No content loss: seeded services must equal current live pages (same TR text, slugs, order). No SEO regression on the 7 `/hizmetler/{slug}` pages.
- Do not delete static `HOME_FAQ` (Phase 3). Only remove service-related static data, and only after all consumers are migrated.
- Both dev servers run: frontend :3001, Laravel API :8002.

---

### Task 1: `services` migration + `Service` model (TDD)

**Files:**
- Create: `backend/database/migrations/xxxx_create_services_table.php`
- Create: `backend/app/Models/Service.php`
- Create: `backend/database/factories/ServiceFactory.php`
- Test: `backend/tests/Feature/ServiceModelTest.php`

**Interfaces:**
- Produces: `Service` with `scopeActive()` (is_active=true, ordered by sort_order), array casts for `keywords_tr/en, benefits_tr/en, process_tr/en, faq_tr/en, gallery, related`, bool cast `is_active`.

- [ ] **Step 1: Write the failing test**

`backend/tests/Feature/ServiceModelTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_orders_and_filters(): void
    {
        Service::factory()->create(['slug' => 'a', 'is_active' => false, 'sort_order' => 0]);
        Service::factory()->create(['slug' => 'b', 'is_active' => true, 'sort_order' => 2]);
        Service::factory()->create(['slug' => 'c', 'is_active' => true, 'sort_order' => 1]);

        $slugs = Service::active()->pluck('slug')->all();

        $this->assertSame(['c', 'b'], $slugs);
    }

    public function test_json_fields_cast_to_arrays(): void
    {
        $s = Service::factory()->create([
            'benefits_tr' => ['x', 'y'],
            'faq_tr' => [['q' => 'q1', 'a' => 'a1']],
        ]);

        $this->assertSame(['x', 'y'], $s->fresh()->benefits_tr);
        $this->assertSame('q1', $s->fresh()->faq_tr[0]['q']);
    }
}
```

- [ ] **Step 2: Run — expect fail**

Run: `cd backend && php artisan test --filter=ServiceModelTest`
Expected: FAIL (no Service model/migration).

- [ ] **Step 3: Create the migration**

`php artisan make:migration create_services_table`, `up()` body:

```php
Schema::create('services', function (Blueprint $table) {
    $table->id();
    $table->string('slug')->unique();
    $table->integer('sort_order')->default(0);
    $table->boolean('is_active')->default(true)->index();
    $table->string('name_tr');
    $table->string('name_en');
    $table->string('tag_tr');
    $table->string('tag_en');
    $table->text('desc_tr');
    $table->text('desc_en');
    $table->string('image')->nullable();
    $table->string('seo_title_tr')->nullable();
    $table->string('seo_title_en')->nullable();
    $table->string('seo_desc_tr')->nullable();
    $table->string('seo_desc_en')->nullable();
    $table->json('keywords_tr')->nullable();
    $table->json('keywords_en')->nullable();
    $table->text('intro_tr')->nullable();
    $table->text('intro_en')->nullable();
    $table->text('aftercare_tr')->nullable();
    $table->text('aftercare_en')->nullable();
    $table->json('benefits_tr')->nullable();
    $table->json('benefits_en')->nullable();
    $table->json('process_tr')->nullable();
    $table->json('process_en')->nullable();
    $table->json('faq_tr')->nullable();
    $table->json('faq_en')->nullable();
    $table->json('gallery')->nullable();
    $table->json('related')->nullable();
    $table->timestamps();
});
```

- [ ] **Step 4: Create the model**

`backend/app/Models/Service.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    protected $casts = [
        'is_active' => 'boolean',
        'keywords_tr' => 'array',
        'keywords_en' => 'array',
        'benefits_tr' => 'array',
        'benefits_en' => 'array',
        'process_tr' => 'array',
        'process_en' => 'array',
        'faq_tr' => 'array',
        'faq_en' => 'array',
        'gallery' => 'array',
        'related' => 'array',
    ];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
```

- [ ] **Step 5: Create the factory**

`backend/database/factories/ServiceFactory.php`:

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ServiceFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);
        return [
            'slug' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1, 99999),
            'sort_order' => 0,
            'is_active' => true,
            'name_tr' => $name,
            'name_en' => $name,
            'tag_tr' => 'Kaş',
            'tag_en' => 'Brows',
            'desc_tr' => $this->faker->sentence(),
            'desc_en' => $this->faker->sentence(),
            'image' => '/images/micro.png',
            'benefits_tr' => ['a', 'b'],
            'process_tr' => ['step1'],
            'faq_tr' => [['q' => 'q', 'a' => 'a']],
            'gallery' => [],
            'related' => [],
        ];
    }
}
```

- [ ] **Step 6: Migrate + run — expect pass**

Run: `php artisan migrate` then `php artisan test --filter=ServiceModelTest`
Expected: PASS (2 tests).

- [ ] **Step 7: Commit**

```bash
git add backend/database/migrations backend/app/Models/Service.php backend/database/factories/ServiceFactory.php backend/tests/Feature/ServiceModelTest.php
git commit -m "feat(services): services table + model + scope"
```

---

### Task 2: `ServiceSeeder` — import the current 7 services

**Files:**
- Create: `backend/database/seeders/ServiceSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`

**Interfaces:**
- Consumes: `Service` model.
- Produces: 7 active `services` rows matching the current frontend static data.

**Context:** The current data lives in the frontend:
- `frontend/lib/i18n.ts` — `SERVICES[]`: `{ id, slug, tag:{tr,en}, name:{tr,en}, desc:{tr,en}, img }`.
- `frontend/lib/services.ts` — `SERVICE_SEO[]`: `{ slug, seoTitle, seoDesc, keywords[], intro, benefits[], process[], aftercare, faq[{q,a}], related[], gallery? }` (all TR).

- [ ] **Step 1: Build the seeder by transcribing the exact values**

Read both frontend files fully. For each of the 7 services, create a row keyed by `slug` with:
- `name_tr/tag_tr/desc_tr` and `name_en/tag_en/desc_en` from `SERVICES[i].name/tag/desc`.
- `image` from `SERVICES[i].img` (e.g. `/images/micro.png`).
- `sort_order` = index in `SERVICES`.
- `seo_title_tr, seo_desc_tr, keywords_tr, intro_tr, aftercare_tr, benefits_tr, process_tr, faq_tr, gallery, related` from the matching `SERVICE_SEO` entry (by slug). Map `seoTitle→seo_title_tr`, `seoDesc→seo_desc_tr`, `keywords→keywords_tr`, `intro→intro_tr`, `benefits→benefits_tr`, `process→process_tr`, `aftercare→aftercare_tr`, `faq→faq_tr`, `related→related`, `gallery→gallery` (default `[]`).
- **All `*_en` SEO fields (seo_title_en, seo_desc_en, keywords_en, intro_en, aftercare_en, benefits_en, process_en, faq_en) = null/empty** (frontend falls back to TR).
- `is_active` = true.

Use `Service::updateOrCreate(['slug' => $slug], [...])` per row (idempotent). Transcribe the Turkish text **verbatim** — do not paraphrase.

`backend/database/seeders/ServiceSeeder.php` skeleton:

```php
<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $services = [
            [
                'slug' => 'microblading',
                'sort_order' => 0,
                'name_tr' => 'Microblading', 'name_en' => 'Microblading',
                'tag_tr' => 'Kaş', 'tag_en' => 'Brows',
                'desc_tr' => '...verbatim...', 'desc_en' => '...verbatim...',
                'image' => '/images/micro.png',
                'seo_title_tr' => '...', 'seo_desc_tr' => '...',
                'keywords_tr' => [/* ... */],
                'intro_tr' => '...', 'aftercare_tr' => '...',
                'benefits_tr' => [/* ... */], 'process_tr' => [/* ... */],
                'faq_tr' => [['q' => '...', 'a' => '...'], /* ... */],
                'related' => ['kas-pudralama', 'kas-laminasyon'],
                'gallery' => [],
            ],
            // ...the other 6 services, verbatim...
        ];

        foreach ($services as $s) {
            Service::updateOrCreate(['slug' => $s['slug']], $s + ['is_active' => true]);
        }
    }
}
```

- [ ] **Step 2: Register in DatabaseSeeder**

In `backend/database/seeders/DatabaseSeeder.php` `run()`, add:

```php
$this->call(ServiceSeeder::class);
```

- [ ] **Step 3: Seed the dev DB**

Run: `cd backend && php artisan db:seed --class=ServiceSeeder`
Expected: no errors.

- [ ] **Step 4: Verify count + a sample**

Run:
```bash
php artisan tinker --execute="echo App\Models\Service::active()->count().PHP_EOL; \$m=App\Models\Service::where('slug','microblading')->first(); echo \$m->name_tr.' | '.count(\$m->benefits_tr).' benefits | '.count(\$m->faq_tr).' faq'.PHP_EOL;"
```
Expected: `7` and microblading with its benefits/faq counts (benefits 4, faq 3 per current data).

- [ ] **Step 5: Commit**

```bash
git add backend/database/seeders
git commit -m "feat(services): seed current 7 services into DB"
```

---

### Task 3: Public services API (TDD)

**Files:**
- Create: `backend/app/Http/Resources/ServiceListResource.php`
- Create: `backend/app/Http/Resources/ServiceApiResource.php`
- Create: `backend/app/Http/Controllers/ServiceController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/ServiceApiTest.php`

**Interfaces:**
- Produces:
  - `GET /api/services` → `{ data: ServiceList[] }` (active, ordered).
  - `GET /api/services/{slug}` → `{ data: ServiceFull }`, 404 if not active/missing.
- `ServiceList` fields: `slug, name_tr, name_en, tag_tr, tag_en, desc_tr, desc_en, image, url` (`image` = absolute URL when it starts with `/storage`, else the raw path unchanged; `url` = `/hizmetler/{slug}`).
- `ServiceFull` = `ServiceList` + `seo_title_tr/en, seo_desc_tr/en, keywords_tr/en, intro_tr/en, aftercare_tr/en, benefits_tr/en, process_tr/en, faq_tr/en, gallery, related`.

- [ ] **Step 1: Write the failing test**

`backend/tests/Feature/ServiceApiTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ServiceApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_returns_active_ordered(): void
    {
        Service::factory()->create(['slug' => 'hidden', 'is_active' => false]);
        Service::factory()->create(['slug' => 'second', 'is_active' => true, 'sort_order' => 2]);
        Service::factory()->create(['slug' => 'first', 'is_active' => true, 'sort_order' => 1]);

        $res = $this->getJson('/api/services');

        $res->assertOk()->assertJsonCount(2, 'data');
        $res->assertJsonPath('data.0.slug', 'first');
        $res->assertJsonPath('data.1.slug', 'second');
    }

    public function test_single_service_full_shape(): void
    {
        Service::factory()->create(['slug' => 'micro', 'is_active' => true, 'benefits_tr' => ['x']]);

        $this->getJson('/api/services/micro')
            ->assertOk()
            ->assertJsonPath('data.slug', 'micro')
            ->assertJsonStructure(['data' => ['intro_tr', 'benefits_tr', 'faq_tr', 'gallery', 'related']]);
    }

    public function test_inactive_service_is_404(): void
    {
        Service::factory()->create(['slug' => 'off', 'is_active' => false]);
        $this->getJson('/api/services/off')->assertNotFound();
    }
}
```

- [ ] **Step 2: Run — expect fail**

Run: `php artisan test --filter=ServiceApiTest`
Expected: FAIL (routes/controller missing).

- [ ] **Step 3: Create the list resource**

`backend/app/Http/Resources/ServiceListResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class ServiceListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'name_tr' => $this->name_tr,
            'name_en' => $this->name_en,
            'tag_tr' => $this->tag_tr,
            'tag_en' => $this->tag_en,
            'desc_tr' => $this->desc_tr,
            'desc_en' => $this->desc_en,
            'image' => $this->image && Str::startsWith($this->image, '/storage')
                ? asset(ltrim($this->image, '/'))
                : $this->image,
            'url' => '/hizmetler/'.$this->slug,
        ];
    }
}
```

- [ ] **Step 4: Create the full resource**

`backend/app/Http/Resources/ServiceApiResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class ServiceApiResource extends ServiceListResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'seo_title_tr' => $this->seo_title_tr,
            'seo_title_en' => $this->seo_title_en,
            'seo_desc_tr' => $this->seo_desc_tr,
            'seo_desc_en' => $this->seo_desc_en,
            'keywords_tr' => $this->keywords_tr ?? [],
            'keywords_en' => $this->keywords_en ?? [],
            'intro_tr' => $this->intro_tr,
            'intro_en' => $this->intro_en,
            'aftercare_tr' => $this->aftercare_tr,
            'aftercare_en' => $this->aftercare_en,
            'benefits_tr' => $this->benefits_tr ?? [],
            'benefits_en' => $this->benefits_en ?? [],
            'process_tr' => $this->process_tr ?? [],
            'process_en' => $this->process_en ?? [],
            'faq_tr' => $this->faq_tr ?? [],
            'faq_en' => $this->faq_en ?? [],
            'gallery' => $this->gallery ?? [],
            'related' => $this->related ?? [],
        ];
    }
}
```

- [ ] **Step 5: Create the controller**

`backend/app/Http/Controllers/ServiceController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceApiResource;
use App\Http\Resources\ServiceListResource;
use App\Models\Service;

class ServiceController extends Controller
{
    public function index()
    {
        return ServiceListResource::collection(Service::active()->get());
    }

    public function show(string $slug)
    {
        $service = Service::active()->where('slug', $slug)->firstOrFail();
        return new ServiceApiResource($service);
    }
}
```

- [ ] **Step 6: Register routes**

Append to `backend/routes/api.php`:

```php
use App\Http\Controllers\ServiceController;

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);
```

- [ ] **Step 7: Run — expect pass**

Run: `php artisan test --filter=ServiceApiTest`
Expected: PASS (3 tests).

- [ ] **Step 8: Live sanity**

Run: `curl -s http://127.0.0.1:8002/api/services | php -r "echo count(json_decode(file_get_contents('php://stdin'),true)['data']);"` → `7`.
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8002/api/services/microblading` → `200`.

- [ ] **Step 9: Commit**

```bash
git add backend/app/Http backend/routes/api.php backend/tests/Feature/ServiceApiTest.php
git commit -m "feat(services): public services API (list + single)"
```

---

### Task 4: Filament `ServiceResource`

**Files:**
- Create: `backend/app/Filament/Resources/Services/**` (generated + filled)

**Context:** Filament v4.11 split-class structure. The brief's field list is authoritative; adapt imports to the generated stubs (as done for PostResource). Look at `backend/app/Filament/Resources/Posts/**` for the exact v4.11 import/namespace patterns already working in this repo.

- [ ] **Step 1: Generate the resource**

Run: `cd backend && php artisan make:filament-resource Service`

- [ ] **Step 2: Build the form (adapt to v4.11 API used by the existing PostResource)**

In the generated `Schemas/ServiceForm.php`, build tabs:
- **Türkçe**: `TextInput name_tr` (required, live, afterStateUpdated → set slug from name_tr ONLY when `$operation === 'create'`), `TextInput tag_tr`, `Textarea desc_tr`, `Textarea intro_tr`, `Textarea aftercare_tr`, `Repeater benefits_tr` (simple `TextInput` `value`... use `Repeater::make('benefits_tr')->simple(TextInput::make('value'))` if supported in v4.11, else a repeater with one text field), `Repeater process_tr` (same), `Repeater faq_tr` (fields: `TextInput q`, `Textarea a`).
- **English**: same `_en` fields, all optional.
- **SEO**: `TextInput slug` (required, unique ignoreRecord), `TextInput seo_title_tr/en`, `Textarea seo_desc_tr/en`, `TagsInput keywords_tr/en`.
- **Görseller & Diğer**: `FileUpload image` (image, disk public, directory `services`), `FileUpload gallery` (multiple, image, disk public, directory `services`), `TagsInput related` (or a `Select` multiple of existing slugs — TagsInput of slug strings is simplest), `TextInput sort_order` (numeric), `Toggle is_active`.

**Note on JSON repeater storage:** `benefits_tr`/`process_tr` are `string[]`. Store as a flat array. If using a non-simple repeater, the model cast is `array` of `{value: ...}` — instead use `Repeater::make('benefits_tr')->simple(TextInput::make('value'))` which stores a flat `string[]` matching the API/seed shape. Verify the stored shape is a flat array of strings (not array of objects) — this must match `benefits_tr` used by the seeder/API. If `->simple()` is unavailable, use `TagsInput::make('benefits_tr')` (also stores `string[]`) as the fallback.

- [ ] **Step 3: Build the table**

In `Tables/ServicesTable.php`: columns `image` (ImageColumn), `name_tr`, `tag_tr`, `is_active` (IconColumn boolean), `sort_order` (sortable). `->defaultSort('sort_order')`. Reorderable by `sort_order` if trivial; otherwise just sortable.

- [ ] **Step 4: Gate checks (no browser)**

Run:
- `php -l` on every generated/edited Service resource file → clean.
- `php artisan route:list --path=admin | grep -i service` → resource routes present.
- `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8002/admin/services` → `302` (auth redirect, not 500).
- `php artisan filament:optimize-clear` → no error.

- [ ] **Step 5: Commit**

```bash
git add backend/app/Filament
git commit -m "feat(admin): Filament ServiceResource"
```

---

### Task 5: Frontend data layer — `lib/content.ts` + `ServicesProvider` + layout wiring

**Files:**
- Create: `frontend/lib/content.ts`
- Create: `frontend/components/ServicesProvider.tsx`
- Modify: `frontend/app/layout.tsx`

**Interfaces:**
- Produces:
  - Types `ServiceListItem`, `ServiceFull` (match Task 3 JSON).
  - `getServices(): Promise<ServiceListItem[]>`, `getService(slug): Promise<ServiceFull | null>`, `getServiceSlugs(): Promise<string[]>`.
  - `pickLang(tr: string | null | undefined, en: string | null | undefined, lang: "tr" | "en"): string` = `lang === "en" ? (en || tr || "") : (tr || "")`.
  - `ServicesProvider({ services, children })` + `useServices(): ServiceListItem[]`.

- [ ] **Step 1: Create `lib/content.ts`**

```ts
import { site } from "@/lib/site";

export type ServiceListItem = {
  slug: string;
  name_tr: string; name_en: string;
  tag_tr: string; tag_en: string;
  desc_tr: string; desc_en: string;
  image: string | null;
  url: string;
};

export type ServiceFull = ServiceListItem & {
  seo_title_tr: string | null; seo_title_en: string | null;
  seo_desc_tr: string | null; seo_desc_en: string | null;
  keywords_tr: string[]; keywords_en: string[];
  intro_tr: string | null; intro_en: string | null;
  aftercare_tr: string | null; aftercare_en: string | null;
  benefits_tr: string[]; benefits_en: string[];
  process_tr: string[]; process_en: string[];
  faq_tr: { q: string; a: string }[]; faq_en: { q: string; a: string }[];
  gallery: string[];
  related: string[];
};

export type Lang = "tr" | "en";

export function pickLang(
  tr: string | null | undefined,
  en: string | null | undefined,
  lang: Lang,
): string {
  return lang === "en" ? (en || tr || "") : (tr || "");
}

async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${site.apiUrl}/api${path}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getServices(): Promise<ServiceListItem[]> {
  const out = await api<{ data: ServiceListItem[] }>("/services");
  return out?.data ?? [];
}

export async function getService(slug: string): Promise<ServiceFull | null> {
  const out = await api<{ data: ServiceFull }>(`/services/${encodeURIComponent(slug)}`);
  return out?.data ?? null;
}

export async function getServiceSlugs(): Promise<string[]> {
  const list = await getServices();
  return list.map((s) => s.slug);
}
```

- [ ] **Step 2: Create `ServicesProvider`**

`frontend/components/ServicesProvider.tsx`:

```tsx
"use client";

import { createContext, useContext } from "react";
import type { ServiceListItem } from "@/lib/content";

const ServicesContext = createContext<ServiceListItem[]>([]);

export function ServicesProvider({
  services,
  children,
}: {
  services: ServiceListItem[];
  children: React.ReactNode;
}) {
  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices(): ServiceListItem[] {
  return useContext(ServicesContext);
}
```

- [ ] **Step 3: Wire `layout.tsx`**

Make the default export `async`, fetch services, wrap children (inside `LanguageProvider`):

```tsx
import { ServicesProvider } from "@/components/ServicesProvider";
import { getServices } from "@/lib/content";
// ...
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const services = await getServices();
  return (
    <html lang="tr" className={jost.variable}>
      <body>
        <JsonLd data={beautySalonSchema()} />
        <LanguageProvider>
          <ServicesProvider services={services}>{children}</ServicesProvider>
        </LanguageProvider>
        <WhatsAppFab />
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify**

Run: `cd frontend && npx tsc --noEmit` → no errors.
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/` → `200` (layout fetch works; services live in context now, no consumer changed yet so page still renders using old static imports).

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/content.ts frontend/components/ServicesProvider.tsx frontend/app/layout.tsx
git commit -m "feat(services): frontend content client + ServicesProvider"
```

---

### Task 6: Rewire client consumers (Services, NavServices, Footer, ContactForm)

**Files:**
- Modify: `frontend/components/Services.tsx`
- Modify: `frontend/components/NavServices.tsx`
- Modify: `frontend/components/Footer.tsx`
- Modify: `frontend/components/ContactForm.tsx`

**Interfaces:**
- Consumes: `useServices()` (ServiceListItem[]), `pickLang`, `useLang`.

**Context:** Each currently imports `SERVICES` from `@/lib/i18n` and reads `s.name[lang]`, `s.tag[lang]`, `s.desc[lang]`, `s.img`, `s.slug`. Replace with `useServices()` and `pickLang(s.name_tr, s.name_en, lang)` etc.; image is `s.image` (string|null → pass to ImageSlot `src={s.image ?? ""}`); key by `s.slug` (no more `s.id`).

- [ ] **Step 1: Services.tsx**

Replace `import { SERVICES } from "@/lib/i18n";` with `import { useServices, pickLang } from "@/lib/content";`. In the component: `const services = useServices();`. Map over `services`; key `s.slug`; `name = pickLang(s.name_tr, s.name_en, lang)`, `tag = pickLang(s.tag_tr, s.tag_en, lang)`, `desc = pickLang(s.desc_tr, s.desc_en, lang)`; `ImageSlot src={s.image ?? ""}`; links `s.url` (or `/hizmetler/${s.slug}`).

- [ ] **Step 2: NavServices.tsx**

Same swap. `const services = useServices(); const featured = services[0];` (guard: if `!featured` render nothing or skip featured block). Featured image: keep `IMG.micro`? No — use `featured.image ?? ""`. Labels via `pickLang`. List maps `services`.

- [ ] **Step 3: Footer.tsx**

Swap `SERVICES` → `useServices()`; the services column maps `services` with `pickLang(s.name_tr, s.name_en, lang)` and href `/hizmetler/${s.slug}`.

- [ ] **Step 4: ContactForm.tsx**

Swap `SERVICES` → `useServices()`; the `<select>` options map `services` with `value` + label = `pickLang(s.name_tr, s.name_en, lang)`.

- [ ] **Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit` → no errors.
Run: `curl -s http://127.0.0.1:3001/ | grep -c "Microblading"` → `≥1` (homepage Services + Nav render DB services).
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/` → `200`.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/Services.tsx frontend/components/NavServices.tsx frontend/components/Footer.tsx frontend/components/ContactForm.tsx
git commit -m "feat(services): client components read services from API"
```

---

### Task 7: Rewire server consumers (`/hizmetler`, `/hizmetler/[slug]`, ServicePage, schema, sitemap) + ISR

**Files:**
- Modify: `frontend/app/hizmetler/page.tsx`
- Modify: `frontend/app/hizmetler/[slug]/page.tsx`
- Modify: `frontend/components/ServicePage.tsx`
- Modify: `frontend/components/schema.ts`
- Modify: `frontend/app/sitemap.ts`

**Interfaces:**
- Consumes: `getServices`, `getService`, `getServiceSlugs`, `pickLang`, `ServiceFull`.
- `ServicePage` new prop: `svc: ServiceFull` (single prop; replaces `svc: ServiceSeo` + `display: Service`).

- [ ] **Step 1: `/hizmetler` list page**

Make component `async`; `const services = await getServices();`. Add `export const revalidate = 300;`. Map `services` (TR labels as now: `s.name_tr`, `s.tag_tr`, `s.desc_tr`, `s.image`, `/hizmetler/${s.slug}`). Drop `import { SERVICES }`.

- [ ] **Step 2: `ServicePage.tsx` — accept `ServiceFull`**

Change signature to `export function ServicePage({ svc }: { svc: ServiceFull })`. It is a server component (no `useLang` — currently TR-only via `display.name.tr`). Keep TR rendering: `name = svc.name_tr`, `svc.intro_tr`, `svc.benefits_tr`, `svc.process_tr`, `svc.aftercare_tr`, `svc.faq_tr`, gallery from `svc.gallery`, related from `svc.related`. Replace the old `SERVICES.find`-based `related` mapping with: fetch labels for related slugs from the passed data — since related is just slugs, render each as a link with a label. To get related names without another fetch, resolve them in the page (Step 3) and pass `relatedItems: {slug,name}[]` OR keep it simple: in ServicePage, render related as links using the slug as fallback label is ugly — instead the page passes `related` resolved. **Simplify:** ServicePage keeps rendering related from `svc.related` (slugs) by looking them up in a `services` list also passed in. Change prop to `{ svc: ServiceFull; services: ServiceListItem[] }` and resolve related names via `services.find(x => x.slug === r)?.name_tr`. The `services` list is already fetched in the page.

- [ ] **Step 3: `/hizmetler/[slug]` page**

```tsx
import { getService, getServices, getServiceSlugs } from "@/lib/content";
// ...
export const revalidate = 300;
export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}
// remove: export const dynamicParams = false;
export async function generateMetadata({ params }): Promise<Metadata> {
  const { slug } = await params;
  const svc = await getService(slug);
  if (!svc) return {};
  return buildMetadata({
    title: svc.seo_title_tr || `${svc.name_tr} · Stria Studio`,
    description: svc.seo_desc_tr || svc.desc_tr,
    path: `/hizmetler/${svc.slug}`,
  });
}
export default async function ServiceRoute({ params }) {
  const { slug } = await params;
  const [svc, services] = await Promise.all([getService(slug), getServices()]);
  if (!svc) notFound();
  const name = svc.name_tr;
  const crumbs = [ { name: "Ana Sayfa", path: "/" }, { name: "Hizmetler", path: "/hizmetler" }, { name, path: `/hizmetler/${svc.slug}` } ];
  return (
    <>
      <Nav />
      <JsonLd data={serviceSchema(svc, name)} />
      <JsonLd data={faqSchema(svc.faq_tr)} />
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <ServicePage svc={svc} services={services} />
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: `schema.ts` `serviceSchema`**

Change signature to accept the new shape. It uses `svc.intro` and `svc.slug`. Update to `serviceSchema(svc: { slug: string; intro_tr: string | null; desc_tr: string }, name: string)` using `description: svc.intro_tr || svc.desc_tr`, `url: absUrl(`/hizmetler/${svc.slug}`)`. Remove the `ServiceSeo` import.

- [ ] **Step 5: `sitemap.ts`**

Replace `SERVICE_SEO.map((s) => ...)` with slugs from `await getServiceSlugs()`:

```ts
import { getServiceSlugs } from "@/lib/content";
// inside the async sitemap():
const serviceSlugs = await getServiceSlugs();
// ...spread: ...serviceSlugs.map((slug) => ({ url: absUrl(`/hizmetler/${slug}`), lastModified: now, changeFrequency: "monthly" as const, priority: 0.8 })),
```
Remove the `SERVICE_SEO` import.

- [ ] **Step 6: Verify**

Run: `cd frontend && npx tsc --noEmit` → no errors.
Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/hizmetler` → `200`; `.../hizmetler/microblading` → `200`; an unknown slug → `404`.
Run: `curl -s http://127.0.0.1:3001/hizmetler/microblading | grep -c "Neden\|Nasıl uygulanır"` → `≥1` (SEO body renders).
Run: `curl -s http://127.0.0.1:3001/sitemap.xml | grep -c "/hizmetler/"` → `≥7`.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/hizmetler frontend/components/ServicePage.tsx frontend/components/schema.ts frontend/app/sitemap.ts
git commit -m "feat(services): service pages + schema + sitemap read from API (ISR)"
```

---

### Task 8: Remove dead static data + full verification

**Files:**
- Modify: `frontend/lib/i18n.ts` (remove `SERVICES` + `Service` type)
- Modify: `frontend/lib/services.ts` (remove `SERVICE_SEO`, `getServiceSeo`, `ServiceSeo`; keep `HOME_FAQ`)

- [ ] **Step 1: Confirm no remaining importers**

Run:
```bash
cd frontend
grep -rn "from \"@/lib/i18n\"" app components | grep -i "SERVICES" || echo "no SERVICES importers"
grep -rn "SERVICE_SEO\|getServiceSeo\|ServiceSeo" app components lib | grep -v "lib/services.ts" || echo "no SERVICE_SEO importers"
```
Expected: both print the "no ... importers" line. If anything remains, fix that consumer before removing.

- [ ] **Step 2: Remove `SERVICES` + `Service` type from `lib/i18n.ts`**

Delete the `export type Service = {...}` and `export const SERVICES: Service[] = [...]` blocks. Keep `IMG`, `GALLERY`, `UI`, `TRUST`, `Lang`, `LS`, `Dict`, etc. (Verify `IMG` is still used elsewhere — it is, by About/Hero; keep it.)

- [ ] **Step 3: Remove service SEO exports from `lib/services.ts`**

Delete `export type ServiceSeo`, `export const SERVICE_SEO`, and `getServiceSeo`. **Keep `HOME_FAQ`** and its type. If the file becomes just `HOME_FAQ`, that's fine.

- [ ] **Step 4: Full verification**

Run:
```bash
cd frontend && npx tsc --noEmit && npm run build 2>&1 | tail -20
```
Expected: builds clean; `/hizmetler`, `/hizmetler/[slug]` (7 slugs), `/`, sitemap all present.

Then live checks (dev server):
- `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/hizmetler/microblading` → `200`
- Homepage services + nav mega-menu + footer list + contact dropdown all show the 7 services (spot-check: `curl -s http://127.0.0.1:3001/ | grep -c "Microblading"` ≥1).
- `php artisan test` (backend) → all pass.

- [ ] **Step 5: Commit**

```bash
git add frontend/lib/i18n.ts frontend/lib/services.ts
git commit -m "refactor(services): drop static service data now served from API"
```

---

## Final verification (Phase 1)

- [ ] `cd frontend && npx tsc --noEmit && npm run build` → clean; all service routes prerender.
- [ ] `cd backend && php artisan test` → all pass (Service model + API tests green, blog tests still green).
- [ ] All 7 service detail pages load with their original TR content; metadata unchanged.
- [ ] Homepage Services, Nav mega-menu, Footer, Contact dropdown all list the 7 DB services.
- [ ] Sitemap lists all 7 service URLs.
- [ ] In `/admin/services`: editing a service (e.g. change a benefit, toggle is_active) reflects on the site within the revalidate window.
- [ ] EN: a service page in EN shows EN name/tag/desc; EN SEO body falls back to TR (not blank).
