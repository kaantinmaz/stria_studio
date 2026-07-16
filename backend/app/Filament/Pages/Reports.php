<?php

namespace App\Filament\Pages;

use App\Models\Appointment;
use App\Models\Expense;
use BackedEnum;
use Carbon\CarbonImmutable;
use Filament\Pages\Page;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;

class Reports extends Page
{
    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChartBar;

    protected static ?string $navigationLabel = 'Raporlar';

    protected static ?int $navigationSort = 3;

    protected static ?string $title = 'Raporlar';

    protected string $view = 'filament.pages.reports';

    protected Width|string|null $maxContentWidth = Width::Full;

    public string $month = '';

    public function mount(): void
    {
        $this->month = now()->format('Y-m');
    }

    public function getHeading(): ?string
    {
        return null;
    }

    public function prevMonth(): void
    {
        $this->month = $this->monthDate()->subMonth()->format('Y-m');
    }

    public function nextMonth(): void
    {
        $this->month = $this->monthDate()->addMonth()->format('Y-m');
    }

    public function goCurrentMonth(): void
    {
        $this->month = now()->format('Y-m');
    }

    /**
     * @return array{income: float, expense: float, net: float, pending: float}
     */
    public function calculateMonthSummary(string $month): array
    {
        $date = $this->parseMonth($month);
        $range = [$date->startOfMonth(), $date->endOfMonth()];

        $income = (float) Appointment::query()
            ->where('is_paid', true)
            ->whereBetween('starts_at', $range)
            ->sum('price');
        $expense = (float) Expense::query()
            ->whereBetween('spent_at', [
                $date->startOfMonth()->toDateString(),
                $date->endOfMonth()->toDateString(),
            ])
            ->sum('amount');
        $pending = (float) Appointment::query()
            ->where('is_paid', false)
            ->whereNotNull('price')
            ->whereBetween('starts_at', $range)
            ->sum('price');

        return [
            'income' => $income,
            'expense' => $expense,
            'net' => $income - $expense,
            'pending' => $pending,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function getViewData(): array
    {
        $month = $this->monthDate();

        return [
            'monthName' => $this->turkishMonthName($month->month),
            'monthYear' => $month->year,
            'summary' => $this->calculateMonthSummary($month->format('Y-m')),
            'paymentBreakdown' => $this->paymentBreakdown($month),
            'expenseBreakdown' => $this->expenseBreakdown($month),
            'monthlyReports' => $this->monthlyReports($month),
        ];
    }

    /**
     * @return array<string, float>
     */
    private function paymentBreakdown(CarbonImmutable $month): array
    {
        $totals = Appointment::query()
            ->where('is_paid', true)
            ->whereBetween('starts_at', [$month->startOfMonth(), $month->endOfMonth()])
            ->get(['price', 'payment_method'])
            ->groupBy('payment_method')
            ->map(fn ($appointments): float => (float) $appointments->sum('price'));

        return collect([
            'nakit' => 'Nakit',
            'kart' => 'Kart',
            'havale' => 'Havale',
        ])->mapWithKeys(fn (string $label, string $key): array => [
            $label => (float) $totals->get($key, 0),
        ])->all();
    }

    /**
     * @return array<string, float>
     */
    private function expenseBreakdown(CarbonImmutable $month): array
    {
        $totals = Expense::query()
            ->whereBetween('spent_at', [
                $month->startOfMonth()->toDateString(),
                $month->endOfMonth()->toDateString(),
            ])
            ->get(['amount', 'category'])
            ->groupBy('category')
            ->map(fn ($expenses): float => (float) $expenses->sum('amount'));

        return collect(Expense::categoryOptions())
            ->mapWithKeys(fn (string $label, string $key): array => [
                $label => (float) $totals->get($key, 0),
            ])
            ->all();
    }

    /**
     * @return array<int, array{month: string, income: float, expense: float, net: float}>
     */
    private function monthlyReports(CarbonImmutable $selectedMonth): array
    {
        $firstMonth = $selectedMonth->subMonths(11)->startOfMonth();
        $lastMonth = $selectedMonth->endOfMonth();
        $incomes = Appointment::query()
            ->where('is_paid', true)
            ->whereBetween('starts_at', [$firstMonth, $lastMonth])
            ->get(['price', 'starts_at'])
            ->groupBy(fn (Appointment $appointment): string => $appointment->starts_at->format('Y-m'))
            ->map(fn ($appointments): float => (float) $appointments->sum('price'));
        $expenses = Expense::query()
            ->whereBetween('spent_at', [$firstMonth->toDateString(), $lastMonth->toDateString()])
            ->get(['amount', 'spent_at'])
            ->groupBy(fn (Expense $expense): string => $expense->spent_at->format('Y-m'))
            ->map(fn ($items): float => (float) $items->sum('amount'));
        $reports = [];

        for ($index = 0; $index < 12; $index++) {
            $month = $selectedMonth->subMonths($index);
            $key = $month->format('Y-m');
            $income = (float) $incomes->get($key, 0);
            $expense = (float) $expenses->get($key, 0);

            $reports[] = [
                'month' => $this->turkishMonthName($month->month).' '.$month->year,
                'income' => $income,
                'expense' => $expense,
                'net' => $income - $expense,
            ];
        }

        return $reports;
    }

    private function monthDate(): CarbonImmutable
    {
        try {
            return $this->parseMonth($this->month);
        } catch (\InvalidArgumentException) {
            return CarbonImmutable::now()->startOfMonth();
        }
    }

    private function parseMonth(string $month): CarbonImmutable
    {
        if (preg_match('/^(\d{4})-(\d{2})$/', $month, $matches)) {
            $year = (int) $matches[1];
            $monthNumber = (int) $matches[2];

            if (checkdate($monthNumber, 1, $year)) {
                return CarbonImmutable::create($year, $monthNumber, 1)->startOfDay();
            }
        }

        throw new \InvalidArgumentException('Geçersiz ay değeri.');
    }

    private function turkishMonthName(int $month): string
    {
        return [
            1 => 'Ocak',
            2 => 'Şubat',
            3 => 'Mart',
            4 => 'Nisan',
            5 => 'Mayıs',
            6 => 'Haziran',
            7 => 'Temmuz',
            8 => 'Ağustos',
            9 => 'Eylül',
            10 => 'Ekim',
            11 => 'Kasım',
            12 => 'Aralık',
        ][$month];
    }
}
