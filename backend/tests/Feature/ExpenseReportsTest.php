<?php

namespace Tests\Feature;

use App\Filament\Pages\Reports;
use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Expense;
use App\Models\Service;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ExpenseReportsTest extends TestCase
{
    use RefreshDatabase;

    public function test_expense_can_be_created_with_expected_casts(): void
    {
        $this->assertTrue(Schema::hasColumns('expenses', [
            'title',
            'amount',
            'category',
            'spent_at',
            'note',
            'created_at',
            'updated_at',
        ]));

        $expense = Expense::query()->create([
            'title' => 'Temmuz kirası',
            'amount' => '12500.50',
            'category' => 'kira',
            'spent_at' => '2026-07-01',
            'note' => 'Banka havalesi',
        ])->fresh();

        $this->assertSame('Temmuz kirası', $expense->title);
        $this->assertSame('12500.50', $expense->amount);
        $this->assertSame('kira', $expense->category);
        $this->assertSame('2026-07-01', $expense->spent_at->format('Y-m-d'));
        $this->assertSame('Banka havalesi', $expense->note);
    }

    public function test_reports_month_summary_calculates_income_expense_net_and_pending_collection(): void
    {
        Appointment::query()->create([
            'starts_at' => '2026-07-05 10:00:00',
            'price' => '1250.50',
            'is_paid' => true,
            'payment_method' => 'nakit',
        ]);
        Appointment::query()->create([
            'starts_at' => '2026-07-20 14:00:00',
            'price' => '749.50',
            'is_paid' => true,
            'payment_method' => 'kart',
        ]);
        Appointment::query()->create([
            'starts_at' => '2026-07-25 12:00:00',
            'price' => '300.00',
            'is_paid' => false,
        ]);
        Appointment::query()->create([
            'starts_at' => '2026-08-01 10:00:00',
            'price' => '9000.00',
            'is_paid' => true,
        ]);
        Expense::query()->create([
            'title' => 'Malzeme alımı',
            'amount' => '650.00',
            'category' => 'malzeme',
            'spent_at' => '2026-07-15',
        ]);

        $summary = (new Reports)->calculateMonthSummary('2026-07');

        $this->assertSame(2000.0, $summary['income']);
        $this->assertSame(650.0, $summary['expense']);
        $this->assertSame(1350.0, $summary['net']);
        $this->assertSame(300.0, $summary['pending']);
    }

    public function test_reports_calculate_service_and_business_performance_metrics(): void
    {
        $browService = Service::query()->create([
            'slug' => 'kas-bakimi',
            'name_tr' => 'Kaş Bakımı',
            'tag_tr' => 'Kaş',
            'desc_tr' => 'Kaş bakım hizmeti',
        ]);
        $lashService = Service::query()->create([
            'slug' => 'kirpik-lifting',
            'name_tr' => 'Kirpik Lifting',
            'tag_tr' => 'Kirpik',
            'desc_tr' => 'Kirpik lifting hizmeti',
        ]);
        $returningCustomer = Customer::query()->create(['name' => 'Ayşe Kaya']);
        $returningCustomer->forceFill(['created_at' => '2026-05-10 09:00:00'])->save();
        $newCustomer = Customer::query()->create(['name' => 'Selin Demir']);
        $newCustomer->forceFill(['created_at' => '2026-07-03 09:00:00'])->save();

        Appointment::query()->create([
            'customer_id' => $returningCustomer->id,
            'service_id' => $lashService->id,
            'starts_at' => '2026-06-12 10:00:00',
            'price' => '200.00',
            'is_paid' => true,
        ]);
        Appointment::query()->create([
            'customer_id' => $returningCustomer->id,
            'service_id' => $browService->id,
            'starts_at' => '2026-07-04 10:00:00',
            'price' => '1000.00',
            'is_paid' => true,
        ]);
        Appointment::query()->create([
            'customer_id' => $newCustomer->id,
            'service_id' => $browService->id,
            'starts_at' => '2026-07-11 11:00:00',
            'price' => '300.00',
            'is_paid' => false,
        ]);
        Appointment::query()->create([
            'customer_id' => $newCustomer->id,
            'service_id' => $lashService->id,
            'starts_at' => '2026-07-18 12:00:00',
            'price' => '600.00',
            'is_paid' => true,
        ]);

        $reports = new Reports;
        $services = $reports->serviceBreakdown('2026-07');
        $kpis = $reports->calculateKpis('2026-07');
        $customers = $reports->topCustomers();

        $this->assertSame('Kaş Bakımı', $services[0]['service']);
        $this->assertSame(2, $services[0]['count']);
        $this->assertSame(1000.0, $services[0]['revenue']);
        $this->assertSame('Kirpik Lifting', $services[1]['service']);
        $this->assertSame(1, $services[1]['count']);
        $this->assertSame(600.0, $services[1]['revenue']);

        $this->assertSame(3, $kpis['appointments']);
        $this->assertSame(800.0, $kpis['average_ticket']);
        $this->assertSame(1, $kpis['new_customers']);
        $this->assertSame(50, $kpis['repeat_rate']);

        $this->assertSame('Ayşe Kaya', $customers[0]['customer']);
        $this->assertSame(2, $customers[0]['appointments']);
        $this->assertSame(1200.0, $customers[0]['paid_total']);
        $this->assertSame('Selin Demir', $customers[1]['customer']);
        $this->assertSame(600.0, $customers[1]['paid_total']);
    }
}
