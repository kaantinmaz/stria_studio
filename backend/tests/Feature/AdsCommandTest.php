<?php

namespace Tests\Feature;

use App\Models\AdsCommand;
use App\Models\AdsSearchTerm;
use App\Support\AdsWatchdog;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdsCommandTest extends TestCase
{
    use RefreshDatabase;

    private CarbonImmutable $date;

    protected function setUp(): void
    {
        parent::setUp();

        // Komut uçları ingest ile aynı :ads kapsamını kullanır; blog token'ı geçmez.
        config(['services.admin_api.ads_token' => 'test-token']);
        config(['ads.commands.enabled' => true]);

        $this->date = CarbonImmutable::parse('2026-08-16');
    }

    // --- Token / kapsam ------------------------------------------------------

    public function test_get_without_token_is_unauthorized(): void
    {
        $this->getJson('/api/admin/ads/commands')
            ->assertStatus(401)
            ->assertExactJson(['message' => 'Unauthorized.']);
    }

    public function test_get_with_wrong_token_is_unauthorized(): void
    {
        $this->withToken('wrong-token')
            ->getJson('/api/admin/ads/commands')
            ->assertStatus(401);
    }

    public function test_blog_token_cannot_reach_command_endpoints(): void
    {
        config(['services.admin_api.token' => 'blog-token']);

        $this->withToken('blog-token')
            ->getJson('/api/admin/ads/commands')
            ->assertStatus(401);

        $this->withToken('blog-token')
            ->postJson('/api/admin/ads/commands/results', ['results' => []])
            ->assertStatus(401);
    }

    public function test_results_without_token_is_unauthorized(): void
    {
        $this->postJson('/api/admin/ads/commands/results', ['results' => []])
            ->assertStatus(401);
    }

    // --- GET: uygunluk filtresi ---------------------------------------------

    public function test_get_returns_only_ready_commands(): void
    {
        $autoPending = $this->makeCommand(['tier' => 'auto', 'status' => 'pending']);
        $approved = $this->makeCommand(['tier' => 'approval', 'status' => 'approved']);

        // Dönmemesi gerekenler:
        $this->makeCommand(['tier' => 'approval', 'status' => 'pending']);
        $this->makeCommand(['tier' => 'auto', 'status' => 'rejected']);
        $this->makeCommand(['tier' => 'auto', 'status' => 'applied']);
        $this->makeCommand(['tier' => 'auto', 'status' => 'failed']);

        $response = $this->withToken('test-token')
            ->getJson('/api/admin/ads/commands')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertEqualsCanonicalizing([$autoPending->id, $approved->id], $ids);
    }

    public function test_get_shapes_each_command(): void
    {
        $command = $this->makeCommand([
            'tier' => 'auto',
            'status' => 'pending',
            'kind' => 'add_negative_keyword',
            'campaign_name' => 'Stria | Search | Kaş & Kirpik',
            'ad_group_name' => null,
            'payload' => ['text' => 'kaş laminasyonu kaç para', 'match' => 'phrase'],
        ]);

        $this->withToken('test-token')
            ->getJson('/api/admin/ads/commands')
            ->assertOk()
            ->assertExactJson(['data' => [[
                'id' => $command->id,
                'kind' => 'add_negative_keyword',
                'campaign' => 'Stria | Search | Kaş & Kirpik',
                'ad_group' => null,
                'payload' => ['text' => 'kaş laminasyonu kaç para', 'match' => 'phrase'],
            ]]]);
    }

    public function test_get_applies_daily_limit_in_id_order(): void
    {
        $first = $this->makeCommand(['tier' => 'auto', 'status' => 'pending']);
        $second = $this->makeCommand(['tier' => 'auto', 'status' => 'pending']);
        $this->makeCommand(['tier' => 'auto', 'status' => 'pending']);

        config(['ads.commands.daily_apply_limit' => 2]);

        $response = $this->withToken('test-token')
            ->getJson('/api/admin/ads/commands')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id')->all();

        $this->assertSame([$first->id, $second->id], $ids);
    }

    public function test_get_returns_empty_when_disabled(): void
    {
        $this->makeCommand(['tier' => 'auto', 'status' => 'pending']);

        config(['ads.commands.enabled' => false]);

        $this->withToken('test-token')
            ->getJson('/api/admin/ads/commands')
            ->assertOk()
            ->assertExactJson(['data' => []]);
    }

    // --- tierFor -------------------------------------------------------------

    public function test_tier_for_budget_decrease_within_ceiling_is_auto(): void
    {
        config(['ads.commands.max_budget_change_pct' => 30]);

        // 175 → 130: %25.7 düşüş, tavan (%30) içinde.
        $this->assertSame('auto', AdsCommand::tierFor('set_budget', ['amount' => 130.00, 'previous' => 175.00]));
    }

    public function test_tier_for_budget_increase_is_approval(): void
    {
        config(['ads.commands.max_budget_change_pct' => 30]);

        // Artış: para artıran işlem → onay.
        $this->assertSame('approval', AdsCommand::tierFor('set_budget', ['amount' => 200.00, 'previous' => 175.00]));
    }

    public function test_tier_for_budget_decrease_over_ceiling_is_approval(): void
    {
        config(['ads.commands.max_budget_change_pct' => 30]);

        // 175 → 100: %42.8 düşüş, tavanı aşıyor → onay.
        $this->assertSame('approval', AdsCommand::tierFor('set_budget', ['amount' => 100.00, 'previous' => 175.00]));
    }

    public function test_tier_for_budget_without_previous_is_approval(): void
    {
        $this->assertSame('approval', AdsCommand::tierFor('set_budget', ['amount' => 100.00]));
        $this->assertSame('approval', AdsCommand::tierFor('set_budget', ['amount' => 100.00, 'previous' => 0]));
    }

    public function test_tier_for_approval_kinds(): void
    {
        foreach (['create_ad', 'create_keyword', 'pause_campaign', 'enable_campaign'] as $kind) {
            $this->assertSame('approval', AdsCommand::tierFor($kind, []), "{$kind} onay istemeli");
        }
    }

    public function test_tier_for_auto_kinds(): void
    {
        $this->assertSame('auto', AdsCommand::tierFor('add_negative_keyword', ['text' => 'x', 'match' => 'phrase']));
        $this->assertSame('auto', AdsCommand::tierFor('pause_keyword', ['text' => 'x', 'match' => 'phrase']));
    }

    public function test_hash_is_stable_regardless_of_payload_key_order(): void
    {
        $a = AdsCommand::hashFor('add_negative_keyword', 'A', null, ['text' => 'x', 'match' => 'phrase']);
        $b = AdsCommand::hashFor('add_negative_keyword', 'A', null, ['match' => 'phrase', 'text' => 'x']);

        $this->assertSame($a, $b);
    }

    // --- POST results --------------------------------------------------------

    public function test_results_ok_true_marks_applied(): void
    {
        $command = $this->makeCommand(['tier' => 'auto', 'status' => 'pending']);

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/commands/results', [
                'results' => [['id' => $command->id, 'ok' => true, 'result' => 'negatif eklendi']],
            ])
            ->assertOk()
            ->assertExactJson(['data' => ['applied' => 1, 'failed' => 0, 'skipped' => 0]]);

        $command->refresh();
        $this->assertSame('applied', $command->status);
        $this->assertNotNull($command->applied_at);
        $this->assertSame('negatif eklendi', $command->result);
    }

    public function test_results_ok_false_marks_failed(): void
    {
        $command = $this->makeCommand(['tier' => 'auto', 'status' => 'pending']);

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/commands/results', [
                'results' => [['id' => $command->id, 'ok' => false, 'error' => 'kampanya bulunamadı']],
            ])
            ->assertOk()
            ->assertExactJson(['data' => ['applied' => 0, 'failed' => 1, 'skipped' => 0]]);

        $command->refresh();
        $this->assertSame('failed', $command->status);
        $this->assertSame('kampanya bulunamadı', $command->error);
        $this->assertNull($command->applied_at);
    }

    public function test_results_unknown_id_is_counted_as_skipped(): void
    {
        $this->withToken('test-token')
            ->postJson('/api/admin/ads/commands/results', [
                'results' => [['id' => 999999, 'ok' => true, 'result' => 'yok']],
            ])
            ->assertOk()
            ->assertExactJson(['data' => ['applied' => 0, 'failed' => 0, 'skipped' => 1]]);
    }

    public function test_results_are_idempotent_when_sent_twice(): void
    {
        $command = $this->makeCommand(['tier' => 'auto', 'status' => 'pending']);

        $body = ['results' => [['id' => $command->id, 'ok' => true, 'result' => 'negatif eklendi']]];

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/commands/results', $body)
            ->assertOk();

        $command->refresh();
        $firstAppliedAt = $command->applied_at;

        // İkinci kez aynı sonucu göndermek çakışmamalı; applied_at ezilmemeli.
        $this->withToken('test-token')
            ->postJson('/api/admin/ads/commands/results', $body)
            ->assertOk()
            ->assertExactJson(['data' => ['applied' => 1, 'failed' => 0, 'skipped' => 0]]);

        $command->refresh();
        $this->assertSame('applied', $command->status);
        $this->assertEquals($firstAppliedAt, $command->applied_at);
    }

    public function test_results_requires_present_array(): void
    {
        $this->withToken('test-token')
            ->postJson('/api/admin/ads/commands/results', [])
            ->assertStatus(422);

        $this->withToken('test-token')
            ->postJson('/api/admin/ads/commands/results', [
                'results' => [['ok' => true]],
            ])
            ->assertStatus(422);
    }

    // --- Planner (watchdog entegrasyonu) ------------------------------------

    public function test_planner_produces_command_from_negative_candidate(): void
    {
        $this->seedNegativeCandidateTerms();

        app(AdsWatchdog::class)->evaluate($this->date);

        $commands = AdsCommand::query()->where('kind', 'add_negative_keyword')->get();

        $this->assertGreaterThan(0, $commands->count());

        $command = $commands->first();
        $this->assertSame('auto', $command->tier);
        $this->assertSame('pending', $command->status);
        $this->assertSame('watchdog', $command->source);
        $this->assertSame('phrase', $command->payload['match']);
        $this->assertNotEmpty($command->reason);
        // Gerekçe sayılarla: pencere + tıklama + harcama.
        $this->assertStringContainsString('14 günde', $command->reason);
    }

    public function test_second_evaluate_does_not_duplicate_commands(): void
    {
        $this->seedNegativeCandidateTerms();

        app(AdsWatchdog::class)->evaluate($this->date);
        $firstCount = AdsCommand::query()->where('kind', 'add_negative_keyword')->count();

        app(AdsWatchdog::class)->evaluate($this->date);
        $secondCount = AdsCommand::query()->where('kind', 'add_negative_keyword')->count();

        $this->assertGreaterThan(0, $firstCount);
        $this->assertSame($firstCount, $secondCount);
    }

    public function test_rejected_command_is_not_regenerated(): void
    {
        $this->seedNegativeCandidateTerms();

        app(AdsWatchdog::class)->evaluate($this->date);

        // Owner hepsini reddetti.
        AdsCommand::query()->where('kind', 'add_negative_keyword')->update(['status' => 'rejected']);
        $rejectedCount = AdsCommand::query()->where('kind', 'add_negative_keyword')->count();

        // Yeniden değerlendirme ısrar etmemeli.
        app(AdsWatchdog::class)->evaluate($this->date);

        $this->assertSame(
            $rejectedCount,
            AdsCommand::query()->where('kind', 'add_negative_keyword')->count(),
        );
        $this->assertSame(
            $rejectedCount,
            AdsCommand::query()->where('kind', 'add_negative_keyword')->where('status', 'rejected')->count(),
        );
    }

    /**
     * negative_candidate kuralını tetikleyecek arama terimleri: 14 gün
     * penceresinde >=5 tıklama, 0 dönüşüm, >=50 ₺ harcama.
     */
    private function seedNegativeCandidateTerms(): void
    {
        foreach (range(1, 3) as $i) {
            AdsSearchTerm::query()->create([
                'date' => $this->date->toDateString(),
                'campaign_name' => 'Stria | Search | Kaş & Kirpik',
                'ad_group_name' => 'Kaş Laminasyon',
                'search_term' => "boşa harcanan terim {$i}",
                'term_hash' => hash('sha256', "boşa harcanan terim {$i}"),
                'cost' => 50 + $i * 10,
                'impressions' => 100,
                'clicks' => 6,
                'conversions' => 0,
            ]);
        }
    }

    /**
     * @param  array<string, mixed>  $attrs
     */
    private function makeCommand(array $attrs = []): AdsCommand
    {
        return AdsCommand::query()->create(array_merge([
            'kind' => 'add_negative_keyword',
            'tier' => 'auto',
            'status' => 'pending',
            'campaign_name' => null,
            'ad_group_name' => null,
            'payload' => ['text' => 'x', 'match' => 'phrase'],
            'reason' => 'test gerekçesi',
            'command_hash' => hash('sha256', uniqid('cmd', true)),
            'source' => 'agent',
        ], $attrs));
    }
}
