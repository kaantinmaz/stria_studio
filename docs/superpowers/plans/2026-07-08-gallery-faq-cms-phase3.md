# Gallery + Home FAQ CMS — Phase 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** Move the homepage gallery and home FAQ into the DB (Filament-editable, public API), consumed by the frontend. No behavior change.

**Architecture:** `gallery_images` + `faqs` tables seeded from the current static data; Filament resources; `GET /api/gallery` + `/api/faqs`. Frontend `getGallery()`/`getFaqs()` fetched on the homepage (+ `/galeri` for gallery) and passed as props to client leaf components (`Gallery`, new `HomeFaq`) which pick language. FAQ made bilingual with EN→TR fallback.

**Tech Stack:** Next.js 16 · Tailwind v4 · Laravel 13.19 · Filament v4.11 · MySQL · PHPUnit.

## Global Constraints

- Reuse established patterns verbatim: model ← `backend/app/Models/Service.php` (bool cast + `scopeActive`); API resource ← `backend/app/Http/Resources/ServiceListResource.php` (incl. the `image` abs-URL-if-`/storage` helper); Filament ← `backend/app/Filament/Resources/Services/**` (v4.11 split-class); frontend fetch ← extend `frontend/lib/content.ts` (same `api<T>`, ISR 300, `[]` fallback, `pickLang`).
- Bilingual TR default; EN empty → TR via `pickLang`.
- Tests: sqlite `:memory:`, `php artisan test`.
- No behavior change: seeded content equals current homepage (same images/order; same TR FAQ).
- Both dev servers run: frontend :3001, Laravel :8002.

Current static data to migrate:
- `frontend/lib/i18n.ts` `GALLERY` (6): `{id, img, ph:{tr,en}}` — img is `IMG.*` path or `""` (mg6).
- `frontend/lib/services.ts` `HOME_FAQ` (4): `{q, a}` (TR only).

---

### Task 1: Gallery — migration + model + factory + seeder (TDD)

**Files:**
- Create: `backend/database/migrations/xxxx_create_gallery_images_table.php`
- Create: `backend/app/Models/GalleryImage.php`
- Create: `backend/database/factories/GalleryImageFactory.php`
- Create: `backend/database/seeders/GalleryImageSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`
- Test: `backend/tests/Feature/GalleryImageTest.php`

**Interfaces:** `GalleryImage` with `scopeActive()` (is_active=true, orderBy sort_order), `is_active` bool cast.

- [ ] **Step 1: Failing test** — `backend/tests/Feature/GalleryImageTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\GalleryImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GalleryImageTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_filters_and_orders(): void
    {
        GalleryImage::factory()->create(['is_active' => false, 'sort_order' => 0]);
        GalleryImage::factory()->create(['alt_tr' => 'B', 'is_active' => true, 'sort_order' => 2]);
        GalleryImage::factory()->create(['alt_tr' => 'A', 'is_active' => true, 'sort_order' => 1]);

        $this->assertSame(['A', 'B'], GalleryImage::active()->pluck('alt_tr')->all());
    }
}
```

- [ ] **Step 2: Run → RED** — `cd backend && php artisan test --filter=GalleryImageTest`.

- [ ] **Step 3: Migration** — `php artisan make:migration create_gallery_images_table`, `up()`:
```php
Schema::create('gallery_images', function (Blueprint $table) {
    $table->id();
    $table->string('image')->nullable();
    $table->string('alt_tr');
    $table->string('alt_en')->nullable();
    $table->integer('sort_order')->default(0);
    $table->boolean('is_active')->default(true)->index();
    $table->timestamps();
});
```

- [ ] **Step 4: Model** — `backend/app/Models/GalleryImage.php`:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    use HasFactory;

    protected $guarded = ['id'];
    protected $casts = ['is_active' => 'boolean'];

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
```

- [ ] **Step 5: Factory** — `backend/database/factories/GalleryImageFactory.php`:
```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class GalleryImageFactory extends Factory
{
    public function definition(): array
    {
        return [
            'image' => '/images/micro.png',
            'alt_tr' => $this->faker->words(2, true),
            'alt_en' => $this->faker->words(2, true),
            'sort_order' => 0,
            'is_active' => true,
        ];
    }
}
```

- [ ] **Step 6: Seeder** — `backend/database/seeders/GalleryImageSeeder.php`. Read `frontend/lib/i18n.ts` GALLERY (6 items) and transcribe verbatim: `image`←img (resolve `IMG.micro`→`/images/micro.png`, `IMG.dipliner`→`/images/dipliner.png`, `IMG.hero`→`/images/hero.png`, `IMG.powder`→`/images/powder.png`, `IMG.eyeliner`→`/images/eyeliner.png`; mg6 img `""`→`""`), `alt_tr`←ph.tr, `alt_en`←ph.en, `sort_order`←index. Idempotent — clear+insert or keyed. Since gallery rows have no natural unique key, use: `if (GalleryImage::count() === 0) { insert all }` OR truncate+insert. Prefer: `GalleryImage::query()->delete(); ` then insert all 6 (idempotent reseed). Register in `DatabaseSeeder::run()`.
```php
<?php

