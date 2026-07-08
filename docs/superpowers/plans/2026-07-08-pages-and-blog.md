# Pages & Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `/galeri`, `/hakkimizda`, `/iletisim` pages and a full owner-editable bilingual SEO blog (Laravel DB + Filament admin + API → Next `/blog`).

**Architecture:** Part A adds three thin Next pages that reuse the existing homepage section components (bilingual via `LanguageProvider`). Part B adds a Laravel `posts/categories/tags` schema, a Filament admin at `:8002/admin`, a public read-only JSON API, and Next `/blog` + `/blog/[slug]` pages that fetch it with ISR.

**Tech Stack:** Next.js 16 (App Router, TS) · Tailwind v4 · Laravel 13.19 · Filament · MySQL (MAMP :8889) · PHPUnit.

## Global Constraints

- Laravel `laravel/framework ^13.8` (installed 13.19.0), PHP `^8.3` (installed 8.5.3).
- Bilingual TR/EN everywhere; **TR is the default/server-rendered language**. Client toggle (`useLang`) swaps to EN with no refetch — API returns both languages per row.
- Route slugs are Turkish (`/galeri`, `/hakkimizda`, `/iletisim`, `/blog`) to match existing `/hizmetler`.
- Reuse existing helpers verbatim: `absUrl`, `buildMetadata` (`lib/seo.ts`), `breadcrumbSchema` (`components/schema.ts`), `JsonLd` (`components/JsonLd.tsx`), `ImageSlot`, `useLang`.
- Frontend fetch base URL is `site.apiUrl` (`http://127.0.0.1:8002` in dev, `NEXT_PUBLIC_API_URL` in prod). API is served under `/api` (Laravel auto-prefix).
- Blog post `body_*` is trusted HTML authored only by the authenticated owner in the admin. Rendered via `dangerouslySetInnerHTML`. **Never** pipe any untrusted source into that field.
- Frontend server fetches use `{ next: { revalidate: 300 } }` (ISR, 5 min).
- MySQL CLI is not on PATH; run migrations with `php artisan migrate`, not `mysql`.
- Do not commit unless the human asks; each task's final step stages + commits per the standard workflow, but hold the actual `git commit` if the human has said not to. (Steps below include commits; skip the commit command if instructed.)

---

# PART A — Static pages

### Task A1: i18n copy + repoint Nav/Footer to the three pages

**Files:**
- Modify: `frontend/lib/i18n.ts` (add `aboutStoryLong` to the `Dict` type + both locales)
- Modify: `frontend/components/Nav.tsx:50-58`
- Modify: `frontend/components/Footer.tsx:19-24`

**Interfaces:**
- Produces: `t.aboutStoryLong: string` on the i18n dict; nav/footer links pointing to `/galeri`, `/hakkimizda`, `/iletisim`.

- [ ] **Step 1: Add `aboutStoryLong` to the `Dict` type**

In `frontend/lib/i18n.ts`, in the `Dict` type (near the other `about*` fields), add:

```ts
  aboutStoryLong: string;
```

- [ ] **Step 2: Add the TR + EN copy**

In the `tr` dict (after the existing `aboutText`/story field), add:

```ts
    aboutStoryLong:
      "Stria Studio, Ankara Çankaya'da kalıcı makyaj ve güzellik alanında; doğallığı, sterilizasyonu ve kişiye özel tasarımı merkezine alan bir stüdyodur. Her uygulamaya ücretsiz ön görüşme, yüz analizi ve simetri ölçümüyle başlıyor; kaliteli pigmentler ve tek kullanımlık ekipmanla, abartısız ve size ait bir sonuç hedefliyoruz.",
```

In the `en` dict add:

```ts
    aboutStoryLong:
      "Stria Studio is a permanent-makeup and beauty studio in Çankaya, Ankara, built around natural results, strict sterilisation and per-face design. Every treatment starts with a free consultation, face analysis and symmetry measurement; with quality pigments and single-use tools we aim for an understated result that stays truly yours.",
```

- [ ] **Step 3: Repoint Nav links**

In `frontend/components/Nav.tsx`, replace the three anchor links (lines ~50-58):

```tsx
          <a href="/galeri" className="text-[13px] text-muted">
            {t.navGallery}
          </a>
          <a href="/hakkimizda" className="hidden text-[13px] text-muted sm:inline">
            {t.navAbout}
          </a>
          <a href="/iletisim" className="hidden text-[13px] text-muted sm:inline">
            {t.navContact}
          </a>
```

- [ ] **Step 4: Repoint Footer explore links**

In `frontend/components/Footer.tsx`, update the `explore` array (lines ~19-24):

```tsx
  const explore = [
    { href: "/hizmetler", label: t.navServices },
    { href: "/galeri", label: t.navGallery },
    { href: "/hakkimizda", label: t.navAbout },
    { href: "/iletisim", label: t.navContact },
  ];
```

- [ ] **Step 5: Verify typecheck**

Run: `cd frontend && npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/i18n.ts frontend/components/Nav.tsx frontend/components/Footer.tsx
git commit -m "feat(nav): point gallery/about/contact to standalone pages"
```

---

### Task A2: `/galeri` page

**Files:**
- Create: `frontend/app/galeri/page.tsx`

**Interfaces:**
- Consumes: `Nav`, `Footer`, `Gallery` components; `buildMetadata`, `breadcrumbSchema`, `JsonLd`.

- [ ] **Step 1: Create the page**

`frontend/app/galeri/page.tsx`:

```tsx
import { Nav } from "@/components/Nav";
import { Gallery } from "@/components/Gallery";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Galeri · Stria Studio · Ankara",
  description:
    "Stria Studio çalışmalarından örnekler — Ankara Çankaya'da microblading, kalıcı makyaj ve kaş–kirpik uygulamaları.",
  path: "/galeri",
});

export default function GaleriPage() {
  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Galeri", path: "/galeri" },
        ])}
      />
      <main className="pt-[132px]">
        <Gallery />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify route + breadcrumb**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/galeri` → `200`
