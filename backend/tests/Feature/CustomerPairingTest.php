<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Customer;
use App\Models\Service;
use App\Support\CustomerPairing;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerPairingTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    public function test_pairing_creates_logged_in_account_and_carries_existing_appointments(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $service = Service::factory()->create(['slug' => 'microblading', 'is_active' => true]);
        $customer = Customer::query()->create([
            'name' => 'Panelden Eklenen Müşteri',
            'phone' => '0555 111 22 33',
        ]);
        $appointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-07-20 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);

        $token = app(CustomerPairing::class)->token($customer);

        $response = $this->postJson('/api/app/pair', ['token' => $token]);

        $response
            ->assertCreated()
            ->assertJsonPath('data.user.name', 'Panelden Eklenen Müşteri')
            ->assertJsonPath('data.user.phone', '0555 111 22 33')
            ->assertJsonPath('data.user.email', null)
            ->assertJsonPath('data.user.customer_linked', true);

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'app_user_id' => $response->json('data.user.id'),
        ]);

        // Randevu müşteriye bağlı olduğu için eşleşme anında hesapta görünmeli.
        $this->withToken($response->json('data.token'))
            ->getJson('/api/app/appointments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $appointment->id)
            ->assertJsonPath('data.0.service_name', $service->name_tr);
    }

    public function test_pairing_rejects_expired_token(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $customer = Customer::query()->create(['name' => 'Süresi Geçen']);
        $token = app(CustomerPairing::class)->token($customer);

        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-07-17 09:00:00')->addMinutes(CustomerPairing::TTL_MINUTES + 1));

        $this->postJson('/api/app/pair', ['token' => $token])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('token');

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'app_user_id' => null,
        ]);
    }

    public function test_pairing_rejects_tampered_token(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $customer = Customer::query()->create(['name' => 'İmza Testi']);
        $other = Customer::query()->create(['name' => 'Başka Müşteri']);
        $token = app(CustomerPairing::class)->token($customer);

        [, $expiresAt, $signature] = explode('.', $token);

        $this->postJson('/api/app/pair', ['token' => $other->id.'.'.$expiresAt.'.'.$signature])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('token');

        $this->postJson('/api/app/pair', ['token' => 'bozuk-kod'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('token');
    }

    public function test_pairing_token_is_single_use_because_customer_gets_linked(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $customer = Customer::query()->create(['name' => 'Tek Kullanım']);
        $token = app(CustomerPairing::class)->token($customer);

        $this->postJson('/api/app/pair', ['token' => $token])->assertCreated();

        $this->postJson('/api/app/pair', ['token' => $token])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('token');

        $this->assertSame(1, AppUser::query()->count());
    }

    public function test_paired_account_can_set_credentials_and_then_log_in(): void
    {
        CarbonImmutable::setTestNow('2026-07-17 09:00:00');
        $customer = Customer::query()->create(['name' => 'Şifre Belirleyen']);
        $token = app(CustomerPairing::class)->token($customer);
        $session = $this->postJson('/api/app/pair', ['token' => $token])->json('data');

        $this->withToken($session['token'])
            ->postJson('/api/app/credentials', [
                'email' => 'YENI@Example.com',
                'password' => 'password123',
            ])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'yeni@example.com');

        $this->postJson('/api/app/login', [
            'email' => 'yeni@example.com',
            'password' => 'password123',
        ])->assertOk();
    }

    public function test_credentials_change_requires_the_current_password(): void
    {
        $user = AppUser::query()->create([
            'name' => 'Şifresi Olan',
            'email' => 'var@example.com',
            'password' => 'password123',
        ]);
        $token = $user->createToken('test-device')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/app/credentials', [
                'email' => 'baska@example.com',
                'password' => 'password456',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->withToken($token)
            ->postJson('/api/app/credentials', [
                'email' => 'baska@example.com',
                'password' => 'password456',
                'current_password' => 'yanlis-sifre',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('current_password');

        $this->assertDatabaseHas('app_users', [
            'id' => $user->id,
            'email' => 'var@example.com',
        ]);

        $this->withToken($token)
            ->postJson('/api/app/credentials', [
                'email' => 'Baska@Example.com',
                'password' => 'password456',
                'current_password' => 'password123',
            ])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'baska@example.com');

        $this->postJson('/api/app/login', [
            'email' => 'baska@example.com',
            'password' => 'password456',
        ])->assertOk();
    }

    public function test_credentials_change_can_keep_the_existing_password(): void
    {
        $user = AppUser::query()->create([
            'name' => 'Sadece E-posta',
            'email' => 'eski@example.com',
            'password' => 'password123',
        ]);

        $this->withToken($user->createToken('test-device')->plainTextToken)
            ->postJson('/api/app/credentials', [
                'email' => 'yeni@example.com',
                'current_password' => 'password123',
            ])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'yeni@example.com');

        $this->postJson('/api/app/login', [
            'email' => 'yeni@example.com',
            'password' => 'password123',
        ])->assertOk();
    }

    public function test_credentials_endpoint_rejects_email_already_used_by_another_account(): void
    {
        AppUser::query()->create([
            'name' => 'Mevcut',
            'email' => 'dolu@example.com',
            'password' => 'password123',
        ]);
        $customer = Customer::query()->create(['name' => 'Çakışan']);
        $session = $this->postJson('/api/app/pair', [
            'token' => app(CustomerPairing::class)->token($customer),
        ])->json('data');

        $this->withToken($session['token'])
            ->postJson('/api/app/credentials', [
                'email' => 'dolu@example.com',
                'password' => 'password123',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_pairing_refuses_customer_that_is_already_linked(): void
    {
        $user = AppUser::query()->create([
            'name' => 'Bağlı Kullanıcı',
            'email' => 'bagli@example.com',
            'password' => 'password123',
        ]);
        $customer = Customer::query()->create([
            'name' => 'Zaten Bağlı',
            'app_user_id' => $user->id,
        ]);

        $this->postJson('/api/app/pair', [
            'token' => app(CustomerPairing::class)->token($customer),
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('token');
    }
}
