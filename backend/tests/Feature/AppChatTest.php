<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AppChatTest extends TestCase
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

    public function test_chat_returns_reply(): void
    {
        Http::fake([
            'https://api.anthropic.com/v1/messages' => Http::response([
                'content' => [
                    ['type' => 'text', 'text' => 'Merhaba, size nasıl yardımcı olabilirim?'],
                ],
            ]),
        ]);

        $this->actingAsAppUser()
            ->postJson('/api/app/chat', [
                'messages' => [
                    ['role' => 'user', 'content' => 'Randevularım neler?'],
                ],
            ])
            ->assertOk()
            ->assertExactJson([
                'data' => ['reply' => 'Merhaba, size nasıl yardımcı olabilirim?'],
            ]);
    }

    public function test_system_prompt_contains_only_the_authenticated_users_data(): void
    {
        Http::fake([
            'https://api.anthropic.com/v1/messages' => Http::response([
                'content' => [['type' => 'text', 'text' => 'Tamam.']],
            ]),
        ]);

        $mine = Service::factory()->create(['name_tr' => 'Kaş Tasarımı']);
        $theirs = Service::factory()->create(['name_tr' => 'Dudak Renklendirme']);

        $user = AppUser::query()->create([
            'name' => 'Ayşe Yılmaz',
            'email' => 'ayse@example.com',
            'password' => 'password123',
        ]);
        $other = AppUser::query()->create([
            'name' => 'Zeynep Demir',
            'email' => 'zeynep@example.com',
            'password' => 'password123',
        ]);

        Appointment::query()->create([
            'app_user_id' => $user->id,
            'service_id' => $mine->id,
            'starts_at' => '2026-08-01 10:00:00',
            'status' => 'confirmed',
        ]);
        Appointment::query()->create([
            'app_user_id' => $other->id,
            'service_id' => $theirs->id,
            'starts_at' => '2026-08-02 11:00:00',
            'status' => 'confirmed',
        ]);

        $this->actingAsAppUser($user)
            ->postJson('/api/app/chat', [
                'messages' => [
                    ['role' => 'user', 'content' => 'Randevularım neler?'],
                ],
            ])
            ->assertOk();

        Http::assertSent(function (Request $request): bool {
            $system = $request['system'];

            // Own name + own appointment (date/time is unique per record); the
            // other user's name and appointment must never leak into the prompt.
            // Service names live in the shared site catalog, so we key on the
            // appointment timestamp instead.
            return str_contains($system, 'Ayşe Yılmaz')
                && str_contains($system, '01.08.2026 10:00 — Kaş Tasarımı — Onaylandı')
                && ! str_contains($system, 'Zeynep Demir')
                && ! str_contains($system, '02.08.2026 11:00');
        });
    }

    public function test_chat_requires_authentication(): void
    {
        $this->postJson('/api/app/chat', [
            'messages' => [
                ['role' => 'user', 'content' => 'Merhaba'],
            ],
        ])->assertUnauthorized();
    }

    public function test_last_message_must_be_from_user(): void
    {
        $this->actingAsAppUser()
            ->postJson('/api/app/chat', [
                'messages' => [
                    ['role' => 'user', 'content' => 'Merhaba'],
                    ['role' => 'assistant', 'content' => 'Size nasıl yardımcı olabilirim?'],
                ],
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('messages');
    }

    public function test_upstream_failure_returns_bad_gateway(): void
    {
        Http::fake([
            'https://api.anthropic.com/v1/messages' => Http::response(['error' => 'boom'], 500),
        ]);

        $this->actingAsAppUser()
            ->postJson('/api/app/chat', [
                'messages' => [
                    ['role' => 'user', 'content' => 'Randevularım neler?'],
                ],
            ])
            ->assertStatus(502)
            ->assertExactJson(['message' => 'assistant_unavailable']);
    }

    private function appUser(): AppUser
    {
        return AppUser::query()->create([
            'name' => 'Mobil Kullanıcı',
            'email' => 'mobil@example.com',
            'password' => 'password123',
            'phone' => '0555 000 00 00',
        ]);
    }

    private function actingAsAppUser(?AppUser $user = null): static
    {
        $user ??= $this->appUser();

        return $this->withToken($user->createToken('test-device')->plainTextToken);
    }
}