Run: `curl -s http://127.0.0.1:3001/galeri | grep -c BreadcrumbList` → `≥1`

- [ ] **Step 3: Commit**

```bash
git add frontend/app/galeri/page.tsx
git commit -m "feat(pages): add /galeri"
```

---

### Task A3: `/hakkimizda` page

**Files:**
- Create: `frontend/app/hakkimizda/page.tsx`
- Create: `frontend/components/AboutStory.tsx` (small client block for the expanded copy)

**Interfaces:**
- Consumes: `Nav`, `Footer`, `About`, `buildMetadata`, `breadcrumbSchema`, `JsonLd`, `useLang`.
- Produces: `AboutStory` component (no props).

- [ ] **Step 1: Create the expanded-story block**

`frontend/components/AboutStory.tsx`:

```tsx
"use client";

import { useLang } from "@/components/LanguageProvider";

export function AboutStory() {
  const { t } = useLang();
  return (
    <section className="px-[clamp(18px,5vw,56px)] py-[clamp(48px,6vw,88px)]">
      <p className="mx-auto max-w-[760px] text-center text-[clamp(16px,1.6vw,20px)] leading-[1.75] text-muted2">
        {t.aboutStoryLong}
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Create the page**

`frontend/app/hakkimizda/page.tsx`:

```tsx
import { Nav } from "@/components/Nav";
import { About } from "@/components/About";
import { AboutStory } from "@/components/AboutStory";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Hakkımızda · Stria Studio · Ankara",
  description:
    "Stria Studio — Ankara Çankaya'da doğallık, sterilizasyon ve kişiye özel tasarım odaklı kalıcı makyaj stüdyosu.",
  path: "/hakkimizda",
});

export default function HakkimizdaPage() {
  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Hakkımızda", path: "/hakkimizda" },
        ])}
      />
      <main className="pt-[132px]">
        <About />
        <AboutStory />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/hakkimizda` → `200`

- [ ] **Step 4: Commit**

```bash
git add frontend/app/hakkimizda/page.tsx frontend/components/AboutStory.tsx
git commit -m "feat(pages): add /hakkimizda"
```

---

### Task A4: `/iletisim` page (contact + hours + map)

**Files:**
- Create: `frontend/app/iletisim/page.tsx`
- Create: `frontend/components/StudioMap.tsx`

**Interfaces:**
- Consumes: `Nav`, `Footer`, `Contact`, `buildMetadata`, `breadcrumbSchema`, `JsonLd`, `site.geo`.
- Produces: `StudioMap` component (no props).

- [ ] **Step 1: Create the map block**

`frontend/components/StudioMap.tsx` (Google Maps embed built from `site.geo`; no API key needed for the `q=` embed):

```tsx
import { site } from "@/lib/site";

