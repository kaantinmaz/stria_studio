<?php

namespace Tests\Feature;

use App\Models\ChatConversation;
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

    public function test_conversation_transcript_is_stored_and_appended_per_session(): void
    {
        config([
            'services.anthropic.key' => 'test-anthropic-key',
            'services.anthropic.model' => 'test-model',
        ]);

        Http::fakeSequence('api.anthropic.com/*')
            ->push(['content' => [['type' => 'text', 'text' => 'İlk yanıt']]])
            ->push(['content' => [['type' => 'text', 'text' => 'İkinci yanıt']]]);

        $session = 'session-abcdef123456';

        $this->postJson('/api/chat', [
            'session_id' => $session,
            'messages' => [
                ['role' => 'assistant', 'content' => 'Merhaba!'],
                ['role' => 'user', 'content' => 'Mikroblading acır mı?'],
            ],
        ])->assertOk();

        $conversation = ChatConversation::query()->sole();

        $this->assertSame('web', $conversation->source);
        $this->assertNull($conversation->site);
        $this->assertSame(3, $conversation->message_count);
        $this->assertNull($conversation->summarized_at);
        $this->assertSame('Mikroblading acır mı?', $conversation->firstUserMessage());

        // İstemci pencereyi yeniden gönderir; döküm tekrar etmeden büyümeli.
        $this->postJson('/api/chat', [
            'session_id' => $session,
            'messages' => [
                ['role' => 'assistant', 'content' => 'Merhaba!'],
                ['role' => 'user', 'content' => 'Mikroblading acır mı?'],
                ['role' => 'assistant', 'content' => 'İlk yanıt'],
                ['role' => 'user', 'content' => 'Randevu alabilir miyim?'],
            ],
        ])->assertOk();

        $this->assertSame(1, ChatConversation::query()->count());

        $conversation->refresh();

        $this->assertSame(5, $conversation->message_count);
        $this->assertSame(
            ['Merhaba!', 'Mikroblading acır mı?', 'İlk yanıt', 'Randevu alabilir miyim?', 'İkinci yanıt'],
            array_column($conversation->messages, 'content'),
        );
    }

    public function test_engage_conversations_are_recorded_with_their_source_and_site(): void
    {
        config([
            'services.anthropic.key' => 'test-anthropic-key',
            'services.anthropic.model' => 'test-model',
        ]);

        Http::fake([
            'https://api.anthropic.com/v1/messages' => Http::response([
                'content' => [['type' => 'text', 'text' => 'Elbette yardımcı olurum.']],
            ]),
        ]);

        $this->postJson('/api/chat', [
            'site' => 'kas-tasarimi-ankara',
            'intent' => 'engage',
            'session_id' => 'engage-abcdef123456',
            'messages' => [
                ['role' => 'user', 'content' => 'Kaşlarım seyrek, ne önerirsiniz?'],
            ],
        ])->assertOk();

        $conversation = ChatConversation::query()->sole();

        $this->assertSame('engage', $conversation->source);
        $this->assertSame('kas-tasarimi-ankara', $conversation->site);
    }

    public function test_failed_upstream_call_stores_nothing(): void
    {
        config(['services.anthropic.key' => 'test-anthropic-key']);

        Http::fake(['https://api.anthropic.com/v1/messages' => Http::response([], 500)]);

        $this->postJson('/api/chat', [
            'session_id' => 'session-abcdef123456',
            'messages' => [['role' => 'user', 'content' => 'Merhaba']],
        ])->assertStatus(502);

        $this->assertSame(0, ChatConversation::query()->count());
    }

    public function test_invalid_session_id_is_rejected(): void
    {
        $this->postJson('/api/chat', [
            'session_id' => 'kısa',
            'messages' => [['role' => 'user', 'content' => 'Merhaba']],
        ])->assertStatus(422)->assertJsonValidationErrors('session_id');
    }

    public function test_empty_messages_are_rejected(): void
    {
        Http::fake();

        $this->postJson('/api/chat', ['messages' => []])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('messages');

        Http::assertNothingSent();
    }

    public function test_engage_intent_is_accepted_and_other_values_are_rejected(): void
    {
        Http::fake([
            'https://api.anthropic.com/v1/messages' => Http::response([
                'content' => [
                    ['type' => 'text', 'text' => 'Endişenizi anlıyorum.'],
                ],
            ]),
        ]);

        $messages = [
            ['role' => 'user', 'content' => 'Kalıcı makyaj konusunda biraz endişeliyim.'],
        ];

        $this->postJson('/api/chat', [
            'intent' => 'engage',
            'messages' => $messages,
        ])->assertOk();

        Http::assertSent(fn (Request $request): bool => str_contains(
            $request['system'],
            'Bu konuşma sitedeki mini etkileşim panelinden geliyor.'
        ));

        $this->postJson('/api/chat', [
            'intent' => 'other',
            'messages' => $messages,
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('intent');

        Http::assertSentCount(1);
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
