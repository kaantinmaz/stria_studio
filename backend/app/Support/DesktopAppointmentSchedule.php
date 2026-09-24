<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Setting;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

final class DesktopAppointmentSchedule
{
    public function validate(
        CarbonImmutable $startsAt,
        int $durationMin,
        ?Appointment $except = null,
        ?Setting $setting = null,
    ): void {
        $endsAt = $startsAt->addMinutes($durationMin);
        $period = collect($setting?->hours ?? [])->first(function (mixed $period) use ($startsAt, $endsAt): bool {
            if (! is_array($period)
                || ! is_array($period['days'] ?? null)
                || ! in_array($startsAt->format('l'), $period['days'], true)
                || ! is_string($period['open'] ?? null)
                || ! is_string($period['close'] ?? null)
                || preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $period['open']) !== 1
                || preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $period['close']) !== 1) {
                return false;
            }

            $open = CarbonImmutable::createFromFormat(
                '!Y-m-d H:i',
                $startsAt->format('Y-m-d').' '.$period['open'],
                config('app.timezone'),
            );
            $close = CarbonImmutable::createFromFormat(
                '!Y-m-d H:i',
                $startsAt->format('Y-m-d').' '.$period['close'],
                config('app.timezone'),
            );

            return $close->greaterThan($open)
                && $startsAt->greaterThanOrEqualTo($open)
                && $endsAt->lessThanOrEqualTo($close);
        });

        if ($period === null) {
            throw ValidationException::withMessages([
                'starts_at' => ['Randevu çalışma saatlerinin içinde olmalı.'],
            ]);
        }

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