export function StudioMap() {
  const { lat, lng } = site.geo;
  const src = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  return (
    <section className="px-[clamp(18px,5vw,56px)] pb-[clamp(64px,8vw,120px)]">
      <div className="mx-auto max-w-[1160px] overflow-hidden rounded-[28px] border border-line">
        <iframe
          title="Stria Studio · Çankaya, Ankara"
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[380px] w-full border-0"
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Create the page**

`frontend/app/iletisim/page.tsx`:

```tsx
import { Nav } from "@/components/Nav";
import { Contact } from "@/components/Contact";
import { StudioMap } from "@/components/StudioMap";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "İletişim · Stria Studio · Ankara",
  description:
    "Stria Studio Ankara Çankaya — randevu ve sorular için WhatsApp, telefon ve konum bilgileri.",
  path: "/iletisim",
});

export default function IletisimPage() {
  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "İletişim", path: "/iletisim" },
        ])}
      />
      <main className="pt-[132px]">
        <Contact />
        <StudioMap />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/iletisim` → `200`
Run: `curl -s http://127.0.0.1:3001/iletisim | grep -c "maps?q="` → `≥1`

- [ ] **Step 4: Commit**

```bash
git add frontend/app/iletisim/page.tsx frontend/components/StudioMap.tsx
git commit -m "feat(pages): add /iletisim with map"
```

---

### Task A5: add the three pages to the sitemap

**Files:**
- Modify: `frontend/app/sitemap.ts`

- [ ] **Step 1: Add entries**

In `frontend/app/sitemap.ts`, add these three objects to the returned array (after the `/hizmetler` entry, before the `...SERVICE_SEO.map`):

```ts
    { url: absUrl("/galeri"), lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: absUrl("/hakkimizda"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: absUrl("/iletisim"), lastModified: now, changeFrequency: "yearly", priority: 0.6 },
```

- [ ] **Step 2: Verify**

Run: `curl -s http://127.0.0.1:3001/sitemap.xml | grep -c "/galeri\|/hakkimizda\|/iletisim"` → `3`

- [ ] **Step 3: Commit**

```bash
git add frontend/app/sitemap.ts
git commit -m "feat(seo): add static pages to sitemap"
```

---

# PART B — Blog backend (Laravel + Filament)

### Task B1: Install Filament, verify compat, create panel + owner user

**Files:**
- Modify: `backend/composer.json` (via composer)
- Create: `backend/app/Providers/Filament/AdminPanelProvider.php` (generated)
- Create: `backend/database/seeders/OwnerUserSeeder.php`
- Modify: `backend/database/seeders/DatabaseSeeder.php`

**⚠️ Compatibility checkpoint (do this first):**

- [ ] **Step 1: Attempt Filament install**

Run: `cd backend && composer require filament/filament:"^4.0" -W`
Expected: resolves and installs.
**If composer reports a `laravel/framework ^13` conflict** (Filament has no v13-compatible release yet): STOP and switch to the fallback — do NOT downgrade Laravel. Fallback = Laravel Breeze auth + hand-rolled Blade CRUD for posts/categories/tags (same schema, same API). Record the decision in this file under the task and continue the plan from Task B2 (schema is identical either way; only B4 changes). Ask the human before starting the fallback.

- [ ] **Step 2: Install the panel**

Run: `php artisan filament:install --panels`
Accept the default panel id `admin` (path `/admin`).
Expected: `AdminPanelProvider.php` created and registered in `bootstrap/providers.php`.

- [ ] **Step 3: Make `User` a Filament user (dev: allow any authenticated user)**

In `backend/app/Models/User.php`, implement `FilamentUser`:

```php
use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;

class User extends Authenticatable implements FilamentUser
{
    // ...existing...
    public function canAccessPanel(Panel $panel): bool
    {
        return true; // ponytail: single-tenant studio admin; tighten to an allowlist if staff grows
    }
}
```

- [ ] **Step 4: Seed the owner account from env**

`backend/database/seeders/OwnerUserSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class OwnerUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => env('OWNER_EMAIL', 'owner@striastudio.com')],
            [
                'name' => 'Stria Studio',
                'password' => Hash::make(env('OWNER_PASSWORD', 'change-me-now')),
            ],
        );
    }
}
```

Register it in `DatabaseSeeder::run()`:

```php
$this->call(OwnerUserSeeder::class);
```

- [ ] **Step 5: Run the seeder**

Run: `php artisan db:seed --class=OwnerUserSeeder`
Expected: `Database seeding completed successfully.`

- [ ] **Step 6: Verify the panel loads**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8002/admin/login` → `200`

- [ ] **Step 7: Commit**

```bash
git add backend/composer.json backend/composer.lock backend/app backend/bootstrap/providers.php backend/database/seeders
git commit -m "feat(admin): install Filament panel + owner seeder"
```

---

### Task B2: Migrations for posts, categories, tags, pivot

**Files:**
- Create: `backend/database/migrations/xxxx_create_categories_table.php`
- Create: `backend/database/migrations/xxxx_create_tags_table.php`
- Create: `backend/database/migrations/xxxx_create_posts_table.php`
- Create: `backend/database/migrations/xxxx_create_post_tag_table.php`

- [ ] **Step 1: Generate migration stubs**

Run:
```bash
cd backend
php artisan make:migration create_categories_table
php artisan make:migration create_tags_table
php artisan make:migration create_posts_table
php artisan make:migration create_post_tag_table
```

- [ ] **Step 2: Fill categories**

`up()` body:

```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name_tr');
    $table->string('name_en');
    $table->string('slug')->unique();
    $table->timestamps();
});
```

- [ ] **Step 3: Fill tags**

```php
Schema::create('tags', function (Blueprint $table) {
    $table->id();
    $table->string('name_tr');
    $table->string('name_en');
    $table->string('slug')->unique();
    $table->timestamps();
});
```

- [ ] **Step 4: Fill posts** (create AFTER categories so the FK resolves — rename the file timestamp if needed so posts sorts after categories)

```php
Schema::create('posts', function (Blueprint $table) {
    $table->id();
    $table->string('title_tr');
    $table->string('title_en');
    $table->string('slug')->unique();
    $table->text('excerpt_tr');
    $table->text('excerpt_en');
    $table->longText('body_tr');
    $table->longText('body_en');
    $table->string('cover_path')->nullable();
    $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
    $table->string('meta_title_tr')->nullable();
    $table->string('meta_title_en')->nullable();
    $table->string('meta_desc_tr')->nullable();
    $table->string('meta_desc_en')->nullable();
    $table->boolean('is_published')->default(false)->index();
    $table->timestamp('published_at')->nullable();
    $table->timestamps();
});
```

- [ ] **Step 5: Fill post_tag pivot**

```php
Schema::create('post_tag', function (Blueprint $table) {
    $table->foreignId('post_id')->constrained()->cascadeOnDelete();
    $table->foreignId('tag_id')->constrained()->cascadeOnDelete();
    $table->primary(['post_id', 'tag_id']);
});
```

- [ ] **Step 6: Migrate**

Run: `php artisan migrate`
Expected: all four migrations run without error.

- [ ] **Step 7: Commit**

```bash
git add backend/database/migrations
git commit -m "feat(blog): posts/categories/tags schema"
```

---

### Task B3: Eloquent models + published scope (TDD)

**Files:**
- Create: `backend/app/Models/Post.php`
- Create: `backend/app/Models/Category.php`
- Create: `backend/app/Models/Tag.php`
- Create: `backend/database/factories/PostFactory.php`
- Create: `backend/database/factories/CategoryFactory.php`
- Test: `backend/tests/Feature/PostModelTest.php`

**Interfaces:**
- Produces: `Post` with `scopePublished()` (is_published = true AND published_at <= now), `category()` belongsTo, `tags()` belongsToMany; `Category` hasMany `posts`; `Tag` belongsToMany `posts`.

- [ ] **Step 1: Write the failing test**

`backend/tests/Feature/PostModelTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PostModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_published_scope_excludes_drafts_and_future(): void
    {
        Post::factory()->create(['is_published' => false, 'published_at' => now()->subDay()]);
        Post::factory()->create(['is_published' => true, 'published_at' => now()->addDay()]);
        $live = Post::factory()->create(['is_published' => true, 'published_at' => now()->subDay()]);

        $ids = Post::published()->pluck('id');

        $this->assertTrue($ids->contains($live->id));
        $this->assertCount(1, $ids);
    }
}
```

- [ ] **Step 2: Run — expect fail**

Run: `php artisan test --filter=PostModelTest`
Expected: FAIL (no `Post` model / factory).

- [ ] **Step 3: Create the models**

`backend/app/Models/Category.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = ['name_tr', 'name_en', 'slug'];

    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}
