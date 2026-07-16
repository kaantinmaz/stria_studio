<?php

namespace Tests\Feature;

use App\Filament\Pages\Calendar;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class CustomerAppointmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_and_appointment_schema_relationship_and_null_on_delete(): void
    {
        $this->assertTrue(Schema::hasColumns('customers', [
            'name',
            'phone',
            'email',
            'instagram',
            'notes',
            'photos',
            'created_at',
            'updated_at',
        ]));
        $this->assertTrue(Schema::hasColumns('appointments', [
            'customer_id',
            'service_id',
            'starts_at',
            'duration_min',
            'price',
            'is_paid',
            'payment_method',
            'note',
            'created_at',
            'updated_at',
        ]));

        $customer = Customer::query()->create([
            'name' => 'Ayşe Kaya',
            'phone' => '0555 000 00 00',
        ]);
        $appointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-07-20 10:00:00',
            'price' => '1250.50',
            'is_paid' => true,
            'payment_method' => 'kart',
        ]);
        $appointment->refresh();

        $this->assertTrue($appointment->customer->is($customer));
        $this->assertTrue($customer->appointments()->first()->is($appointment));
        $this->assertSame(60, $appointment->duration_min);
        $this->assertSame('1250.50', $appointment->price);
        $this->assertTrue($appointment->is_paid);
        $this->assertSame('kart', $appointment->payment_method);

        $customer->delete();

        $this->assertNull($appointment->refresh()->customer_id);
        $this->assertNull($appointment->customer);
    }

    public function test_customer_photos_are_persisted_as_an_array_and_nullable(): void
    {
        $photos = [
            'customers/before-1.jpg',
            'customers/after-1.jpg',
            'customers/after-2.jpg',
        ];

        $customer = Customer::query()->create([
            'name' => 'Fotoğraflı Müşteri',
            'photos' => $photos,
        ]);

        $this->assertSame($photos, $customer->refresh()->photos);

        $customerWithoutPhotos = Customer::query()->create([
            'name' => 'Fotoğrafsız Müşteri',
            'photos' => null,
        ]);

        $this->assertNull($customerWithoutPhotos->refresh()->photos);
        $this->assertCount(0, $customerWithoutPhotos->photos ?? []);
    }

    public function test_customer_photos_can_be_managed_from_the_appointment_edit_modal(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('customers/before.jpg', 'before');

        $customer = Customer::query()->create([
            'name' => 'Takvim Fotoğraf Müşterisi',
            'photos' => ['customers/before.jpg'],
        ]);
        $appointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-07-20 10:00:00',
        ]);

        $this->actingAs(User::factory()->create());
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        $calendar = Livewire::test(Calendar::class)
            ->call('openEditModal', $appointment->id)
            ->assertSet('customerPhotos', ['customers/before.jpg']);

        $calendar
            ->call('removeCustomerPhoto', 0)
            ->assertSet('customerPhotos', []);

        $this->assertSame([], $customer->refresh()->photos);
        Storage::disk('public')->assertMissing('customers/before.jpg');

        $calendar
            ->set('newPhotos', [UploadedFile::fake()->image('after.jpg')])
            ->assertSet('newPhotos', []);

        $this->assertCount(1, $customer->refresh()->photos);
        Storage::disk('public')->assertExists($customer->photos[0]);
    }
}
