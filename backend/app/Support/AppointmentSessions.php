<?php

namespace App\Support;

use App\Models\Appointment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

/**
 * Bir randevunun birden çok seansa bölünmesini yönetir.
 *
 * Değişmezler (invariants):
 *  1. Kök = en erken seans. Kökün parent_id = null; diğer seanslar kökü
 *     parent_id ile gösterir (tek seviye, torun yok).
 *  2. Para yalnızca kökte. price/is_paid/payment_method kökte tutulur;
 *     çocuk seanslarda price = null, is_paid = false, payment_method = null.
 *  3. Müşteri ve hizmet paket boyunca aynıdır. customer_id ve service_id
 *     kökten miras alınır; kökte değişirse tüm seanslara yayılır.
 *  4. session_no = starts_at sırasına göre 1..N, session_total = N.
 *     Tek başına randevuda ikisi de null.
 *  5. Her seansın kendi starts_at, duration_min, status, note, photos değeri vardır.
 */
final class AppointmentSessions
{
    /** Paketin kök (1.) randevusu; tek randevuysa kendisi. */
    public static function root(Appointment $appointment): Appointment
    {
        return $appointment->parent_id !== null
            ? ($appointment->parent ?? $appointment)
            : $appointment;
    }

    /**
     * @return Collection<int, Appointment> Paketin tüm seansları, starts_at ARTAN. Tek randevuda tek elemanlı.
     */
    public static function all(Appointment $appointment): Collection
    {
        $root = self::root($appointment);

        return Appointment::query()
            ->where('id', $root->id)
            ->orWhere('parent_id', $root->id)
            ->orderBy('starts_at')
            ->get();
    }

    /**
     * Tek randevuyu $total seansa böler (2..12). Mevcut randevu 1. seans olur;
     * kalan seanslar aynı saat/süre/müşteri/hizmetle $intervalDays (1..365) gün
     * aralıkla eklenir. Randevu zaten paketin üyesiyse hiçbir şey yapmaz ve false döner.
     */
    public static function split(Appointment $appointment, int $total, int $intervalDays): bool
    {
        if ($total < 2 || $total > 12) {
            throw new InvalidArgumentException('Seans sayısı 2 ile 12 arasında olmalı.');
        }
        self::assertInterval($intervalDays);

        if ($appointment->parent_id !== null || $appointment->sessions()->exists()) {
            return false;
        }

        DB::transaction(function () use ($appointment, $total, $intervalDays): void {
            for ($k = 1; $k < $total; $k++) {
                self::createChild(
                    $appointment,
                    $appointment->id,
                    $appointment->starts_at->copy()->addDays($intervalDays * $k),
                );
            }

            self::resync($appointment);
        });

        return true;
    }

    /**
     * Pakete, en son seanstan $intervalDays gün sonrasına yeni bir seans ekler
     * (tek randevuysa 2 seanslı pakete dönüşür) ve eklenen seansı döner.
     */
    public static function add(Appointment $appointment, int $intervalDays): Appointment
    {
        self::assertInterval($intervalDays);

        return DB::transaction(function () use ($appointment, $intervalDays): Appointment {
            $root = self::root($appointment);
            $last = self::all($appointment)->last();

            $child = self::createChild(
                $root,
                $root->id,
                $last->starts_at->copy()->addDays($intervalDays),
            );

            self::resync($root);

            return $child->refresh();
        });
    }