```

`backend/app/Models/Tag.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['name_tr', 'name_en', 'slug'];

    public function posts()
    {
        return $this->belongsToMany(Post::class);
    }
}
```

`backend/app/Models/Post.php`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_tr', 'title_en', 'slug', 'excerpt_tr', 'excerpt_en',
        'body_tr', 'body_en', 'cover_path', 'category_id',
        'meta_title_tr', 'meta_title_en', 'meta_desc_tr', 'meta_desc_en',
        'is_published', 'published_at',
    ];

    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }
}
```

- [ ] **Step 4: Create factories**

`backend/database/factories/CategoryFactory.php`:

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);
        return [
            'name_tr' => $name,
            'name_en' => $name,
            'slug' => Str::slug($name).'-'.$this->faker->unique()->numberBetween(1, 99999),
        ];
    }
}
```

`backend/database/factories/PostFactory.php`:

```php
<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    public function definition(): array
    {
        $title = $this->faker->sentence(4);
        return [
            'title_tr' => $title,
            'title_en' => $title,
            'slug' => Str::slug($title).'-'.$this->faker->unique()->numberBetween(1, 99999),
            'excerpt_tr' => $this->faker->sentence(),
            'excerpt_en' => $this->faker->sentence(),
            'body_tr' => '<p>'.$this->faker->paragraph().'</p>',
            'body_en' => '<p>'.$this->faker->paragraph().'</p>',
            'cover_path' => null,
            'category_id' => null,
            'is_published' => true,
            'published_at' => now()->subDay(),
        ];
    }
}
```

- [ ] **Step 5: Run — expect pass**

Run: `php artisan test --filter=PostModelTest`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/app/Models backend/database/factories backend/tests/Feature/PostModelTest.php
git commit -m "feat(blog): Post/Category/Tag models + published scope"
```

---

### Task B4: Filament resources (Post, Category, Tag)

**Files:**
- Create: `backend/app/Filament/Resources/PostResource.php` (+ generated pages)
- Create: `backend/app/Filament/Resources/CategoryResource.php`
- Create: `backend/app/Filament/Resources/TagResource.php`

*(If the B1 fallback was taken, replace this task with Breeze + Blade CRUD covering the same fields; the API in B5 is unaffected.)*

- [ ] **Step 1: Generate resources**

Run:
```bash
cd backend
php artisan make:filament-resource Category --generate
php artisan make:filament-resource Tag --generate
php artisan make:filament-resource Post
```

- [ ] **Step 2: Define the Post form**

In `PostResource::form()`, use TR/EN tabs, rich editor, cover upload, category/tag pickers, SEO section, publish controls. Body:

```php
use Filament\Forms;
use Filament\Forms\Form;

public static function form(Form $form): Form
{
    return $form->schema([
        Forms\Components\Tabs::make()->tabs([
            Forms\Components\Tabs\Tab::make('Türkçe')->schema([
                Forms\Components\TextInput::make('title_tr')->required()->maxLength(180)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn ($state, Forms\Set $set) => $set('slug', \Illuminate\Support\Str::slug($state))),
                Forms\Components\Textarea::make('excerpt_tr')->required()->rows(2)->maxLength(300),
                Forms\Components\RichEditor::make('body_tr')->required()->columnSpanFull(),
            ]),
            Forms\Components\Tabs\Tab::make('English')->schema([
                Forms\Components\TextInput::make('title_en')->required()->maxLength(180),
                Forms\Components\Textarea::make('excerpt_en')->required()->rows(2)->maxLength(300),
                Forms\Components\RichEditor::make('body_en')->required()->columnSpanFull(),
            ]),
            Forms\Components\Tabs\Tab::make('SEO / Meta')->schema([
                Forms\Components\TextInput::make('slug')->required()->unique(ignoreRecord: true),
                Forms\Components\TextInput::make('meta_title_tr')->maxLength(60),
                Forms\Components\TextInput::make('meta_title_en')->maxLength(60),
                Forms\Components\Textarea::make('meta_desc_tr')->rows(2)->maxLength(160),
                Forms\Components\Textarea::make('meta_desc_en')->rows(2)->maxLength(160),
            ]),
        ])->columnSpanFull(),
        Forms\Components\FileUpload::make('cover_path')->image()->directory('covers')->disk('public'),
        Forms\Components\Select::make('category_id')->relationship('category', 'name_tr')->searchable()->preload(),
        Forms\Components\Select::make('tags')->relationship('tags', 'name_tr')->multiple()->searchable()->preload(),
        Forms\Components\Toggle::make('is_published'),
        Forms\Components\DateTimePicker::make('published_at')->default(now()),
    ]);
}
```

- [ ] **Step 3: Define the Post table**

In `PostResource::table()`:

```php
use Filament\Tables;
use Filament\Tables\Table;

public static function table(Table $table): Table
{
    return $table->columns([
        Tables\Columns\TextColumn::make('title_tr')->searchable()->limit(40),
        Tables\Columns\TextColumn::make('category.name_tr')->badge(),
        Tables\Columns\IconColumn::make('is_published')->boolean(),
        Tables\Columns\TextColumn::make('published_at')->dateTime('d.m.Y')->sortable(),
    ])->filters([
        Tables\Filters\SelectFilter::make('category')->relationship('category', 'name_tr'),
        Tables\Filters\TernaryFilter::make('is_published'),
    ])->defaultSort('published_at', 'desc');
}
```

- [ ] **Step 4: Verify admin CRUD manually**

