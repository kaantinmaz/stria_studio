<?php

namespace App\Http\Controllers\Musteri;

use App\Filament\Pages\Reports;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request): View
    {
        $month = $request->string('month')->value();
        if (! preg_match('/^\d{4}-\d{2}$/', $month)) {
            $month = CarbonImmutable::now()->format('Y-m');
        }

        // Filament Reports hesaplamalarını paylaşır (ayrı bir kopya yok).
        $reports = new Reports();

        return view('musteri.raporlar', [
            'month' => $month,
            'summary' => $reports->calculateMonthSummary($month),
            'kpis' => $reports->calculateKpis($month),
            'serviceBreakdown' => $reports->serviceBreakdown($month),
            'topCustomers' => $reports->topCustomers(),
            'weekdayLoad' => $reports->weekdayLoad($month),
            'sourceBreakdown' => $this->sourceBreakdown($month),
        ]);
    }

    /**
     * Kaynağa (müşterinin "bizi nereden buldunuz") göre randevu dağılımı.
     *
     * @return array<int, array{label: string, count: int}>
     */
    private function sourceBreakdown(string $month): array
    {
        $date = CarbonImmutable::createFromFormat('!Y-m', $month);
        $counts = Appointment::query()
            ->with('customer:id,heard_from')
            ->whereBetween('starts_at', [$date->startOfMonth(), $date->endOfMonth()])
            ->get(['id', 'customer_id'])
            ->groupBy(fn (Appointment $a): string => $a->customer?->heard_from ?? '')
            ->map(fn ($items): int => $items->count());

        $rows = [];
        foreach (Customer::HEARD_FROM as $key => $label) {
            $rows[] = ['label' => $label, 'count' => (int) $counts->get($key, 0)];
        }
        $rows[] = ['label' => 'Belirtilmedi', 'count' => (int) $counts->get('', 0)];

        usort($rows, fn (array $a, array $b): int => $b['count'] <=> $a['count']);

        return array_values(array_filter($rows, fn (array $r): bool => $r['count'] > 0));
    }
}
