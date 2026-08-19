<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use App\Support\AppointmentSessions;
use Illuminate\Foundation\Testing\RefreshDatabase;
use InvalidArgumentException;
use Tests\TestCase;

class AppointmentSessionsTest extends TestCase
{
    use RefreshDatabase;

    private function makeAppointment(array $overrides = []): Appointment
    {
        $customer = Customer::query()->create([
            'name' => 'Kamuflaj Müşterisi',
            'phone' => '0555 111 22 33',
        ]);
        $service = Service::factory()->create();

        return Appointment::query()->create(array_merge([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-09-01 10:00:00',
            'duration_min' => 90,
            'price' => '15000.00',
            'is_paid' => true,
            'payment_method' => 'kart',
            'status' => 'confirmed',
        ], $overrides));
    }

    public function test_split_creates_three_sessions_with_intervals_numbering_and_money_on_root(): void
    {
        $appointment = $this->makeAppointment();

        $result = AppointmentSessions::split($appointment, 3, 28);

        $this->assertTrue($result);

        $sessions = AppointmentSessions::all($appointment);
        $this->assertCount(3, $sessions);

        [$first, $second, $third] = $sessions->all();

        $this->assertSame('2026-09-01 10:00:00', $first->starts_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-09-29 10:00:00', $second->starts_at->format('Y-m-d H:i:s'));
        $this->assertSame('2026-10-27 10:00:00', $third->starts_at->format('Y-m-d H:i:s'));

        $this->assertSame([1, 2, 3], $sessions->pluck('session_no')->all());
        $this->assertSame([3, 3, 3], $sessions->pluck('session_total')->all());

        // Kök: fiyat korunur.
        $this->assertNull($first->parent_id);
        $this->assertSame('15000.00', $first->price);
        $this->assertTrue($first->is_paid);
        $this->assertSame('kart', $first->payment_method);

        // Çocuklar: para alanları boş, kök id'sine bağlı, kopyalanan alanlar aynı.
        foreach ([$second, $third] as $child) {
            $this->assertSame($first->id, $child->parent_id);
            $this->assertNull($child->price);
            $this->assertFalse($child->is_paid);
            $this->assertNull($child->payment_method);
            $this->assertSame($first->customer_id, $child->customer_id);
            $this->assertSame($first->service_id, $child->service_id);
            $this->assertSame(90, $child->duration_min);
        }
    }

    public function test_split_on_a_session_that_is_already_a_package_returns_false(): void
    {
        $appointment = $this->makeAppointment();
        AppointmentSessions::split($appointment, 3, 28);

        $countBefore = Appointment::query()->count();

        // Kök üzerinde tekrar bölme.
        $this->assertFalse(AppointmentSessions::split($appointment->refresh(), 2, 10));

        // Bir çocuk seans üzerinde bölme.
        $child = AppointmentSessions::all($appointment)->last();
        $this->assertFalse(AppointmentSessions::split($child, 2, 10));

        $this->assertSame($countBefore, Appointment::query()->count());
    }

    public function test_split_with_invalid_total_throws(): void
    {
        $appointment = $this->makeAppointment();

        $this->expectException(InvalidArgumentException::class);
        AppointmentSessions::split($appointment, 1, 28);
    }

    public function test_split_with_invalid_interval_throws(): void
    {
        $appointment = $this->makeAppointment();

        $this->expectException(InvalidArgumentException::class);
        AppointmentSessions::split($appointment, 3, 0);
    }

    public function test_add_appends_a_session_after_the_last_one(): void
    {
        $appointment = $this->makeAppointment();
        AppointmentSessions::split($appointment, 3, 28);

        $added = AppointmentSessions::add($appointment->refresh(), 28);

        $sessions = AppointmentSessions::all($appointment);
        $this->assertCount(4, $sessions);
        $this->assertSame([1, 2, 3, 4], $sessions->pluck('session_no')->all());
        $this->assertSame([4, 4, 4, 4], $sessions->pluck('session_total')->all());

        // Son seans, önceki son seanstan (2026-10-27) +28 gün.
        $this->assertSame('2026-11-24 10:00:00', $added->starts_at->format('Y-m-d H:i:s'));
        $this->assertSame(4, $added->session_no);
        $this->assertNull($added->price);
    }

    public function test_add_on_single_appointment_creates_two_session_package(): void
    {
        $appointment = $this->makeAppointment();

        $added = AppointmentSessions::add($appointment, 14);

        $sessions = AppointmentSessions::all($appointment->refresh());
        $this->assertCount(2, $sessions);
        $this->assertSame([1, 2], $sessions->pluck('session_no')->all());
        $this->assertSame('2026-09-15 10:00:00', $added->starts_at->format('Y-m-d H:i:s'));
        $this->assertSame('15000.00', $sessions->first()->price);
    }

    public function test_remove_middle_session_renumbers_remaining(): void
    {
        $appointment = $this->makeAppointment();
        AppointmentSessions::split($appointment, 3, 28);

        $middle = AppointmentSessions::all($appointment)->get(1);
        AppointmentSessions::remove($middle);

        $sessions = AppointmentSessions::all($appointment->refresh());
        $this->assertCount(2, $sessions);
        $this->assertSame([1, 2], $sessions->pluck('session_no')->all());
        $this->assertSame([2, 2], $sessions->pluck('session_total')->all());
        // Fiyat hâlâ kökte.
        $this->assertSame('15000.00', $sessions->first()->price);
    }

    public function test_remove_root_transfers_money_and_reparents_children(): void
    {
        $appointment = $this->makeAppointment();
        AppointmentSessions::split($appointment, 3, 28);

        $root = AppointmentSessions::root($appointment->refresh());
        AppointmentSessions::remove($root);

        $sessions = AppointmentSessions::all(Appointment::query()->firstOrFail());
        $this->assertCount(2, $sessions);

        $newRoot = $sessions->first();
        $this->assertNull($newRoot->parent_id);
        $this->assertSame('15000.00', $newRoot->price);
        $this->assertTrue($newRoot->is_paid);
        $this->assertSame('kart', $newRoot->payment_method);
        $this->assertSame([1, 2], $sessions->pluck('session_no')->all());

        // Diğer seans yeni köke bağlı, para yok.
        $other = $sessions->last();
        $this->assertSame($newRoot->id, $other->parent_id);
        $this->assertNull($other->price);
        $this->assertFalse($other->is_paid);
    }

    public function test_remove_until_single_session_unwraps_the_package(): void
    {
        $appointment = $this->makeAppointment();
        AppointmentSessions::split($appointment, 2, 28);

        $child = AppointmentSessions::all($appointment)->last();
        AppointmentSessions::remove($child);

        $survivor = Appointment::query()->firstOrFail();
        $this->assertNull($survivor->parent_id);
        $this->assertNull($survivor->session_no);
        $this->assertNull($survivor->session_total);
        $this->assertSame('15000.00', $survivor->price);
    }

    public function test_resync_moves_root_when_root_date_pushed_past_others(): void
    {
        $appointment = $this->makeAppointment();
        AppointmentSessions::split($appointment, 3, 28);

        $root = AppointmentSessions::root($appointment->refresh());
        // Kökün tarihini son seansın ötesine çek.
        $root->starts_at = '2026-12-01 10:00:00';
        $root->save();

        AppointmentSessions::resync($root);

        $sessions = AppointmentSessions::all($root->refresh());
        $this->assertSame([1, 2, 3], $sessions->pluck('session_no')->all());

        $newRoot = $sessions->first();
        $this->assertNull($newRoot->parent_id);
        // Para yeni köke taşındı.
        $this->assertSame('15000.00', $newRoot->price);
        $this->assertTrue($newRoot->is_paid);
        $this->assertSame('kart', $newRoot->payment_method);

        // Eski kök artık son seans ve para taşımıyor.
        $last = $sessions->last();
        $this->assertSame($root->id, $last->id);
        $this->assertSame($newRoot->id, $last->parent_id);
        $this->assertNull($last->price);
        $this->assertFalse($last->is_paid);
    }

    public function test_resync_propagates_customer_and_service_from_root(): void
    {
        $appointment = $this->makeAppointment();
        AppointmentSessions::split($appointment, 3, 28);

        $newCustomer = Customer::query()->create([
            'name' => 'Yeni Müşteri',
            'phone' => '0555 999 88 77',
        ]);
        $newService = Service::factory()->create();

        $root = AppointmentSessions::root($appointment->refresh());
        $root->customer_id = $newCustomer->id;
        $root->service_id = $newService->id;
        $root->save();

        AppointmentSessions::resync($root);

        foreach (AppointmentSessions::all($root->refresh()) as $session) {
            $this->assertSame($newCustomer->id, $session->customer_id);
            $this->assertSame($newService->id, $session->service_id);
        }
    }

    public function test_package_revenue_is_counted_once(): void
    {
        $appointment = $this->makeAppointment();
        AppointmentSessions::split($appointment, 3, 28);

        $total = AppointmentSessions::all($appointment)->sum('price');

        $this->assertSame(15000.0, (float) $total);
    }
}