namespace Database\Seeders;

use App\Models\GalleryImage;
use Illuminate\Database\Seeder;

class GalleryImageSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['image' => '/images/micro.png', 'alt_tr' => 'Microblading', 'alt_en' => 'Microblading'],
            ['image' => '/images/dipliner.png', 'alt_tr' => 'Kirpik / göz', 'alt_en' => 'Lashes / eye'],
            ['image' => '/images/hero.png', 'alt_tr' => 'Stüdyo', 'alt_en' => 'Studio'],
            ['image' => '/images/powder.png', 'alt_tr' => 'Kaş pudralama', 'alt_en' => 'Powder brows'],
            ['image' => '/images/eyeliner.png', 'alt_tr' => 'Eyeliner', 'alt_en' => 'Eyeliner'],
            ['image' => '', 'alt_tr' => 'Çalışmanızı ekleyin', 'alt_en' => 'Add your work'],
        ];
        GalleryImage::query()->delete();
        foreach ($items as $i => $it) {
            GalleryImage::create($it + ['sort_order' => $i, 'is_active' => true]);
        }
    }
}
```

- [ ] **Step 7: Migrate + seed + GREEN** — `php artisan migrate && php artisan db:seed --class=GalleryImageSeeder && php artisan test --filter=GalleryImageTest`. Verify `GalleryImage::active()->count()` = 6.

- [ ] **Step 8: Commit**
```bash
git add backend/database/migrations backend/app/Models/GalleryImage.php backend/database/factories/GalleryImageFactory.php backend/database/seeders backend/tests/Feature/GalleryImageTest.php
git commit -m "feat(gallery): gallery_images table + model + seed"
```

---

### Task 2: FAQ — migration + model + factory + seeder (TDD)

**Files:** analogous to Task 1: `create_faqs_table` migration, `backend/app/Models/Faq.php`, `FaqFactory.php`, `FaqSeeder.php`, register in DatabaseSeeder, test `backend/tests/Feature/FaqModelTest.php`.

**Interfaces:** `Faq` with `scopeActive()` (is_active + orderBy sort_order), `is_active` bool cast.

- [ ] **Step 1: Failing test** — `backend/tests/Feature/FaqModelTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\Faq;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_active_scope_filters_and_orders(): void
    {
        Faq::factory()->create(['is_active' => false, 'sort_order' => 0]);
        Faq::factory()->create(['q_tr' => 'B', 'is_active' => true, 'sort_order' => 2]);
        Faq::factory()->create(['q_tr' => 'A', 'is_active' => true, 'sort_order' => 1]);

        $this->assertSame(['A', 'B'], Faq::active()->pluck('q_tr')->all());
    }
}
```

- [ ] **Step 2: Run → RED**.

- [ ] **Step 3: Migration** `create_faqs_table` `up()`:
```php
Schema::create('faqs', function (Blueprint $table) {
    $table->id();
    $table->string('q_tr');
    $table->string('q_en')->nullable();
    $table->text('a_tr');
    $table->text('a_en')->nullable();
    $table->integer('sort_order')->default(0);
    $table->boolean('is_active')->default(true)->index();
    $table->timestamps();
});
```

- [ ] **Step 4: Model** `backend/app/Models/Faq.php` (same shape as GalleryImage: `$guarded=['id']`, `is_active` bool cast, `scopeActive`).

- [ ] **Step 5: Factory** `FaqFactory` — defaults: `q_tr`=sentence, `q_en`=sentence, `a_tr`=paragraph, `a_en`=paragraph, `sort_order`=0, `is_active`=true.

- [ ] **Step 6: Seeder** `FaqSeeder` — read `frontend/lib/services.ts` HOME_FAQ (4 items) verbatim: `q_tr`←q, `a_tr`←a, **`q_en`/`a_en` = null** (TR fallback), `sort_order`←index. `Faq::query()->delete();` then insert 4. Register in DatabaseSeeder.

- [ ] **Step 7: Migrate + seed + GREEN** — `php artisan migrate && php artisan db:seed --class=FaqSeeder && php artisan test --filter=FaqModelTest`. Verify `Faq::active()->count()` = 4.

- [ ] **Step 8: Commit**
```bash
git add backend/database/migrations backend/app/Models/Faq.php backend/database/factories/FaqFactory.php backend/database/seeders backend/tests/Feature/FaqModelTest.php
git commit -m "feat(faq): faqs table + model + seed"
```

---

### Task 3: API — /api/gallery + /api/faqs (TDD)

**Files:**
- Create: `backend/app/Http/Resources/GalleryImageResource.php`, `backend/app/Http/Resources/FaqResource.php`
- Create: `backend/app/Http/Controllers/GalleryController.php`, `backend/app/Http/Controllers/FaqController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/GalleryFaqApiTest.php`

**Interfaces:**
- `GET /api/gallery` → `{data:[{image, alt_tr, alt_en}]}` active+ordered. `image` = abs URL when it starts with `/storage`, else raw (mirror `ServiceListResource`'s image logic).
- `GET /api/faqs` → `{data:[{q_tr, q_en, a_tr, a_en}]}` active+ordered.

- [ ] **Step 1: Failing test** — `backend/tests/Feature/GalleryFaqApiTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\Faq;
use App\Models\GalleryImage;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GalleryFaqApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_gallery_returns_active_ordered(): void
    {
        GalleryImage::factory()->create(['is_active' => false]);
        GalleryImage::factory()->create(['alt_tr' => 'Two', 'is_active' => true, 'sort_order' => 2]);
        GalleryImage::factory()->create(['alt_tr' => 'One', 'is_active' => true, 'sort_order' => 1]);

        $res = $this->getJson('/api/gallery');
        $res->assertOk()->assertJsonCount(2, 'data');
        $res->assertJsonPath('data.0.alt_tr', 'One');
    }

    public function test_gallery_storage_image_absolute(): void
    {
        GalleryImage::factory()->create(['image' => 'gallery/x.png', 'is_active' => true]);
        $this->getJson('/api/gallery')->assertOk()
            ->assertJsonPath('data.0.image', asset('storage/gallery/x.png'));
    }

    public function test_faqs_returns_active_ordered(): void
    {
        Faq::factory()->create(['is_active' => false]);
        Faq::factory()->create(['q_tr' => 'Q2', 'is_active' => true, 'sort_order' => 2]);
        Faq::factory()->create(['q_tr' => 'Q1', 'is_active' => true, 'sort_order' => 1]);

        $this->getJson('/api/faqs')->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.q_tr', 'Q1')
            ->assertJsonStructure(['data' => [['q_tr', 'q_en', 'a_tr', 'a_en']]]);
    }
}
```

- [ ] **Step 2: Run → RED**.

- [ ] **Step 3: Resources**
`GalleryImageResource` (image abs-URL logic like ServiceListResource):
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class GalleryImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'image' => $this->image && ! Str::startsWith($this->image, ['http://', 'https://', '/'])
                ? asset('storage/'.$this->image)
                : $this->image,
            'alt_tr' => $this->alt_tr,
            'alt_en' => $this->alt_en,
        ];
    }
}
```
`FaqResource`:
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FaqResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'q_tr' => $this->q_tr,
            'q_en' => $this->q_en,
            'a_tr' => $this->a_tr,
            'a_en' => $this->a_en,
        ];
    }
}
```

- [ ] **Step 4: Controllers**
`GalleryController`:
```php
<?php

