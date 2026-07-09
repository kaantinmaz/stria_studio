# Analytics Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`).

**Goal:** First-party, cookieless analytics: Next tracker → `POST /api/track` → `visits`/`events` tables → Filament Chart.js widgets on `/admin` (daily visitors, traffic sources, top pages, WhatsApp/call events). Heatmap deferred.

**Architecture:** A site-wide Next `Analytics` client component beacons pageviews + delegated WhatsApp/call clicks to a throttled Laravel ingest that hashes the IP into a daily-rotating anonymous `visitor_id` (no cookie, no PII). Filament widgets (auto-discovered) chart the data with Filament's native Chart.js widgets.

**Tech Stack:** Next.js 16 · Laravel 13.19 · Filament v4.11 (ChartWidget/StatsOverviewWidget = Chart.js) · MySQL · PHPUnit.

## Global Constraints

- Cookieless: `visitor_id = hash('sha256', $ip . $ua . now()->toDateString() . config('app.key'))`. Raw IP never stored.
- `source` ∈ `ai | search | social | direct | referral` (server-side classifier).
- Ingest returns **204**, is validated, bot-filtered (`/bot|crawl|spider|slurp|headless|preview/i`), throttled (`throttle:120,1`).
- Filament widgets in `app/Filament/Widgets/` (panel already `discoverWidgets`). Use Filament's Chart.js widgets — **no new dependency**.
- Reuse patterns: model ← `app/Models/Service.php`; frontend fetch base `site.apiUrl`; TR labels in charts.
- Tests: sqlite `:memory:`, `php artisan test`.
- Both dev servers run: frontend :3001, Laravel :8002.

---

### Task 1: Migrations + models (TDD)

**Files:**
- Create: `backend/database/migrations/xxxx_create_visits_table.php`, `xxxx_create_events_table.php`
- Create: `backend/app/Models/Visit.php`, `backend/app/Models/Event.php`
- Test: `backend/tests/Feature/AnalyticsModelTest.php`

- [ ] **Step 1: Failing test** — `backend/tests/Feature/AnalyticsModelTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Visit;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsModelTest extends TestCase
{
    use RefreshDatabase;

    public function test_visit_and_event_persist(): void
    {
        Visit::create(['visitor_id' => 'abc', 'path' => '/', 'source' => 'ai']);
        Event::create(['visitor_id' => 'abc', 'name' => 'whatsapp_click', 'path' => '/']);

        $this->assertSame(1, Visit::where('source', 'ai')->count());
        $this->assertSame(1, Event::where('name', 'whatsapp_click')->count());
    }
}
```

- [ ] **Step 2: Run → RED** — `cd backend && php artisan test --filter=AnalyticsModelTest`.

- [ ] **Step 3: Migrations**
`create_visits_table` `up()`:
```php
Schema::create('visits', function (Blueprint $table) {
    $table->id();
    $table->char('visitor_id', 64)->index();
    $table->string('path', 512)->index();
    $table->string('source', 20)->index();
    $table->string('referrer_host')->nullable();
    $table->string('utm_source')->nullable();
    $table->string('utm_medium')->nullable();
    $table->string('utm_campaign')->nullable();
    $table->timestamps();
    $table->index('created_at');
});
```
`create_events_table` `up()`:
```php
Schema::create('events', function (Blueprint $table) {
    $table->id();
    $table->char('visitor_id', 64)->index();
    $table->string('name', 64)->index();
    $table->string('path', 512);
    $table->timestamps();
    $table->index('created_at');
});
```

