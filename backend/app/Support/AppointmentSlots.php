<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Setting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class AppointmentSlots
{
    /**
     * @return array<int, string>
     */
    public function forDate(CarbonImmutable $date): array
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

        $appointments = Appointment::query()
            ->where('status', 'confirmed')
            ->whereDate('starts_at', $date->toDateString())
            ->get(['starts_at', 'duration_min']);
        $slots = [];

        for ($slot = $open; $slot->addHour()->lessThanOrEqualTo($close); $slot = $slot->addHour()) {
            if (! $this->overlaps($slot, $slot->addHour(), $appointments)) {
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