namespace App\Http\Controllers;

use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;

class GalleryController extends Controller
{
    public function index()
    {
        return GalleryImageResource::collection(GalleryImage::active()->get());
    }
}
```
`FaqController` — same shape with `Faq::active()->get()` + `FaqResource`.

- [ ] **Step 5: Routes** — append to `backend/routes/api.php`:
```php
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\FaqController;

Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/faqs', [FaqController::class, 'index']);
```

- [ ] **Step 6: Run → GREEN** — `php artisan test --filter=GalleryFaqApiTest` (3 pass). Also `php artisan test` full suite green.

- [ ] **Step 7: Live** — `curl -s http://127.0.0.1:8002/api/gallery` → 6 items; `curl -s http://127.0.0.1:8002/api/faqs` → 4 items.

- [ ] **Step 8: Commit**
```bash
git add backend/app/Http backend/routes/api.php backend/tests/Feature/GalleryFaqApiTest.php
git commit -m "feat(api): public /api/gallery + /api/faqs"
```

---

### Task 4: Filament resources (Gallery + FAQ)

**Files:** `backend/app/Filament/Resources/GalleryImages/**`, `backend/app/Filament/Resources/Faqs/**` (generated + filled). Mirror `backend/app/Filament/Resources/Services/**` for v4.11 conventions.