- [ ] **Step 4: Models** — `backend/app/Models/Visit.php` and `Event.php`, both:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Visit extends Model   // Event.php: class Event
{
    protected $guarded = ['id'];
}
```

- [ ] **Step 5: Migrate + GREEN** — `php artisan migrate && php artisan test --filter=AnalyticsModelTest` (1 pass).

- [ ] **Step 6: Commit**
```bash
git add backend/database/migrations backend/app/Models/Visit.php backend/app/Models/Event.php backend/tests/Feature/AnalyticsModelTest.php
git commit -m "feat(analytics): visits + events tables + models"
```

---

### Task 2: TrafficSource classifier + ingest API (TDD)

**Files:**
- Create: `backend/app/Support/TrafficSource.php`
- Create: `backend/app/Http/Controllers/TrackController.php`
- Modify: `backend/routes/api.php`
- Test: `backend/tests/Feature/TrackApiTest.php`

**Interfaces:** `TrafficSource::classify(?string $referrer, ?string $utmSource): string` → `ai|search|social|direct|referral`. `POST /api/track` stores a visit/event, returns 204.

- [ ] **Step 1: Failing test** — `backend/tests/Feature/TrackApiTest.php`:
```php
<?php

namespace Tests\Feature;

use App\Models\Event;
use App\Models\Visit;
use App\Support\TrafficSource;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TrackApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_classify(): void
    {
        $this->assertSame('ai', TrafficSource::classify('https://chatgpt.com/', null));
        $this->assertSame('ai', TrafficSource::classify(null, 'perplexity'));
        $this->assertSame('search', TrafficSource::classify('https://www.google.com/search?q=x', null));
        $this->assertSame('social', TrafficSource::classify('https://instagram.com/', null));
        $this->assertSame('direct', TrafficSource::classify(null, null));
        $this->assertSame('referral', TrafficSource::classify('https://some-blog.example/', null));
    }

    public function test_pageview_stored_with_source(): void
    {
        $this->postJson('/api/track', [
            'type' => 'pageview', 'path' => '/hizmetler', 'referrer' => 'https://chatgpt.com/',
        ])->assertNoContent();

        $this->assertSame(1, Visit::where('path', '/hizmetler')->where('source', 'ai')->count());
    }

    public function test_event_stored(): void
    {
        $this->postJson('/api/track', ['type' => 'event', 'name' => 'whatsapp_click', 'path' => '/'])
            ->assertNoContent();
        $this->assertSame(1, Event::where('name', 'whatsapp_click')->count());
    }

    public function test_bot_ua_skipped(): void
    {
        $this->withHeaders(['User-Agent' => 'Googlebot/2.1'])
            ->postJson('/api/track', ['type' => 'pageview', 'path' => '/'])
            ->assertNoContent();
        $this->assertSame(0, Visit::count());
    }

    public function test_validation_error(): void
    {
        $this->postJson('/api/track', ['type' => 'bogus'])->assertStatus(422);
    }
}
```

- [ ] **Step 2: Run → RED**.

- [ ] **Step 3: Classifier** — `backend/app/Support/TrafficSource.php`:
```php
<?php

namespace App\Support;

use Illuminate\Support\Str;

