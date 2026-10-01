<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StudioFactsApiTest extends TestCase
{
    use RefreshDatabase;

    private function customer(string $name): Customer
    {
        return Customer::query()->create([
            'name' => $name,
            'phone' => '0555 '.random_int(100, 999).' '.random_int(10, 99).' '.random_int(10, 99),
        ]);
    }

    private function appointment(array $overrides = []): Appointment
    {
        return Appointment::query()->create(array_merge([
            'service_id' => Service::factory()->create()->id,
            'starts_at' => '2026-09-01 10:00:00',
            'duration_min' => 90,
            'price' => '15000.00',
            'status' => 'confirmed',
        ], $overrides));
    }

    public function test_empty_db_returns_zeros_and_null_date(): void
    {
        $this->getJson('/api/studio-facts')
            ->assertOk()
            ->assertExactJson(['data' => [
                'completed_sessions' => 0,
                'customers_served' => 0,
                'records_since' => null,
            ]]);
    }

    public function test_counts_only_past_confirmed_rows(): void
    {
        $c = $this->customer('Ayşe');

        // Counted: two past confirmed sessions for the same customer.
        $this->appointment(['customer_id' => $c->id, 'starts_at' => '2026-08-01 10:00:00']);
        $this->appointment(['customer_id' => $c->id, 'starts_at' => '2026-09-01 10:00:00']);

        // Excluded rows.
        $this->appointment(['customer_id' => $this->customer('Future')->id, 'starts_at' => now()->addDay(), 'status' => 'confirmed']);
        $this->appointment(['customer_id' => $this->customer('Req')->id, 'status' => 'requested']);
        $this->appointment(['customer_id' => $this->customer('Cancel')->id, 'status' => 'cancelled']);
        $this->appointment(['customer_id' => $this->customer('NoShow')->id, 'status' => 'no_show']);

        $this->getJson('/api/studio-facts')
            ->assertOk()
            ->assertJsonPath('data.completed_sessions', 2)
            ->assertJsonPath('data.customers_served', 1)
            ->assertJsonPath('data.records_since', '2026-08-01');
    }

    public function test_distinct_customers_and_earliest_date(): void
    {
        $this->appointment(['customer_id' => $this->customer('A')->id, 'starts_at' => '2026-07-15 09:00:00']);
        $this->appointment(['customer_id' => $this->customer('B')->id, 'starts_at' => '2026-08-20 09:00:00']);

        $this->getJson('/api/studio-facts')
            ->assertOk()
            ->assertJsonPath('data.completed_sessions', 2)
            ->assertJsonPath('data.customers_served', 2)
            ->assertJsonPath('data.records_since', '2026-07-15');
    }
}