- [ ] **Step 1: Generate** — `php artisan make:filament-resource GalleryImage` and `php artisan make:filament-resource Faq`.
- [ ] **Step 2: GalleryImage form/table** — form: `FileUpload::make('image')->image()->disk('public')->directory('gallery')`, `TextInput::make('alt_tr')->required()`, `TextInput::make('alt_en')`, `TextInput::make('sort_order')->numeric()->default(0)`, `Toggle::make('is_active')->default(true)`. Table: ImageColumn image, alt_tr, is_active (IconColumn boolean), sort_order (sortable), `->defaultSort('sort_order')`.
- [ ] **Step 3: Faq form/table** — form: `TextInput::make('q_tr')->required()`, `TextInput::make('q_en')`, `Textarea::make('a_tr')->required()`, `Textarea::make('a_en')`, `TextInput::make('sort_order')->numeric()->default(0)`, `Toggle::make('is_active')->default(true)`. Table: q_tr (limit 50), is_active, sort_order, `->defaultSort('sort_order')`.
- [ ] **Step 4: Gate (no browser)** — `php -l` clean on all generated files; `php artisan route:list --path=admin | grep -iE "gallery|faq"` → routes present; `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8002/admin/gallery-images` and `.../faqs` → 302 (not 500); `php artisan filament:optimize-clear` → no error. (Confirm the exact resource URL slugs from route:list.)
- [ ] **Step 5: Commit**
```bash
git add backend/app/Filament
git commit -m "feat(admin): Filament GalleryImage + Faq resources"
```

---

### Task 5: Frontend — content fetchers + Gallery prop + HomeFaq + wire pages

**Files:**
- Modify: `frontend/lib/content.ts`
- Modify: `frontend/components/Gallery.tsx`
- Create: `frontend/components/HomeFaq.tsx`
- Modify: `frontend/app/page.tsx`
- Modify: `frontend/app/galeri/page.tsx`

**Interfaces:**
- `lib/content.ts`: `type GalleryItem2 = { image: string | null; alt_tr: string; alt_en: string | null }`; `type FaqItem = { q_tr: string; q_en: string | null; a_tr: string; a_en: string | null }`; `getGallery(): Promise<GalleryItem2[]>`; `getFaqs(): Promise<FaqItem[]>` (server, ISR 300, `[]` fallback).
- `Gallery({ items }: { items: GalleryItem2[] })`.
- `HomeFaq({ faqs, title }: { faqs: FaqItem[]; title: string })`.

- [ ] **Step 1: content.ts** — add types + fetchers (reuse `api<T>`):
```ts
export type GalleryItem2 = { image: string | null; alt_tr: string; alt_en: string | null };
export type FaqItem = { q_tr: string; q_en: string | null; a_tr: string; a_en: string | null };

export async function getGallery(): Promise<GalleryItem2[]> {
  const out = await api<{ data: GalleryItem2[] }>("/gallery");
  return out?.data ?? [];
}
export async function getFaqs(): Promise<FaqItem[]> {
  const out = await api<{ data: FaqItem[] }>("/faqs");
  return out?.data ?? [];
}
```

- [ ] **Step 2: Gallery.tsx** — replace `import { GALLERY } from "@/lib/i18n"` with `import { pickLang, type GalleryItem2 } from "@/lib/content"`. Signature `export function Gallery({ items }: { items: GalleryItem2[] })`. Keep `const { lang } = useLang();` (drop unused). Map `items` (key by index), `alt = pickLang(g.alt_tr, g.alt_en, lang)`, `ImageSlot src={g.image ?? ""}`. Preserve markup/classes (the reveal grid).

- [ ] **Step 3: HomeFaq.tsx** (new, client):
```tsx
"use client";

import { useLang } from "@/components/LanguageProvider";
import { Faq } from "@/components/Faq";
import { pickLang, type FaqItem } from "@/lib/content";

export function HomeFaq({ faqs, title }: { faqs: FaqItem[]; title: string }) {
  const { lang } = useLang();
  const items = faqs.map((f) => ({
    q: pickLang(f.q_tr, f.q_en, lang),
    a: pickLang(f.a_tr, f.a_en, lang),
  }));
  if (items.length === 0) return null;
  return <Faq title={title} items={items} />;
}
```

