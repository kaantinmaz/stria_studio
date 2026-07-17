<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Customer;
use App\Models\Service;
use App\Support\CustomerMerge;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class CustomerMergeTest extends TestCase
{
    use RefreshDatabase;

    public function test_merge_moves_appointments_photos_and_app_link_then_deletes_source(): void
    {
        $appUser = AppUser::query()->create([
            'name' => 'Mobil Kullanıcı',
            'email' => 'mobil@example.com',
            'password' => 'password123',
            'phone' => '0555 000 00 00',
        ]);

        $source = Customer::query()->create([
            'name' => 'Kaynak Müşteri',
            'phone' => '0555 111 11 11',
            'notes' => 'kaynak not',
            'photos' => ['a.jpg', 'b.jpg'],
            'app_user_id' => $appUser->id,
        ]);
        $target = Customer::query()->create([
            'name' => 'Hedef Müşteri',
            'email' => 'hedef@example.com',
            'photos' => ['c.jpg'],
            'notes' => 'hedef not',
        ]);

        $service = Service::factory()->create();
        $appointment = Appointment::query()->create([
            'customer_id' => $source->id,
            'service_id' => $service->id,
            'starts_at' => '2026-07-20 10:00:00',
            'status' => 'confirmed',
        ]);

        (new CustomerMerge)->merge($source, $target);

        $this->assertDatabaseMissing('customers', ['id' => $source->id]);

        $target->refresh();
        $this->assertSame($appUser->id, $target->app_user_id);
        $this->assertSame(['c.jpg', 'a.jpg', 'b.jpg'], $target->photos);
        $this->assertSame('0555 111 11 11', $target->phone);
        $this->assertSame('hedef@example.com', $target->email);
        $this->assertSame("hedef not\nkaynak not", $target->notes);

        $this->assertSame($target->id, $appointment->fresh()->customer_id);
    }

    public function test_merge_throws_when_both_customers_have_an_app_user(): void
    {
        $first = AppUser::query()->create([
            'name' => 'Bir',
            'email' => 'bir@example.com',
            'password' => 'password123',
        ]);
        $second = AppUser::query()->create([
            'name' => 'İki',
            'email' => 'iki@example.com',
            'password' => 'password123',
        ]);

        $source = Customer::query()->create([
            'name' => 'Kaynak',
            'app_user_id' => $first->id,
        ]);
        $target = Customer::query()->create([
            'name' => 'Hedef',
            'app_user_id' => $second->id,
        ]);

        $this->expectException(InvalidArgumentException::class);

        try {
            (new CustomerMerge)->merge($source, $target);
        } finally {
            $this->assertDatabaseHas('customers', ['id' => $source->id]);
            $this->assertDatabaseHas('customers', ['id' => $target->id]);
        }
    }
}