Run: `php artisan storage:link` (needed for cover preview; also required by B5).
Then log in at `http://127.0.0.1:8002/admin` with the seeded owner creds, create a category, a tag, and one **published** post with a cover image.
Expected: the post saves; the cover appears; no errors.

- [ ] **Step 5: Commit**

```bash
git add backend/app/Filament public/storage
git commit -m "feat(admin): Filament Post/Category/Tag resources"
```

---

### Task B5: Public read-only API (TDD)

**Files:**
- Create: `backend/app/Http/Resources/PostListResource.php`
- Create: `backend/app/Http/Resources/PostApiResource.php` *(named `PostApiResource`, not `PostResource`, to avoid clashing with the Filament `PostResource`)*
- Create: `backend/app/Http/Controllers/BlogController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/BlogApiTest.php`

**Interfaces:**
- Produces these endpoints (all under `/api`):
  - `GET /posts?category={slug}&tag={slug}&page={n}` → `{ data: PostList[], meta, links }` (Laravel paginator), published only, newest first.
  - `GET /posts/{slug}` → `{ data: PostFull }`, 404 if not published.
  - `GET /categories` → `{ data: [{id,slug,name_tr,name_en}] }`
  - `GET /tags` → `{ data: [{id,slug,name_tr,name_en}] }`
- `PostList` fields: `id, slug, title_tr, title_en, excerpt_tr, excerpt_en, cover_url, published_at, category:{slug,name_tr,name_en}|null, tags:[{slug,name_tr,name_en}]`.
- `PostFull` = `PostList` + `body_tr, body_en, meta_title_tr, meta_title_en, meta_desc_tr, meta_desc_en`.
- `cover_url` = absolute URL to `/storage/{cover_path}` or `null`.

- [ ] **Step 1: Write the failing test**

`backend/tests/Feature/BlogApiTest.php`:

```php
<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BlogApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_list_returns_only_published(): void
    {
        Post::factory()->create(['is_published' => false, 'published_at' => now()->subDay()]);
        Post::factory()->create(['title_tr' => 'Yayında', 'is_published' => true, 'published_at' => now()->subDay()]);

        $res = $this->getJson('/api/posts');

        $res->assertOk()->assertJsonCount(1, 'data');
        $res->assertJsonPath('data.0.title_tr', 'Yayında');
    }

    public function test_single_published_post_by_slug(): void
    {
        $post = Post::factory()->create(['slug' => 'ilk-yazi', 'is_published' => true, 'published_at' => now()->subDay()]);

        $this->getJson('/api/posts/ilk-yazi')
            ->assertOk()
            ->assertJsonPath('data.slug', 'ilk-yazi')
            ->assertJsonStructure(['data' => ['body_tr', 'body_en', 'meta_title_tr']]);
    }

    public function test_unpublished_post_is_404(): void
    {
        Post::factory()->create(['slug' => 'gizli', 'is_published' => false]);
        $this->getJson('/api/posts/gizli')->assertNotFound();
    }

    public function test_category_filter(): void
    {
        $cat = Category::factory()->create(['slug' => 'bakim']);
        Post::factory()->create(['is_published' => true, 'published_at' => now()->subDay(), 'category_id' => $cat->id]);
        Post::factory()->create(['is_published' => true, 'published_at' => now()->subDay()]);

        $this->getJson('/api/posts?category=bakim')->assertOk()->assertJsonCount(1, 'data');
    }
}
```

- [ ] **Step 2: Run — expect fail**

Run: `php artisan test --filter=BlogApiTest`
Expected: FAIL (routes/controller missing).

- [ ] **Step 3: Create the list resource**

`backend/app/Http/Resources/PostListResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostListResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title_tr' => $this->title_tr,
            'title_en' => $this->title_en,
            'excerpt_tr' => $this->excerpt_tr,
            'excerpt_en' => $this->excerpt_en,
            'cover_url' => $this->cover_path ? asset('storage/'.$this->cover_path) : null,
            'published_at' => $this->published_at?->toIso8601String(),
            'category' => $this->whenLoaded('category', fn () => $this->category ? [
                'slug' => $this->category->slug,
                'name_tr' => $this->category->name_tr,
                'name_en' => $this->category->name_en,
            ] : null),
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->map(fn ($t) => [
                'slug' => $t->slug, 'name_tr' => $t->name_tr, 'name_en' => $t->name_en,
            ])),
        ];
    }
}
```

- [ ] **Step 4: Create the full resource**

`backend/app/Http/Resources/PostApiResource.php`:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;

class PostApiResource extends PostListResource
{
    public function toArray(Request $request): array
    {
        return parent::toArray($request) + [
            'body_tr' => $this->body_tr,
            'body_en' => $this->body_en,
            'meta_title_tr' => $this->meta_title_tr,
            'meta_title_en' => $this->meta_title_en,
            'meta_desc_tr' => $this->meta_desc_tr,
            'meta_desc_en' => $this->meta_desc_en,
        ];
    }
}
```

- [ ] **Step 5: Create the controller**

`backend/app/Http/Controllers/BlogController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Http\Resources\PostApiResource;
use App\Http\Resources\PostListResource;
use App\Models\Category;
use App\Models\Post;
use App\Models\Tag;
use Illuminate\Http\Request;

class BlogController extends Controller
{
    public function index(Request $request)
    {
        $posts = Post::published()
            ->with(['category', 'tags'])
            ->when($request->query('category'), fn ($q, $slug) =>
                $q->whereHas('category', fn ($c) => $c->where('slug', $slug)))
            ->when($request->query('tag'), fn ($q, $slug) =>
                $q->whereHas('tags', fn ($t) => $t->where('slug', $slug)))
            ->orderByDesc('published_at')
            ->paginate(9);

        return PostListResource::collection($posts);
    }

    public function show(string $slug)
    {
        $post = Post::published()->with(['category', 'tags'])->where('slug', $slug)->firstOrFail();
        return new PostApiResource($post);
    }

