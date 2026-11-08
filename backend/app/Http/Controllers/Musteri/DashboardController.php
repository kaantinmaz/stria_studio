<?php

namespace App\Http\Controllers\Musteri;

use App\Filament\Pages\Reports;
use App\Http\Controllers\Controller;
use App\Models\Appointment;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\View\View;

class DashboardController extends Controller
{
    public function index(): View
    {
        $today = CarbonImmutable::now()->startOfDay();
        $weekEnd = $today->addDays(7)->endOfDay();

        $agenda = Appointment::query()
            ->with(['customer:id,name,phone', 'service:id,name_tr'])
            ->whereBetween('starts_at', [$today, $weekEnd])
            ->whereIn('status', ['confirmed', 'requested'])
            ->orderBy('starts_at')
            ->get()
            ->groupBy(fn (Appointment $a): string => $a->starts_at->format('Y-m-d'));

        $todays = $agenda->get($today->format('Y-m-d'), collect());

        $pending = Appointment::query()
            ->with(['customer:id,name,phone', 'service:id,name_tr', 'campaign:id,title'])
            ->where('status', 'requested')
            ->orderBy('starts_at')
            ->get();

        $reports = new Reports();
        $month = CarbonImmutable::now()->format('Y-m');
        $summary = $reports->calculateMonthSummary($month);
        $kpis = $reports->calculateKpis($month);

        return view('musteri.dashboard', [
            'today' => $today,
            'todays' => $todays,
            'agenda' => $agenda,
            'pending' => $pending,
            'monthIncome' => $summary['income'],
            'monthAppointments' => $kpis['appointments'],
            'monthNewCustomers' => $kpis['new_customers'],
        ]);
    }
}
