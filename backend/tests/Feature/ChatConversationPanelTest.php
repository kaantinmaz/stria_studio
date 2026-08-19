<?php

namespace Tests\Feature;

use App\Filament\Resources\ChatConversations\Pages\ListChatConversations;
use App\Models\ChatConversation;
use App\Models\User;
use Filament\Actions\Testing\TestAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Livewire\Livewire;
use Tests\TestCase;

class ChatConversationPanelTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'services.anthropic.key' => 'test-anthropic-key',
            'services.anthropic.model' => 'test-model',
        ]);
    }

    public function test_summarize_command_only_touches_idle_unsummarized_conversations(): void
    {
        $idle = $this->conversation(['last_message_at' => now()->subHour()]);
        $fresh = $this->conversation(['last_message_at' => now()->subMinute()]);
        $done = $this->conversation([
            'last_message_at' => now()->subHour(),
            'summary' => 'Eski özet',
            'summarized_at' => now()->subMinutes(30),
        ]);

        $this->fakeSummary('Ziyaretçi mikroblading soruyor. Aşama: ilgili');

        $this->artisan('chat:summarize')->assertSuccessful();

        Http::assertSentCount(1);

        $this->assertSame('Ziyaretçi mikroblading soruyor. Aşama: ilgili', $idle->refresh()->summary);
        $this->assertNotNull($idle->summarized_at);
        $this->assertNull($fresh->refresh()->summary);
        $this->assertSame('Eski özet', $done->refresh()->summary);
    }

    public function test_upstream_failure_leaves_conversation_unsummarized(): void
    {
        $conversation = $this->conversation(['last_message_at' => now()->subHour()]);

        Http::fake(['https://api.anthropic.com/v1/messages' => Http::response([], 500)]);

        $this->artisan('chat:summarize')->assertFailed();

        $this->assertNull($conversation->refresh()->summary);
        $this->assertNull($conversation->summarized_at);
    }

    public function test_panel_lists_conversations_and_summarize_action_fills_the_summary(): void
    {
        $conversation = $this->conversation([
            'summary' => null,
            'last_message_at' => now()->subHour(),
        ]);

        $this->fakeSummary('Kaş laminasyonu merak ediyor. Aşama: bilgi almak istiyor');

        $this->actingAs(User::factory()->create());
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        Livewire::test(ListChatConversations::class)
            ->assertCanSeeTableRecords([$conversation])
            ->callAction(TestAction::make('summarize')->table($conversation));


        $this->assertSame(
            'Kaş laminasyonu merak ediyor. Aşama: bilgi almak istiyor',
            $conversation->refresh()->summary,
        );

        // Döküm modali hatasız açılır (içerik gözle de doğrulandı).
        Livewire::test(ListChatConversations::class)
            ->mountAction(TestAction::make('view')->table($conversation))
            ->assertActionMounted(TestAction::make('view')->table($conversation));
    }

    public function test_transcript_renders_both_roles(): void
    {
        $conversation = $this->conversation();

        $this->assertSame(
            "Ziyaretçi: Mikroblading acır mı?\n\nAsistan: Anestezi kremi ile rahat geçer.",
            $conversation->transcript(),
        );
    }

    private function conversation(array $attributes = []): ChatConversation
    {
        return ChatConversation::query()->create([
            'session_id' => 'session-'.fake()->unique()->numerify('############'),
            'source' => 'web',
            'messages' => [
                ['role' => 'user', 'content' => 'Mikroblading acır mı?'],
                ['role' => 'assistant', 'content' => 'Anestezi kremi ile rahat geçer.'],
            ],
            'message_count' => 2,
            'last_message_at' => now(),
            ...$attributes,
        ]);
    }

    private function fakeSummary(string $summary): void
    {
        Http::fake([
            'https://api.anthropic.com/v1/messages' => Http::response([
                'content' => [['type' => 'text', 'text' => $summary]],
            ]),
        ]);
    }
}