    public function categories()
    {
        return response()->json(['data' => Category::orderBy('name_tr')
            ->get(['id', 'slug', 'name_tr', 'name_en'])]);
    }

    public function tags()
    {
        return response()->json(['data' => Tag::orderBy('name_tr')
            ->get(['id', 'slug', 'name_tr', 'name_en'])]);
    }
}
```

- [ ] **Step 6: Register routes**

Append to `backend/routes/api.php`:

```php
use App\Http\Controllers\BlogController;

Route::get('/posts', [BlogController::class, 'index']);
Route::get('/posts/{slug}', [BlogController::class, 'show']);
Route::get('/categories', [BlogController::class, 'categories']);
Route::get('/tags', [BlogController::class, 'tags']);
```

- [ ] **Step 7: Run — expect pass**

Run: `php artisan test --filter=BlogApiTest`
Expected: PASS (4 tests).

- [ ] **Step 8: Verify CORS for the Next origin**

Run: `curl -s -o /dev/null -w "%{http_code}\n" -H "Origin: http://localhost:3001" http://127.0.0.1:8002/api/posts` → `200`.
If the response lacks `Access-Control-Allow-Origin`, publish + edit CORS: `php artisan config:publish cors` then set `'paths' => ['api/*']`, `'allowed_origins' => ['*']`. (Default framework CORS already allows `api/*`; the contact form works cross-origin, so this is a safety check.)

- [ ] **Step 9: Commit**

```bash
git add backend/app/Http backend/routes/api.php backend/tests/Feature/BlogApiTest.php
git commit -m "feat(blog): public posts/categories/tags API"
```

---

# PART C — Blog frontend (Next)

### Task C1: Allow `next/image` to load admin-uploaded covers

**Files:**
- Modify: `frontend/next.config.ts`

- [ ] **Step 1: Add remotePatterns**

Merge into the `nextConfig` object (keep the existing `allowedDevOrigins`):

```ts
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8002", pathname: "/storage/**" },
      { protocol: "http", hostname: "localhost", port: "8002", pathname: "/storage/**" },
    ],
  },
```

- [ ] **Step 2: Restart dev + verify config valid**

Restart the Next dev server. Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/` → `200`.

- [ ] **Step 3: Commit**

```bash
git add frontend/next.config.ts
git commit -m "chore(next): allow storage image host"
```

---

### Task C2: Blog API client + types

**Files:**
- Create: `frontend/lib/blog.ts`

**Interfaces:**
- Produces:
  - Types `PostList`, `PostFull`, `Category`, `Tag`, `Paginated<T>`.
  - `getPosts(params?: { category?: string; tag?: string; page?: number }): Promise<Paginated<PostList>>`
  - `getPost(slug: string): Promise<PostFull | null>`
  - `getCategories(): Promise<Category[]>`
  - `getTags(): Promise<Tag[]>`
  - `getAllPostSlugs(): Promise<string[]>` (paginates through the list for the sitemap)
- Consumes: `site.apiUrl`.

- [ ] **Step 1: Create the client**

`frontend/lib/blog.ts`:

```ts
import { site } from "@/lib/site";

export type Category = { id: number; slug: string; name_tr: string; name_en: string };
export type Tag = { slug: string; name_tr: string; name_en: string };

export type PostList = {
  id: number;
  slug: string;
  title_tr: string;
  title_en: string;
  excerpt_tr: string;
  excerpt_en: string;
  cover_url: string | null;
  published_at: string | null;
  category: { slug: string; name_tr: string; name_en: string } | null;
  tags: Tag[];
};

export type PostFull = PostList & {
  body_tr: string;
  body_en: string;
  meta_title_tr: string | null;
  meta_title_en: string | null;
  meta_desc_tr: string | null;
  meta_desc_en: string | null;
};

export type Paginated<T> = {
  data: T[];
  meta: { current_page: number; last_page: number; total: number };
};

const REVALIDATE = 300;

async function api<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${site.apiUrl}/api${path}`, {
      next: { revalidate: REVALIDATE },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getPosts(
  params: { category?: string; tag?: string; page?: number } = {},
): Promise<Paginated<PostList>> {
  const q = new URLSearchParams();
  if (params.category) q.set("category", params.category);
  if (params.tag) q.set("tag", params.tag);
  if (params.page) q.set("page", String(params.page));
  const qs = q.toString();
  const out = await api<Paginated<PostList>>(`/posts${qs ? `?${qs}` : ""}`);
  return out ?? { data: [], meta: { current_page: 1, last_page: 1, total: 0 } };
}

export async function getPost(slug: string): Promise<PostFull | null> {
  const out = await api<{ data: PostFull }>(`/posts/${encodeURIComponent(slug)}`);
  return out?.data ?? null;
}

export async function getCategories(): Promise<Category[]> {
  const out = await api<{ data: Category[] }>("/categories");
  return out?.data ?? [];
}

export async function getTags(): Promise<Tag[]> {
  const out = await api<{ data: Tag[] }>("/tags");
  return out?.data ?? [];
}

export async function getAllPostSlugs(): Promise<string[]> {
  const slugs: string[] = [];
  let page = 1;
  for (;;) {
    const res = await getPosts({ page });
    slugs.push(...res.data.map((p) => p.slug));
    if (page >= res.meta.last_page || res.data.length === 0) break;
    page++;
  }
  return slugs;
}
```

- [ ] **Step 2: Verify typecheck**

