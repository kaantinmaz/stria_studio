<?php

namespace Tests\Feature;

use App\Filament\Pages\Reports;
use App\Models\Appointment;
use App\Models\Expense;
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
}
