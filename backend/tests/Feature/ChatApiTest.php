<?php

namespace Tests\Feature;

use App\Models\Service;
use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ChatApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_chat_returns_reply_and_sends_site_context_to_anthropic(): void
    {
        config([
            'services.anthropic.key' => 'test-anthropic-key',
            'services.anthropic.model' => 'test-model',
        ]);

        Setting::forSite()->update([
            'phone' => '+90 507 000 00 00',
            'whatsapp' => 'https://wa.me/905070000000',
            'address' => 'Çankaya, Ankara',
            'hours' => [['days' => ['Monday'], 'open' => '10:00', 'close' => '19:00']],
        ]);
        Service::factory()->create([
            'name_tr' => 'Mikroblading',
            'desc_tr' => 'Doğal kıl görünümü sağlayan uygulama.',
            'intro_tr' => 'Kaş yapısına göre kişiye özel planlanır.',
        ]);

        Http::fake([
            'https://api.anthropic.com/v1/messages' => Http::response([
                'content' => [
                    ['type' => 'text', 'text' => 'Size nasıl yardımcı olabilirim?'],
                ],
            ]),
        ]);

        $this->postJson('/api/chat', [
            'messages' => [
                ['role' => 'user', 'content' => 'Mikroblading hakkında bilgi verir misin?'],
            ],
        ])
            ->assertOk()
            ->assertExactJson([
                'data' => ['reply' => 'Size nasıl yardımcı olabilirim?'],
            ]);

        Http::assertSent(function (Request $request): bool {
            $system = $request['system'];

            return $request->url() === 'https://api.anthropic.com/v1/messages'
                && $request->hasHeader('x-api-key', 'test-anthropic-key')
                && $request->hasHeader('anthropic-version', '2023-06-01')
                && $request['model'] === 'test-model'
                && $request['max_tokens'] === 400
                && str_contains($system, 'FİYAT SORULARINA ASLA rakam/aralık verme')
                && str_contains($system, 'fiyat bilgisi kişiye özel değerlendirmeyle netleşir')
                && str_contains($system, 'WhatsApp linkine yönlendir')
                && str_contains($system, 'https://wa.me/905070000000');
        });
    }

    public function test_empty_messages_are_rejected(): void
    {
        Http::fake();

        $this->postJson('/api/chat', ['messages' => []])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('messages');

        Http::assertNothingSent();
    }

    public function test_last_message_must_be_from_user(): void
    {
        Http::fake();

        $this->postJson('/api/chat', [
            'messages' => [
                ['role' => 'user', 'content' => 'Merhaba'],
                ['role' => 'assistant', 'content' => 'Merhaba!'],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('messages');

        Http::assertNothingSent();
    }

    public function test_message_content_cannot_exceed_1000_characters(): void
    {
        Http::fake();

        $this->postJson('/api/chat', [
            'messages' => [
                ['role' => 'user', 'content' => str_repeat('a', 1001)],
            ],
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('messages.0.content');

        Http::assertNothingSent();
    }

    public function test_unknown_site_returns_not_found(): void
    {
        Http::fake();

        $this->postJson('/api/chat', [
            'site' => 'unknown-site',
            'messages' => [
                ['role' => 'user', 'content' => 'Merhaba'],
            ],
        ])->assertNotFound();

        Http::assertNothingSent();
    }

    public function test_upstream_failure_returns_bad_gateway(): void
    {
        Http::fake([
            'https://api.anthropic.com/v1/messages' => Http::response([], 500),
        ]);

        $this->postJson('/api/chat', [
            'messages' => [
                ['role' => 'user', 'content' => 'Merhaba'],
            ],
        ])
            ->assertStatus(502)
            ->assertExactJson(['message' => 'assistant_unavailable']);
    }
}
