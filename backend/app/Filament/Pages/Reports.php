<?php

namespace App\Filament\Pages;

use App\Models\Appointment;
use App\Models\Customer;
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
     * @return array{appointments: int, average_ticket: float|null, new_customers: int, repeat_rate: int}
     */
    public function calculateKpis(string $month): array
    {
        $date = $this->parseMonth($month);
        $range = [$date->startOfMonth(), $date->endOfMonth()];
        $appointments = Appointment::query()
            ->whereBetween('starts_at', $range)
            ->get(['customer_id', 'price', 'is_paid']);
        $paidAppointments = $appointments
            ->where('is_paid', true)
            ->whereNotNull('price');
        $customerIds = $appointments
            ->pluck('customer_id')
            ->filter()
            ->unique()
            ->values();
        $repeatCustomerCount = $customerIds->isEmpty()
            ? 0
            : Appointment::query()
                ->whereIn('customer_id', $customerIds)
                ->where('starts_at', '<', $date->startOfMonth())
                ->distinct()
                ->count('customer_id');

        return [
            'appointments' => $appointments->count(),
            'average_ticket' => $paidAppointments->isEmpty()
                ? null
                : (float) $paidAppointments->sum('price') / $paidAppointments->count(),
            'new_customers' => Customer::query()
                ->whereBetween('created_at', $range)
                ->count(),
            'repeat_rate' => $customerIds->isEmpty()
                ? 0
                : (int) round(($repeatCustomerCount / $customerIds->count()) * 100),
        ];
    }

    /**
     * @return array<int, array{service: string, count: int, revenue: float, average_price: float|null}>
     */
    public function serviceBreakdown(string $month): array
    {
        $date = $this->parseMonth($month);
        $appointments = Appointment::query()
            ->with('service:id,name_tr')
            ->whereBetween('starts_at', [$date->startOfMonth(), $date->endOfMonth()])
            ->get(['service_id', 'price', 'is_paid'])
            ->groupBy(fn (Appointment $appointment): string => $appointment->service_id === null
                ? 'none'
                : (string) $appointment->service_id)
            ->map(function ($items): array {
                $paidAppointments = $items
                    ->where('is_paid', true)
                    ->whereNotNull('price');
                $revenue = (float) $paidAppointments->sum('price');

                return [
                    'service' => $items->first()->service?->name_tr ?? 'Hizmet seçilmedi',
                    'count' => $items->count(),
                    'revenue' => $revenue,
                    'average_price' => $paidAppointments->isEmpty()
                        ? null
                        : $revenue / $paidAppointments->count(),
                ];
            })
            ->values()
            ->all();

        usort($appointments, fn (array $left, array $right): int =>
            $right['count'] <=> $left['count']
            ?: $right['revenue'] <=> $left['revenue']
            ?: strcmp($left['service'], $right['service']));

        return $appointments;
    }

    /**
     * @return array<int, array{customer: string, appointments: int, paid_total: float}>
     */
    public function topCustomers(int $limit = 5): array
    {
        if ($limit < 1) {
            return [];
        }

        $customers = Appointment::query()
            ->with('customer:id,name')
            ->whereNotNull('customer_id')
            ->get(['customer_id', 'price', 'is_paid'])
            ->groupBy('customer_id')
            ->map(function ($appointments): array {
                $paidTotal = $appointments
                    ->where('is_paid', true)
                    ->whereNotNull('price')
                    ->sum('price');

                return [
                    'customer' => $appointments->first()->customer?->name ?? 'Silinmiş müşteri',
                    'appointments' => $appointments->count(),
                    'paid_total' => (float) $paidTotal,
                ];
            })
            ->values()
            ->all();

        usort($customers, fn (array $left, array $right): int =>
            $right['paid_total'] <=> $left['paid_total']
            ?: $right['appointments'] <=> $left['appointments']
            ?: strcmp($left['customer'], $right['customer']));

        return array_slice($customers, 0, $limit);
    }

    /**
     * @return array<int, array{day: string, name: string, count: int, percentage: float}>
     */
    public function weekdayLoad(string $month): array
    {
        $date = $this->parseMonth($month);
        $counts = array_fill(1, 7, 0);

        Appointment::query()
            ->whereBetween('starts_at', [$date->startOfMonth(), $date->endOfMonth()])
            ->get(['starts_at'])
            ->each(function (Appointment $appointment) use (&$counts): void {
                $counts[$appointment->starts_at->dayOfWeekIso]++;
            });

        $days = [
            1 => ['Pzt', 'Pazartesi'],
            2 => ['Sal', 'Salı'],
            3 => ['Çar', 'Çarşamba'],
            4 => ['Per', 'Perşembe'],
            5 => ['Cum', 'Cuma'],
            6 => ['Cmt', 'Cumartesi'],
            7 => ['Paz', 'Pazar'],
        ];
        $maximum = max($counts);

        return collect($days)
            ->map(fn (array $labels, int $day): array => [
                'day' => $labels[0],
                'name' => $labels[1],
                'count' => $counts[$day],
                'percentage' => $maximum > 0 ? ($counts[$day] / $maximum) * 100 : 0,
            ])
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>
     */
    protected function getViewData(): array
    {
        $month = $this->monthDate();
        $weekdayLoad = $this->weekdayLoad($month->format('Y-m'));
        $busiestWeekday = collect($weekdayLoad)->sortByDesc('count')->first();

        return [
            'monthName' => $this->turkishMonthName($month->month),
            'monthYear' => $month->year,
            'summary' => $this->calculateMonthSummary($month->format('Y-m')),
            'kpis' => $this->calculateKpis($month->format('Y-m')),
            'paymentBreakdown' => $this->paymentBreakdown($month),
            'expenseBreakdown' => $this->expenseBreakdown($month),
            'serviceBreakdown' => $this->serviceBreakdown($month->format('Y-m')),
            'topCustomers' => $this->topCustomers(),
            'weekdayLoad' => $weekdayLoad,
            'busiestWeekday' => ($busiestWeekday['count'] ?? 0) > 0
                ? $busiestWeekday['name']
                : null,
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