class TrafficSource
{
    private const AI = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'bard.google.com', 'claude.ai', 'copilot.microsoft.com', 'you.com', 'poe.com'];
    private const AI_UTM = ['chatgpt', 'openai', 'perplexity', 'gemini', 'claude', 'copilot'];
    private const SEARCH = ['google.', 'bing.', 'yandex.', 'duckduckgo.', 'search.brave.', 'ecosia.'];
    private const SOCIAL = ['instagram.', 'facebook.', 'fb.', 't.co', 'x.com', 'twitter.', 'tiktok.', 'youtube.', 'youtu.be', 'linkedin.', 'pinterest.'];

    public static function classify(?string $referrer, ?string $utmSource): string
    {
        $utm = Str::lower((string) $utmSource);
        foreach (self::AI_UTM as $k) {
            if ($utm !== '' && str_contains($utm, $k)) {
                return 'ai';
            }
        }

        $host = $referrer ? Str::lower((string) parse_url($referrer, PHP_URL_HOST)) : '';
        if ($host === '') {
            return 'direct';
        }
        foreach (self::AI as $h) {
            if (str_contains($host, $h)) {
                return 'ai';
            }
        }
        foreach (self::SEARCH as $h) {
            if (str_contains($host, $h)) {
                return 'search';
            }
        }
        foreach (self::SOCIAL as $h) {
            if (str_contains($host, $h)) {
                return 'social';
            }
        }
        return 'referral';
    }
}
```

- [ ] **Step 4: Controller** — `backend/app/Http/Controllers/TrackController.php`:
```php
<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\Visit;
use App\Support\TrafficSource;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class TrackController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', 'in:pageview,event'],
            'path' => ['required', 'string', 'max:512'],
            'referrer' => ['nullable', 'string', 'max:512'],
            'name' => ['required_if:type,event', 'string', 'max:64'],
            'utm_source' => ['nullable', 'string', 'max:255'],
            'utm_medium' => ['nullable', 'string', 'max:255'],
            'utm_campaign' => ['nullable', 'string', 'max:255'],
        ]);

        $ua = (string) $request->userAgent();
        if (preg_match('/bot|crawl|spider|slurp|headless|preview/i', $ua)) {
            return response()->noContent();
        }

        $visitorId = hash('sha256', $request->ip().$ua.now()->toDateString().config('app.key'));

        if ($data['type'] === 'event') {
            Event::create([
                'visitor_id' => $visitorId,
                'name' => $data['name'],
                'path' => $data['path'],
            ]);
        } else {
            $referrer = $data['referrer'] ?? null;
            Visit::create([
                'visitor_id' => $visitorId,
                'path' => $data['path'],
                'source' => TrafficSource::classify($referrer, $data['utm_source'] ?? null),
                'referrer_host' => $referrer ? Str::lower((string) parse_url($referrer, PHP_URL_HOST)) : null,
                'utm_source' => $data['utm_source'] ?? null,
                'utm_medium' => $data['utm_medium'] ?? null,
                'utm_campaign' => $data['utm_campaign'] ?? null,
            ]);
        }

        return response()->noContent();
    }
}
```

- [ ] **Step 5: Route** — append to `backend/routes/api.php`:
```php
use App\Http\Controllers\TrackController;

Route::post('/track', [TrackController::class, 'store'])->middleware('throttle:120,1');
```

- [ ] **Step 6: Run → GREEN** — `php artisan test --filter=TrackApiTest` (5 pass). Full suite green.

- [ ] **Step 7: Commit**
```bash
git add backend/app/Support/TrafficSource.php backend/app/Http/Controllers/TrackController.php backend/routes/api.php backend/tests/Feature/TrackApiTest.php
git commit -m "feat(analytics): traffic-source classifier + /api/track ingest"
```

---

### Task 3: Frontend tracker

**Files:**
- Create: `frontend/components/Analytics.tsx`
- Modify: `frontend/app/layout.tsx`

- [ ] **Step 1: `Analytics.tsx`** (client, site-wide):
```tsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

function post(body: Record<string, unknown>) {
  try {
    fetch(`${site.apiUrl}/api/track`, {
      method: "POST",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => {});
  } catch {
    /* ignore */
  }
}

export function Analytics() {
  const pathname = usePathname();

  // pageview on every route change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    post({
      type: "pageview",
      path: pathname,
      referrer: document.referrer || null,
      utm_source: params.get("utm_source"),
      utm_medium: params.get("utm_medium"),
      utm_campaign: params.get("utm_campaign"),
    });
  }, [pathname]);

  // delegated click tracking for WhatsApp + call links (no per-component edits)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      const a = el?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) {
        post({ type: "event", name: "call_click", path: window.location.pathname });
      } else if (href.includes("wa.me") || href.includes("whatsapp")) {
        post({ type: "event", name: "whatsapp_click", path: window.location.pathname });
      }
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
```

- [ ] **Step 2: Wire into `layout.tsx`** — render `<Analytics />` inside `<body>` (e.g. right after `<WhatsAppFab />`). Add the import. It needs no provider.

- [ ] **Step 3: Verify** — `cd frontend && npx tsc --noEmit` → clean. Load the homepage, then check a pageview landed:
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3001/    # 200
# hit the site so the browser fires a beacon, OR simulate the beacon:
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8002/api/track \
  -H "Content-Type: application/json" -d '{"type":"pageview","path":"/","referrer":"https://google.com/"}'   # 204
```
Expected: 204 from the simulated beacon. (Real browser beacons fire on navigation; the delegated listener fires on WhatsApp/tel link clicks.)