Run: `cd frontend && npx tsc --noEmit` → no errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/lib/blog.ts
git commit -m "feat(blog): Next API client + types"
```

---

### Task C3: `/blog` list page + client list/filter

**Files:**
- Create: `frontend/app/blog/page.tsx`
- Create: `frontend/components/BlogList.tsx`
- Create: `frontend/lib/date.ts` (small bilingual date formatter)

**Interfaces:**
- Consumes: `getPosts`, `getCategories` (server); `useLang` (client).
- Produces: `BlogList({ initial, categories }: { initial: PostList[]; categories: Category[] })`; `fmtDate(iso: string | null, lang: "tr" | "en"): string`.

> **ponytail — pagination deferred:** the API + `getPosts` already support `page`, but this UI renders only the first page (9 posts) and filters client-side. A new studio blog won't exceed 9 posts for a long time. Add a "load more"/page nav (fetch `getPosts({ page })` client-side) when `posts.meta.last_page > 1` actually happens. Documented so it's a known ceiling, not a silent cap.

- [ ] **Step 1: Create the date helper**

`frontend/lib/date.ts`:

```ts
export function fmtDate(iso: string | null, lang: "tr" | "en"): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(lang === "tr" ? "tr-TR" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
```

- [ ] **Step 2: Create the client list**

`frontend/components/BlogList.tsx`:

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { fmtDate } from "@/lib/date";
import type { Category, PostList } from "@/lib/blog";

export function BlogList({
  initial,
  categories,
}: {
  initial: PostList[];
  categories: Category[];
}) {
  const { lang } = useLang();
  const [active, setActive] = useState<string | null>(null);

  const posts = active
    ? initial.filter((p) => p.category?.slug === active)
    : initial;

  return (
    <section className="px-[clamp(18px,5vw,56px)] pb-[clamp(64px,8vw,120px)]">
      <div className="mx-auto max-w-[1160px]">
        {categories.length > 0 && (
          <div className="mb-8 flex flex-wrap gap-2">
            <button
              onClick={() => setActive(null)}
              className={`rounded-[20px] border px-4 py-2 text-[13px] transition-colors ${active === null ? "border-accent bg-accent text-white" : "border-line bg-white text-muted"}`}
            >
              {lang === "tr" ? "Tümü" : "All"}
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setActive(c.slug)}
                className={`rounded-[20px] border px-4 py-2 text-[13px] transition-colors ${active === c.slug ? "border-accent bg-accent text-white" : "border-line bg-white text-muted"}`}
              >
                {lang === "tr" ? c.name_tr : c.name_en}
              </button>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <p className="text-muted">{lang === "tr" ? "Henüz yazı yok." : "No posts yet."}</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
            {posts.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-[24px] border border-line bg-white transition hover:-translate-y-1 hover:shadow-[0_30px_60px_-40px_rgba(66,48,46,0.5)]"
              >
                <div className="relative h-[200px] bg-pink">
                  {p.cover_url && (
                    <Image
                      src={p.cover_url}
                      alt={lang === "tr" ? p.title_tr : p.title_en}
                      fill
                      sizes="(max-width: 768px) 100vw, 380px"
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  {p.category && (
                    <span className="text-[11px] uppercase tracking-[0.12em] text-accent">
                      {lang === "tr" ? p.category.name_tr : p.category.name_en}
                    </span>
                  )}
                  <h2 className="text-[20px] leading-[1.2] text-ink group-hover:text-accent">
                    {lang === "tr" ? p.title_tr : p.title_en}
                  </h2>
                  <p className="flex-1 text-sm leading-[1.6] text-muted">
                    {lang === "tr" ? p.excerpt_tr : p.excerpt_en}
                  </p>
                  <time className="text-[12px] text-muted2">{fmtDate(p.published_at, lang)}</time>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create the page**

`frontend/app/blog/page.tsx`:

```tsx
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { BlogList } from "@/components/BlogList";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata } from "@/lib/seo";
import { getPosts, getCategories } from "@/lib/blog";

export const revalidate = 300;

export const metadata = buildMetadata({
  title: "Blog · Stria Studio · Ankara",
  description:
    "Kalıcı makyaj, microblading ve bakım üzerine Stria Studio blogu — Ankara Çankaya.",
  path: "/blog",
});

