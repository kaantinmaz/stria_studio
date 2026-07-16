<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Customer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
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
            'created_at',
            'updated_at',
        ]));
        $this->assertTrue(Schema::hasColumns('appointments', [
            'customer_id',
            'service_id',
            'starts_at',
            'duration_min',
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
        ]);
        $appointment->refresh();

        $this->assertTrue($appointment->customer->is($customer));
        $this->assertTrue($customer->appointments()->first()->is($appointment));
        $this->assertSame(60, $appointment->duration_min);

        $customer->delete();

        $this->assertNull($appointment->refresh()->customer_id);
        $this->assertNull($appointment->customer);
    }
}