    /**
     * Verilen seansı SİLER ve paketi yeniden düzenler. Kök silinirse ödeme alanları
     * (price/is_paid/payment_method) yeni köke devredilir. Geriye 1 seans kalırsa
     * paket çözülür (session_no/session_total null).
     */
    public static function remove(Appointment $appointment): void
    {
        DB::transaction(function () use ($appointment): void {
            $root = self::root($appointment);
            $isRoot = $root->is($appointment);

            // Kalan üyeleri (silinecek hariç) starts_at ARTAN belirle.
            $remaining = self::all($appointment)
                ->reject(fn (Appointment $member): bool => $member->is($appointment))
                ->values();

            if ($remaining->isEmpty()) {
                $appointment->delete();

                return;
            }

            $newRoot = $remaining->first();

            if ($isRoot) {
                // Kök siliniyor: ödeme alanlarını en erken kalan üyeye devret ve
                // kalan çocukları FK nullOnDelete cascade'inden ÖNCE yeni köke bağla.
                $newRoot->fill([
                    'price' => $appointment->price,
                    'is_paid' => $appointment->is_paid,
                    'payment_method' => $appointment->payment_method,
                    'parent_id' => null,
                ]);
                if ($newRoot->isDirty()) {
                    $newRoot->save();
                }

                foreach ($remaining->skip(1) as $child) {
                    $child->parent_id = $newRoot->id;
                    $child->save();
                }
            }

            $appointment->delete();

            self::resync($newRoot);
        });
    }

    /**
     * Paketin kökünü ve numaralandırmasını starts_at sırasına göre yeniden kurar
     * (tarih değişince çağrılır). Kök değişirse ödeme alanları yeni köke taşınır.
     */
    public static function resync(Appointment $anyMember): void
    {
        DB::transaction(function () use ($anyMember): void {
            $members = self::all($anyMember);
            $count = $members->count();
            $newRoot = $members->first();
            $oldRoot = self::root($anyMember);

            // Kök değiştiyse ödeme alanlarını eski kökten yeni köke taşı.
            if (! $newRoot->is($oldRoot)) {
                $newRoot->fill([
                    'price' => $oldRoot->price,
                    'is_paid' => $oldRoot->is_paid,
                    'payment_method' => $oldRoot->payment_method,
                ]);
                $oldRoot->fill([
                    'price' => null,
                    'is_paid' => false,
                    'payment_method' => null,
                ]);
                if ($oldRoot->isDirty()) {
                    $oldRoot->save();
                }
            }

            $no = 0;
            foreach ($members as $member) {
                $no++;
                $isRoot = $no === 1;

                if ($count === 1) {
                    // Paket çözüldü: tek başına randevu.
                    $member->fill([
                        'parent_id' => null,
                        'session_no' => null,
                        'session_total' => null,
                    ]);
                } elseif ($isRoot) {
                    $member->fill([
                        'parent_id' => null,
                        'session_no' => $no,
                        'session_total' => $count,
                    ]);
                } else {
                    // Değişmez #2: çocuklarda para alanları sıfırlanır.
                    // Değişmez #3: customer_id/service_id kökten yayılır.
                    $member->fill([
                        'parent_id' => $newRoot->id,
                        'session_no' => $no,
                        'session_total' => $count,
                        'price' => null,
                        'is_paid' => false,
                        'payment_method' => null,
                        'customer_id' => $newRoot->customer_id,
                        'service_id' => $newRoot->service_id,
                    ]);
                }

                if ($member->isDirty()) {
                    $member->save();
                }
            }
        });
    }

    /** Yeni bir çocuk seans oluşturur (para alanları boş, kökten kopyalanan alanlar). */
    private static function createChild(Appointment $source, int $parentId, \DateTimeInterface $startsAt): Appointment
    {
        return Appointment::query()->create([
            'customer_id' => $source->customer_id,
            'app_user_id' => $source->app_user_id,
            'service_id' => $source->service_id,
            'starts_at' => $startsAt,
            'duration_min' => $source->duration_min,
            'price' => null,
            'is_paid' => false,
            'payment_method' => null,
            'note' => null,
            'status' => 'confirmed',
            'photos' => null,
            'parent_id' => $parentId,
        ]);
    }

    private static function assertInterval(int $intervalDays): void
    {
        if ($intervalDays < 1 || $intervalDays > 365) {
            throw new InvalidArgumentException('Gün aralığı 1 ile 365 arasında olmalı.');
        }
    }
}