export default async function BlogPage() {
  const [posts, categories] = await Promise.all([getPosts(), getCategories()]);

  return (
    <>
      <Nav />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />
      <main className="pt-[132px]">
        <header className="px-[clamp(18px,5vw,56px)] pb-8 pt-[clamp(24px,4vw,48px)]">
          <div className="mx-auto max-w-[1160px]">
            <h1 className="text-[clamp(32px,4.6vw,58px)] leading-[1.05]">Blog</h1>
          </div>
        </header>
        <BlogList initial={posts.data} categories={categories} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 4: Verify (needs one published post from B4)**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/blog` → `200`.
Run: `curl -s http://127.0.0.1:3001/blog | grep -c "BreadcrumbList"` → `≥1`.
If a published post exists, its title appears in the HTML.

- [ ] **Step 5: Commit**

```bash
git add frontend/app/blog/page.tsx frontend/components/BlogList.tsx frontend/lib/date.ts
git commit -m "feat(blog): /blog list page with category filter"
```

---

### Task C4: `/blog/[slug]` detail page

**Files:**
- Create: `frontend/app/blog/[slug]/page.tsx`
- Create: `frontend/components/PostBody.tsx`

**Interfaces:**
- Consumes: `getPost`, `getAllPostSlugs`; `useLang`; `buildMetadata`, `breadcrumbSchema`, `absUrl`, `JsonLd`, `fmtDate`.
- Produces: `PostBody({ post }: { post: PostFull })` (client; renders lang-correct title/body/meta).

- [ ] **Step 1: Create the client body**

`frontend/components/PostBody.tsx`:

```tsx
"use client";

import Image from "next/image";
import { useLang } from "@/components/LanguageProvider";
import { fmtDate } from "@/lib/date";
import type { PostFull } from "@/lib/blog";

export function PostBody({ post }: { post: PostFull }) {
  const { lang } = useLang();
  const title = lang === "tr" ? post.title_tr : post.title_en;
  const body = lang === "tr" ? post.body_tr : post.body_en;

  return (
    <article className="px-[clamp(18px,5vw,56px)] py-[clamp(32px,5vw,64px)]">
      <div className="mx-auto max-w-[760px]">
        {post.category && (
          <span className="text-[12px] uppercase tracking-[0.12em] text-accent">
            {lang === "tr" ? post.category.name_tr : post.category.name_en}
          </span>
        )}
        <h1 className="mb-3 mt-2 text-[clamp(30px,4vw,52px)] leading-[1.08]">{title}</h1>
        <time className="text-[13px] text-muted2">{fmtDate(post.published_at, lang)}</time>

        {post.cover_url && (
          <div className="relative my-8 h-[min(52vh,460px)] overflow-hidden rounded-[28px]">
            <Image src={post.cover_url} alt={title} fill sizes="760px" className="object-cover" priority />
          </div>
        )}

        {/* body is trusted HTML authored by the owner in the admin editor */}
        <div
          className="prose-stria flex flex-col gap-4 text-[16px] leading-[1.75] text-muted2 [&_a]:text-accent [&_h2]:mt-8 [&_h2]:text-[26px] [&_h2]:text-ink [&_h3]:mt-6 [&_h3]:text-[20px] [&_h3]:text-ink [&_img]:rounded-[18px] [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-ink"
          dangerouslySetInnerHTML={{ __html: body }}
        />

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag.slug} className="rounded-[16px] bg-cream px-3 py-[6px] text-[12px] text-muted">
                #{lang === "tr" ? tag.name_tr : tag.name_en}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Create the page**

`frontend/app/blog/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { PostBody } from "@/components/PostBody";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbSchema } from "@/components/schema";
import { buildMetadata, absUrl } from "@/lib/seo";
import { getPost, getAllPostSlugs } from "@/lib/blog";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    title: (post.meta_title_tr || post.title_tr) + " · Stria Studio",
    description: post.meta_desc_tr || post.excerpt_tr,
    path: `/blog/${post.slug}`,
    image: post.cover_url ?? undefined,
  });
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title_tr,
    description: post.excerpt_tr,
    datePublished: post.published_at,
    image: post.cover_url ?? absUrl("/images/hero.png"),
    author: { "@type": "Organization", name: "Stria Studio" },
    mainEntityOfPage: absUrl(`/blog/${post.slug}`),
  };

  return (
    <>
      <Nav />
      <JsonLd data={blogPosting} />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title_tr, path: `/blog/${post.slug}` },
        ])}
      />
      <main className="pt-[132px]">
        <PostBody post={post} />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 3: Verify (needs the published post from B4)**

Run: `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/blog/<real-slug>` → `200`.
Run: `curl -s http://127.0.0.1:3001/blog/<real-slug> | grep -c "BlogPosting"` → `≥1`.
Run: an unknown slug returns `404`.

- [ ] **Step 4: Commit**

```bash
git add "frontend/app/blog/[slug]/page.tsx" frontend/components/PostBody.tsx
git commit -m "feat(blog): /blog/[slug] detail page + SEO"
```

---

### Task C5: Blog link in Nav/Footer + blog in sitemap

**Files:**
- Modify: `frontend/lib/i18n.ts` (add `navBlog` to `Dict` + both locales)
- Modify: `frontend/components/Nav.tsx` (add Blog link)
- Modify: `frontend/components/Footer.tsx` (add Blog to explore)
- Modify: `frontend/app/sitemap.ts`

- [ ] **Step 1: Add `navBlog` to the type + locales**

`Dict` type: add `navBlog: string;`. In `tr`: `navBlog: "Blog",`. In `en`: `navBlog: "Blog",`.

- [ ] **Step 2: Add the Nav link**

In `Nav.tsx`, after the `/iletisim` link:

```tsx
          <a href="/blog" className="hidden text-[13px] text-muted sm:inline">
            {t.navBlog}
          </a>
```

- [ ] **Step 3: Add to Footer explore**

In `Footer.tsx` `explore` array, append:

```tsx
    { href: "/blog", label: t.navBlog },
```

- [ ] **Step 4: Add blog to sitemap**

In `frontend/app/sitemap.ts`, make the default export `async`, import the client, and append blog URLs:

```ts
import { getAllPostSlugs } from "@/lib/blog";
// ...
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const slugs = await getAllPostSlugs();
  const blog = [
    { url: absUrl("/blog"), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    ...slugs.map((s) => ({
      url: absUrl(`/blog/${s}`),
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
  return [
    // ...existing entries...
    ...blog,
  ];
}
```

- [ ] **Step 5: Verify**

Run: `cd frontend && npx tsc --noEmit` → no errors.
Run: `curl -s http://127.0.0.1:3001/blog | grep -c ">Blog<"` → `≥1` (nav link).
Run: `curl -s http://127.0.0.1:3001/sitemap.xml | grep -c "/blog"` → `≥1`.

- [ ] **Step 6: Commit**

```bash
git add frontend/lib/i18n.ts frontend/components/Nav.tsx frontend/components/Footer.tsx frontend/app/sitemap.ts
git commit -m "feat(blog): nav/footer link + sitemap"
```

---

## Final verification (whole feature)

- [ ] `cd frontend && npx tsc --noEmit && npm run build` → builds clean.
- [ ] `cd backend && php artisan test` → all tests pass.
- [ ] Manual: create a bilingual published post in `/admin`; it appears at `/blog`, opens at `/blog/<slug>`, toggles TR/EN, cover renders, breadcrumb + BlogPosting JSON-LD present.
- [ ] All three static pages load, nav/footer point to them, lang toggle works.
