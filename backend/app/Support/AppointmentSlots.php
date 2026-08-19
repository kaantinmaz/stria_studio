<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Setting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class AppointmentSlots
{
    /**
     * Verilen gün için, `$durationMin` dakikalık bir işlemin sığdığı saat
     * başlarını döner. Saat başı ızgara korunuyor (stüdyo böyle çalışıyor);
     * uzun işlem birden fazla saati kapatır.
     *
     * @return array<int, string>
     */
    public function forDate(CarbonImmutable $date, int $durationMin): array
    {
        $hours = collect(Setting::forSite()->hours ?? [])->first(
            fn (array $period): bool => in_array($date->format('l'), $period['days'] ?? [], true),
        );

        if (! $hours || blank($hours['open'] ?? null) || blank($hours['close'] ?? null)) {
            return [];
        }

        $open = CarbonImmutable::createFromFormat('!Y-m-d H:i', $date->format('Y-m-d').' '.$hours['open']);
        $close = CarbonImmutable::createFromFormat('!Y-m-d H:i', $date->format('Y-m-d').' '.$hours['close']);

        if ($close->lessThanOrEqualTo($open)) {
            return [];
        }

        $duration = max(5, $durationMin);
        $now = CarbonImmutable::now();
        // Önceki günden taşan uzun bir randevu da çakışabilir: bir gün geriden tara.
        $appointments = Appointment::query()
            ->where('status', 'confirmed')
            ->whereBetween('starts_at', [$date->subDay()->startOfDay(), $date->endOfDay()])
            ->get(['starts_at', 'duration_min']);
        $slots = [];

        for ($slot = $open; $slot->addMinutes($duration)->lessThanOrEqualTo($close); $slot = $slot->addHour()) {
            if ($slot->greaterThan($now) && ! $this->overlaps($slot, $slot->addMinutes($duration), $appointments)) {
                $slots[] = $slot->format('H:i');
            }
        }

        return $slots;
    }

    /**
     * @param  Collection<int, Appointment>  $appointments
     */
    private function overlaps(CarbonImmutable $slotStart, CarbonImmutable $slotEnd, Collection $appointments): bool
    {
        return $appointments->contains(function (Appointment $appointment) use ($slotStart, $slotEnd): bool {
            $appointmentStart = $appointment->starts_at->toImmutable();
            $appointmentEnd = $appointmentStart->addMinutes($appointment->duration_min);

            return $appointmentStart->lessThan($slotEnd) && $appointmentEnd->greaterThan($slotStart);
        });
    }
}