- [ ] **Step 4: app/page.tsx** — make it `async`; add `export const revalidate = 300;`. Fetch: `const [gallery, faqs] = await Promise.all([getGallery(), getFaqs()]);`. Replace `import { HOME_FAQ } from "@/lib/services"` and `import { Faq } ...` usage: pass `<Gallery items={gallery} />`; replace `<Faq title="Sıkça Sorulan Sorular" items={HOME_FAQ} />` with `<HomeFaq faqs={faqs} title="Sıkça Sorulan Sorular" />`; `<JsonLd data={faqSchema(faqs.map((f) => ({ q: f.q_tr, a: f.a_tr })))} />` (was `faqSchema(HOME_FAQ)`). Keep the rest (Nav, Hero, ServiceStrip, PromoVideo, Services, About, Contact, Footer). Update imports: drop `Faq`/`HOME_FAQ`, add `HomeFaq`, `getGallery`, `getFaqs`.

- [ ] **Step 5: app/galeri/page.tsx** — `async`; `export const revalidate = 300;`; `const gallery = await getGallery();`; `<Gallery items={gallery} />`.

- [ ] **Step 6: Verify** — `cd frontend && npx tsc --noEmit` → clean; `curl -s -o /dev/null -w "%{http_code}\n"` for `/`→200 and `/galeri`→200; `curl -s http://127.0.0.1:3001/ | grep -c "Microblading"` ≥1 (gallery alt renders); `curl -s http://127.0.0.1:3001/ | grep -c "Stria Studio nerede"` ≥1 (FAQ from DB renders); `curl -s http://127.0.0.1:3001/ | grep -c "FAQPage"` ≥1 (faqSchema).

- [ ] **Step 7: Commit**
```bash
git add frontend/lib/content.ts frontend/components/Gallery.tsx frontend/components/HomeFaq.tsx frontend/app/page.tsx frontend/app/galeri/page.tsx
git commit -m "feat(gallery,faq): frontend reads gallery + home FAQ from API"
```

---

### Task 6: Cleanup + full verification

**Files:**
- Modify: `frontend/lib/i18n.ts` (remove `GALLERY` + `GalleryItem` type)
- Delete/trim: `frontend/lib/services.ts` (remove `HOME_FAQ`; delete file if empty)

- [ ] **Step 1: Confirm no importers**
```bash
cd frontend
grep -rn "GALLERY\b\|GalleryItem" app components lib | grep -v "getGallery\|GalleryItem2\|lib/i18n.ts" || echo "no GALLERY importers"
grep -rn "HOME_FAQ" app components lib | grep -v "lib/services.ts" || echo "no HOME_FAQ importers"
```
Both should print the "no ... importers" line. Fix any remaining consumer first.

- [ ] **Step 2: Remove `GALLERY` + `GalleryItem`** from `lib/i18n.ts` (keep `IMG`, `TRUST`, `UI`, `Lang`, `LS`, `Dict`, `SERVICES` is already gone).

- [ ] **Step 3: Remove `HOME_FAQ`** from `lib/services.ts`. If the file is now empty (it may only contain HOME_FAQ), delete it: `git rm frontend/lib/services.ts` and remove any lingering import.

- [ ] **Step 4: Full verification**
```bash
cd frontend && npx tsc --noEmit && npm run build 2>&1 | tail -20
```
Clean build; `/`, `/galeri`, service routes, sitemap all present. Then:
- `curl -s http://127.0.0.1:3001/ | grep -c "Stria Studio nerede"` ≥1 (FAQ)
- `curl -s http://127.0.0.1:3001/galeri | grep -c "Microblading"` ≥1 (gallery)
- `curl -s http://127.0.0.1:3001/ | grep -c "FAQPage"` ≥1
- `cd ../backend && php artisan test` → all pass.

- [ ] **Step 5: Commit**
```bash
git add frontend/lib/i18n.ts frontend/lib/services.ts
git commit -m "refactor(gallery,faq): drop static GALLERY + HOME_FAQ (now admin-managed)"
```

---

## Final verification (Phase 3)
- [ ] `cd frontend && npx tsc --noEmit && npm run build` → clean.
- [ ] `cd backend && php artisan test` → all pass.
- [ ] Homepage gallery + FAQ render identically to before (6 images, 4 FAQ, same TR text).
- [ ] `/galeri` shows the 6 images.
- [ ] FAQ toggles TR/EN (EN falls back to TR); FAQPage JSON-LD present.
- [ ] Editing a gallery image / FAQ in `/admin` reflects on the site within the revalidate window.
