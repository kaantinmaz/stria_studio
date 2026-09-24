<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Setting;
use DomainException;
use Illuminate\Database\Eloquent\Model;

final class DesktopApi
{
    /** @var array<int, string> */
    private const DAYS = [
        1 => 'Sunday',
        2 => 'Monday',
        3 => 'Tuesday',
        4 => 'Wednesday',
        5 => 'Thursday',
        6 => 'Friday',
        7 => 'Saturday',
    ];

    /** @return array<string, mixed> */
    public static function customer(Customer $customer): array
    {
        return [
            'id' => $customer->id,
            'name' => $customer->name,
            'phone' => $customer->phone,
            'email' => $customer->email,
            'notes' => $customer->notes,
            'updated_at' => $customer->updated_at?->toIso8601String(),
            'revision' => self::revision($customer),
        ];
    }

    /** @return array<string, mixed> */
    public static function appointment(Appointment $appointment): array
    {
        return [
            'id' => $appointment->id,
            'customer_id' => $appointment->customer_id,
            'service_id' => $appointment->service_id,
            'starts_at' => $appointment->starts_at->toIso8601String(),
            'duration_min' => $appointment->duration_min,
            'status' => $appointment->status,
            'note' => $appointment->note,
            'updated_at' => $appointment->updated_at?->toIso8601String(),
            'revision' => self::revision($appointment),
            'parent_id' => $appointment->parent_id,
            'session_no' => $appointment->session_no,
            'session_total' => $appointment->session_total,
        ];
    }

    public static function revision(Model $model): string
    {
        $attributes = $model->getRawOriginal();
        ksort($attributes);

        return hash('sha256', json_encode($attributes, JSON_THROW_ON_ERROR));
    }

    /**
     * Convert the settings repeater into the desktop's Sunday-first, one-row-per-day form.
     *
     * @return array<int, array{id:int, enabled:bool, open:int, close:int}>
     */
    public static function hours(?Setting $setting): array
    {
        $byDay = [];

        foreach ($setting?->hours ?? [] as $period) {
            if (! is_array($period)
                || ! is_array($period['days'] ?? null)
                || $period['days'] === []
                || ! self::validTime($period['open'] ?? null)
                || ! self::validTime($period['close'] ?? null)) {
                throw new DomainException('Çalışma saatleri masaüstü uygulamasında güvenle düzenlenemiyor.');
            }

            $open = self::minutes($period['open']);
            $close = self::minutes($period['close']);
            if ($close <= $open) {
                throw new DomainException('Çalışma saatleri masaüstü uygulamasında güvenle düzenlenemiyor.');
            }

            foreach ($period['days'] as $day) {
                $id = array_search($day, self::DAYS, true);
                if ($id === false || isset($byDay[$id])) {
                    // A split day would be collapsed by the desktop's single interval.
                    throw new DomainException('Bölünmüş veya yinelenen çalışma günleri masaüstü uygulamasında düzenlenemez.');
                }

                $byDay[$id] = ['open' => $open, 'close' => $close];
            }
        }

        $hours = [];
        foreach (self::DAYS as $id => $day) {
            $hours[] = [
                'id' => $id,
                'enabled' => isset($byDay[$id]),
                'open' => $byDay[$id]['open'] ?? 540,
                'close' => $byDay[$id]['close'] ?? 1140,
            ];
        }

        return $hours;
    }

    /**
     * @param  array<int, array{id:int, enabled:bool, open:int, close:int}>  $hours
     * @return array<int, array{days:array<int, string>, open:string, close:string}>
     */
    public static function settingHours(array $hours): array
    {
        $periods = [];

        foreach ($hours as $hour) {
            if (! $hour['enabled']) {
                continue;
            }

            $key = $hour['open'].'-'.$hour['close'];
            $periods[$key] ??= [
                'days' => [],
                'open' => self::time((int) $hour['open']),
                'close' => self::time((int) $hour['close']),
            ];
            $periods[$key]['days'][] = self::DAYS[$hour['id']];
        }

        return array_values($periods);
    }

    /** @return array<int, string> */
    public static function dayNames(): array
    {
        return self::DAYS;
    }

    private static function validTime(mixed $time): bool
    {
        return is_string($time) && preg_match('/^(?:[01]\d|2[0-3]):[0-5]\d$/', $time) === 1;
    }

    private static function minutes(string $time): int
    {
        [$hour, $minute] = array_map('intval', explode(':', $time));

        return $hour * 60 + $minute;
    }

    private static function time(int $minutes): string
    {
        return sprintf('%02d:%02d', intdiv($minutes, 60), $minutes % 60);
    }
}