- [ ] **Step 4: Commit**
```bash
git add frontend/components/Analytics.tsx frontend/app/layout.tsx
git commit -m "feat(analytics): site-wide pageview + click tracker"
```

---

### Task 4: Filament dashboard widgets + demo seeder

**Files:**
- Create: `backend/app/Filament/Widgets/AnalyticsStatsOverview.php`, `DailyVisitorsChart.php`, `TrafficSourcesChart.php`, `TopPagesChart.php`
- Create: `backend/database/seeders/AnalyticsDemoSeeder.php`

- [ ] **Step 1: Demo seeder** (for dashboard to render with data in dev; NOT registered in DatabaseSeeder) — `backend/database/seeders/AnalyticsDemoSeeder.php`: generate ~30 days of random `Visit` rows (varied `source` from the 5 values, varied `path` from `['/', '/hizmetler', '/hizmetler/microblading', '/galeri', '/iletisim', '/blog']`, `created_at` spread across the last 30 days, random `visitor_id`) — a few hundred rows — plus ~40 `Event` rows (`whatsapp_click`/`call_click`). Use `now()->subDays(rand(0,29))` for created_at. Idempotent-ish: `Visit::truncate(); Event::truncate();` at start (dev demo only).

- [ ] **Step 2: Run demo seeder (dev)** — `cd backend && php artisan db:seed --class=AnalyticsDemoSeeder`. Verify `Visit::count() > 0`.

- [ ] **Step 3: StatsOverview widget** — `backend/app/Filament/Widgets/AnalyticsStatsOverview.php`:
```php
<?php

namespace App\Filament\Widgets;

use App\Models\Event;
use App\Models\Visit;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AnalyticsStatsOverview extends StatsOverviewWidget
{
    protected static ?int $sort = -3;

    protected function getStats(): array
    {
        $today = Visit::whereDate('created_at', today())->distinct('visitor_id')->count('visitor_id');
        $week = Visit::where('created_at', '>=', now()->subDays(7))->distinct('visitor_id')->count('visitor_id');
        $views = Visit::count();
        $wa = Event::where('name', 'whatsapp_click')->count();
        $call = Event::where('name', 'call_click')->count();

        return [
            Stat::make('Bugün tekil ziyaretçi', (string) $today),
            Stat::make('Son 7 gün tekil', (string) $week),
            Stat::make('Toplam görüntüleme', (string) $views),
            Stat::make('WhatsApp tıklama', (string) $wa),
            Stat::make('Ara tıklama', (string) $call),
        ];
    }
}
```

- [ ] **Step 4: DailyVisitors line chart** — `DailyVisitorsChart.php`:
```php
<?php

namespace App\Filament\Widgets;

use App\Models\Visit;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Carbon;

class DailyVisitorsChart extends ChartWidget
{
    protected ?string $heading = 'Günlük Ziyaretçi (son 30 gün)';
    protected static ?int $sort = -2;
    protected int|string|array $columnSpan = 'full';

    protected function getData(): array
    {
        $labels = [];
        $counts = [];
        for ($i = 29; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $labels[] = $day->format('d.m');
            $counts[] = Visit::whereDate('created_at', $day)
                ->distinct('visitor_id')->count('visitor_id');
        }

        return [
            'datasets' => [[
                'label' => 'Tekil ziyaretçi',
                'data' => $counts,
                'borderColor' => '#c57c69',
                'backgroundColor' => 'rgba(197,124,105,0.15)',
                'fill' => true,
                'tension' => 0.3,
            ]],
            'labels' => $labels,
        ];
    }

    protected function getType(): string
    {
        return 'line';
    }
}
```

