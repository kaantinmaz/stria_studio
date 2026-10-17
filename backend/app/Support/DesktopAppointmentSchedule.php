<?php

namespace App\Support;

use App\Models\Appointment;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

/**
 * Desktop/iOS staff may book any time (owner rule 2026-10-17, also on closed days and
 * outside working hours); only overlaps with other confirmed appointments are rejected.
 */
final class DesktopAppointmentSchedule
{
    public function validate(
        CarbonImmutable $startsAt,
        int $durationMin,
        ?Appointment $except = null,
    ): void {
        $endsAt = $startsAt->addMinutes($durationMin);
        $overlaps = Appointment::query()
            ->where('status', 'confirmed')
            ->where('starts_at', '<', $endsAt)
            ->where('starts_at', '>=', $startsAt->subDay())
            ->when($except, fn ($query) => $query->whereKeyNot($except->id))
            ->get(['id', 'starts_at', 'duration_min'])
            ->contains(function (Appointment $appointment) use ($startsAt, $endsAt): bool {
                $existingStart = $appointment->starts_at->toImmutable();
                $existingEnd = $existingStart->addMinutes($appointment->duration_min);

                return $existingStart->lessThan($endsAt) && $existingEnd->greaterThan($startsAt);
            });

        if ($overlaps) {
            throw ValidationException::withMessages([
                'starts_at' => ['Randevu başka bir onaylı randevuyla çakışıyor.'],
            ]);
        }
    }
}
