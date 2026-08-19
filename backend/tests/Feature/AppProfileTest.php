<?php

namespace Tests\Feature;

use App\Models\AppUser;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AppProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_updates_name_and_phone_and_the_studio_record_follows(): void
    {
        [$user, $customer] = $this->linkedAccount();

        $this->withToken($user->createToken('test-device')->plainTextToken)
            ->postJson('/api/app/profile', [
                'name' => '  Ayşe Yılmaz  ',
                'phone' => ' 0555 222 33 44 ',
            ])
            ->assertOk()
            ->assertJsonPath('data.user.name', 'Ayşe Yılmaz')
            ->assertJsonPath('data.user.phone', '0555 222 33 44');

        $this->assertDatabaseHas('app_users', [
            'id' => $user->id,
            'name' => 'Ayşe Yılmaz',
            'phone' => '0555 222 33 44',
        ]);
        // Panelde eski ad kalmasın.
        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Ayşe Yılmaz',
            'phone' => '0555 222 33 44',
        ]);
    }

    public function test_profile_update_keeps_studio_owned_fields(): void
    {
        [$user, $customer] = $this->linkedAccount();
        $customer->update([
            'instagram' => '@stria',
            'notes' => 'Kahve sevmiyor.',
        ]);

        $this->withToken($user->createToken('test-device')->plainTextToken)
            ->postJson('/api/app/profile', ['name' => 'Yeni Ad'])
            ->assertOk();

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'name' => 'Yeni Ad',
            'instagram' => '@stria',
            'notes' => 'Kahve sevmiyor.',
        ]);
    }

    public function test_blank_phone_clears_the_number(): void
    {
        [$user, $customer] = $this->linkedAccount();

        $this->withToken($user->createToken('test-device')->plainTextToken)
            ->postJson('/api/app/profile', ['name' => 'Telefonsuz', 'phone' => '   '])
            ->assertOk()
            ->assertJsonPath('data.user.phone', null);

        $this->assertDatabaseHas('app_users', ['id' => $user->id, 'phone' => null]);
        $this->assertDatabaseHas('customers', ['id' => $customer->id, 'phone' => null]);
    }

    public function test_profile_rejects_missing_name_and_overlong_values(): void
    {
        [$user] = $this->linkedAccount();
        $token = $user->createToken('test-device')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/app/profile', ['name' => ''])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');

        $this->withToken($token)
            ->postJson('/api/app/profile', ['name' => str_repeat('a', 121)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');

        $this->withToken($token)
            ->postJson('/api/app/profile', ['name' => 'Geçerli', 'phone' => str_repeat('1', 41)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('phone');

        $this->assertDatabaseHas('app_users', ['id' => $user->id, 'name' => 'Eski Ad']);
    }

    public function test_profile_requires_authentication(): void
    {
        $this->postJson('/api/app/profile', ['name' => 'Kimliksiz'])->assertUnauthorized();
    }

    public function test_email_change_is_mirrored_to_the_studio_record(): void
    {
        [$user, $customer] = $this->linkedAccount();

        $this->withToken($user->createToken('test-device')->plainTextToken)
            ->postJson('/api/app/credentials', [
                'email' => 'yeni@example.com',
                'current_password' => 'password123',
            ])
            ->assertOk();

        $this->assertDatabaseHas('customers', [
            'id' => $customer->id,
            'email' => 'yeni@example.com',
        ]);
    }

    public function test_turkish_capital_i_does_not_corrupt_the_email(): void
    {
        [$user] = $this->linkedAccount();

        $this->withToken($user->createToken('test-device')->plainTextToken)
            ->postJson('/api/app/credentials', [
                'email' => 'İkinci@Example.com',
                'current_password' => 'password123',
            ])
            ->assertOk()
            // Str::lower "İ" harfini "i + birleşen nokta"ya çevirip adresi bozuyordu.
            ->assertJsonPath('data.user.email', 'İkinci@example.com');

        $this->assertDatabaseHas('app_users', [
            'id' => $user->id,
            'email' => 'İkinci@example.com',
        ]);
    }

    /**
     * @return array{0: AppUser, 1: Customer}
     */
    private function linkedAccount(): array
    {
        $user = AppUser::query()->create([
            'name' => 'Eski Ad',
            'email' => 'eski@example.com',
            'password' => 'password123',
            'phone' => '0555 111 11 11',
        ]);
        $customer = Customer::query()->create([
            'name' => 'Eski Ad',
            'phone' => '0555 111 11 11',
            'app_user_id' => $user->id,
        ]);

        return [$user, $customer];
    }
}