- [ ] **Step 5: TrafficSources doughnut** — `TrafficSourcesChart.php`: `heading = 'Trafik Kaynağı'`, `getType(): 'doughnut'`. `getData()`: `Visit::selectRaw('source, count(*) c')->groupBy('source')->pluck('c','source')`; map the 5 known sources to TR labels `['ai'=>'Yapay Zeka','search'=>'Arama','social'=>'Sosyal','direct'=>'Direkt','referral'=>'Referans']`; dataset `data` = counts in that order, `backgroundColor` = 5 distinct colors (e.g. `['#c57c69','#8a6f6a','#d89a8a','#42302e','#f3ded7']`). `$sort = -1`.

- [ ] **Step 6: TopPages bar** — `TopPagesChart.php`: `heading = 'En Çok Görüntülenen Sayfalar'`, `getType(): 'bar'`, `columnSpan='full'`, `$sort=0`. `getData()`: `Visit::selectRaw('path, count(*) c')->groupBy('path')->orderByDesc('c')->limit(8)->pluck('c','path')`; labels = paths, one dataset `data` = counts, `backgroundColor='#c57c69'`. Set `getOptions()` to `['indexAxis' => 'y']` for a horizontal bar (readable paths).

- [ ] **Step 7: Gate (no browser)**
- `php -l` clean on all 4 widgets + seeder.
- `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8002/admin` → 302 (login redirect, not 500 — widgets don't crash on boot).
- `php artisan filament:optimize-clear` → no error.
- With demo data seeded, the widget queries return rows: `php artisan tinker --execute="echo App\Models\Visit::count();"` > 0.

- [ ] **Step 8: Commit**
```bash
git add backend/app/Filament/Widgets backend/database/seeders/AnalyticsDemoSeeder.php
git commit -m "feat(admin): analytics dashboard widgets (visitors, sources, top pages, events)"
```

---

### Task 5: End-to-end verification + final

- [ ] **Step 1: Live e2e** — send a real beacon and confirm it lands + a widget query reflects it:
```bash
# pageview from an AI referrer
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8002/api/track \
  -H "Content-Type: application/json" -d '{"type":"pageview","path":"/e2e-test","referrer":"https://perplexity.ai/"}'   # 204
# event
curl -s -o /dev/null -w "%{http_code}\n" -X POST http://127.0.0.1:8002/api/track \
  -H "Content-Type: application/json" -d '{"type":"event","name":"whatsapp_click","path":"/"}'   # 204
cd backend && php artisan tinker --execute="echo App\Models\Visit::where('path','/e2e-test')->where('source','ai')->count().' '.App\Models\Event::where('name','whatsapp_click')->count();"
```
Expected: `1 <n>` (the AI-sourced visit stored; whatsapp events ≥1).

- [ ] **Step 2: Full backend suite** — `cd backend && php artisan test` → all pass.

- [ ] **Step 3: Frontend build** — `cd frontend && npx tsc --noEmit && npm run build 2>&1 | tail -15` → clean.

- [ ] **Step 4: Admin dashboard renders** — `curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8002/admin` → 302; log in manually (owner) to eyeball the 4 widgets (charts + stats) if a browser is available; otherwise rely on the boot-without-500 + populated queries from Task 4.

- [ ] **Step 5: (no commit — verification only; or commit any doc note.)**

---

## Final verification
- [ ] `cd backend && php artisan test` → all pass (analytics model + track API + prior suites).
- [ ] `cd frontend && npx tsc --noEmit && npm run build` → clean.
- [ ] Live beacon (`/api/track`) returns 204; pageview classified by source; event stored; bot UA skipped.
- [ ] `/admin` loads (302 unauth); 4 analytics widgets present and query without error; demo data renders charts.
- [ ] Tracker fires site-wide (pageview on nav; WhatsApp/tel clicks → events) — verified by a real browser click producing an event row, or the delegated-listener logic reviewed.
