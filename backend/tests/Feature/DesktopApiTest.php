<?php

namespace Tests\Feature;

use App\Models\Appointment;
use App\Models\AppUser;
use App\Models\Campaign;
use App\Models\Customer;
use App\Models\Service;
use App\Models\Setting;
use App\Models\User;
use App\Support\AppointmentSessions;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\PersonalAccessToken;
use Tests\TestCase;

class DesktopApiTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        CarbonImmutable::setTestNow();

        parent::tearDown();
    }

    public function test_login_returns_seven_day_admin_token_and_logout_revokes_it(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 12:00:00');
        $user = User::factory()->create([
            'name' => 'Studio Owner',
            'email' => 'owner@example.com',
            'password' => 'correct-password',
        ]);

        $response = $this->postJson('/api/desktop/login', [
            'email' => 'OWNER@example.com',
            'password' => 'correct-password',
        ])->assertOk()
            ->assertJsonPath('user.id', $user->id)
            ->assertJsonPath('user.email', 'owner@example.com');

        $token = PersonalAccessToken::query()->sole();
        $this->assertSame(['desktop:manage'], $token->abilities);
        $this->assertSame('2026-09-20 12:00:00', $token->expires_at->format('Y-m-d H:i:s'));

        $plainTextToken = $response->json('token');
        $this->withToken($plainTextToken)->postJson('/api/desktop/logout')->assertNoContent();
        $this->assertDatabaseCount('personal_access_tokens', 0);

        $this->app['auth']->forgetGuards();
        $this->withToken($plainTextToken)->getJson('/api/desktop/state')->assertUnauthorized();
    }

    public function test_login_rejects_bad_credentials(): void
    {
        User::factory()->create([
            'email' => 'owner@example.com',
            'password' => 'correct-password',
        ]);

        $this->postJson('/api/desktop/login', [
            'email' => 'owner@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');
    }

    public function test_protected_routes_reject_missing_customer_wrong_ability_expired_and_web_tokens(): void
    {
        $this->getJson('/api/desktop/state')->assertUnauthorized();

        $appUser = AppUser::query()->create([
            'name' => 'Customer',
            'email' => 'customer@example.com',
            'password' => 'password',
        ]);
        $this->withToken($appUser->createToken('customer')->plainTextToken)
            ->getJson('/api/desktop/state')
            ->assertUnauthorized();

        $admin = User::factory()->create();
        $this->app['auth']->forgetGuards();
        $this->withToken($admin->createToken('wrong', ['posts'])->plainTextToken)
            ->getJson('/api/desktop/state')
            ->assertForbidden();

        $this->app['auth']->forgetGuards();
        $expired = $admin->createToken('expired', ['desktop:manage'], now()->subMinute())->plainTextToken;
        $this->withToken($expired)->getJson('/api/desktop/state')->assertUnauthorized();

        $this->app['auth']->forgetGuards();
        $this->actingAs($admin)->getJson('/api/desktop/state')->assertUnauthorized();
    }

    public function test_state_returns_complete_data_in_desktop_shape_without_creating_settings(): void
    {
        $customer = Customer::query()->create([
            'name' => 'Ayşe',
            'phone' => '0555',
            'email' => 'ayse@example.com',
            'notes' => 'Hassas cilt',
        ]);
        $inactiveService = Service::factory()->create([
            'name_tr' => 'Eski Hizmet',
            'duration_min' => 90,
            'is_active' => false,
        ]);
        Appointment::query()->create([
            'customer_id' => $customer->id,
            'service_id' => $inactiveService->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 90,
            'status' => 'confirmed',
        ]);

        $response = $this->desktop()->getJson('/api/desktop/state')->assertOk();

        $response
            ->assertJsonPath('timezone', 'Europe/Istanbul')
            ->assertJsonPath('customers.0.name', 'Ayşe')
            ->assertJsonPath('services.0.title', 'Eski Hizmet')
            ->assertJsonPath('appointments.0.starts_at', '2026-09-14T10:00:00+03:00')
            ->assertJsonPath('hours.0.id', 1)
            ->assertJsonPath('hours.0.enabled', false)
            ->assertJsonPath('hours.0.open', 540)
            ->assertJsonPath('hours.0.close', 1140);
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', $response->json('customers.0.revision'));
        $this->assertSame(0, Setting::query()->whereNull('site')->count());
    }

    public function test_state_reports_split_working_days_instead_of_collapsing_them(): void
    {
        Setting::query()->create([
            'site' => null,
            'hours' => [
                ['days' => ['Monday'], 'open' => '09:00', 'close' => '12:00'],
                ['days' => ['Monday'], 'open' => '13:00', 'close' => '18:00'],
            ],
        ]);

        $this->desktop()->getJson('/api/desktop/state')
            ->assertConflict()
            ->assertJsonPath('code', 'hours_not_roundtrippable');
    }

    public function test_customer_create_update_preserves_unexposed_fields_and_stale_revision_conflicts(): void
    {
        $created = $this->desktop()->postJson('/api/desktop/customers', [
            'name' => '  Ayşe Yılmaz  ',
            'phone' => ' 0555 ',
            'email' => ' ayse@example.com ',
            'notes' => ' ',
        ])->assertCreated()->assertJsonPath('customer.name', 'Ayşe Yılmaz');

        $customer = Customer::query()->findOrFail($created->json('customer.id'));
        $customer->forceFill([
            'instagram' => 'ayse',
            'photos' => ['customers/photo.jpg'],
        ])->save();
        $revision = $this->desktop()->getJson('/api/desktop/state')->json('customers.0.revision');

        $updated = $this->desktop()->patchJson("/api/desktop/customers/{$customer->id}", [
            'name' => 'Ayşe Kaya',
            'revision' => $revision,
        ])->assertOk()->assertJsonPath('customer.name', 'Ayşe Kaya');

        $customer->refresh();
        $this->assertSame('ayse', $customer->instagram);
        $this->assertSame(['customers/photo.jpg'], $customer->photos);

        // Revision catches a same-second edit to an unexposed field too.
        $customer->forceFill(['instagram' => 'changed-elsewhere'])->save();
        $this->desktop()->patchJson("/api/desktop/customers/{$customer->id}", [
            'phone' => '0999',
            'revision' => $updated->json('customer.revision'),
        ])->assertConflict()->assertJsonPath('customer.phone', '0555');
    }

    public function test_customer_and_appointment_validation_is_bounded(): void
    {
        $this->desktop()->postJson('/api/desktop/customers', [
            'name' => '',
            'email' => 'not-email',
        ])->assertUnprocessable()->assertJsonValidationErrors(['name', 'email']);

        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:00:00',
            'duration_min' => 2,
            'status' => 'completed',
            'note' => null,
        ])->assertUnprocessable()->assertJsonValidationErrors(['starts_at', 'duration_min', 'status']);
    }

    public function test_confirmed_create_uses_timezone_hours_and_ignores_cancelled_appointments_for_overlap(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'cancelled',
        ]);

        $created = $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T07:00:00Z',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
        ])->assertCreated()->assertJsonPath('appointment.starts_at', '2026-09-14T10:00:00+03:00');

        $this->assertDatabaseHas('appointments', [
            'id' => $created->json('appointment.id'),
            'starts_at' => '2026-09-14 10:00:00',
        ]);
        $stateAppointment = $this->desktop()->getJson('/api/desktop/state')
            ->collect('appointments')
            ->firstWhere('id', $created->json('appointment.id'));
        $this->assertSame($created->json('appointment.revision'), $stateAppointment['revision']);

        $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:30:00+03:00',
            'duration_min' => 30,
            'status' => 'confirmed',
            'note' => null,
        ])->assertUnprocessable()->assertJsonValidationErrors('starts_at');

        $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T09:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
        ])->assertUnprocessable()->assertJsonValidationErrors('starts_at');
    }

    public function test_strict_dates_and_malformed_server_hours_return_validation_errors(): void
    {
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        Setting::query()->create([
            'site' => null,
            'hours' => [['days' => 'Monday', 'open' => 'bad', 'close' => '19:00']],
        ]);
        $payload = [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
        ];

        $this->desktop()->postJson('/api/desktop/appointments', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('starts_at');

        $payload['starts_at'] = '2026-02-30T10:00:00+03:00';
        $this->desktop()->postJson('/api/desktop/appointments', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('starts_at');

        $payload['starts_at'] = '2026-09-14T10:00:00+14:30';
        $this->desktop()->postJson('/api/desktop/appointments', $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('starts_at');
    }

    public function test_notes_and_cancellation_do_not_revalidate_unchanged_legacy_time(): void
    {
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $appointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14 03:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);
        $revision = $this->appointmentRevision($appointment);

        $noted = $this->desktop()->patchJson("/api/desktop/appointments/{$appointment->id}", [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T03:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => 'Legacy booking',
            'revision' => $revision,
        ])->assertOk();

        $this->desktop()->patchJson("/api/desktop/appointments/{$appointment->id}", [
            'status' => 'cancelled',
            'revision' => $noted->json('appointment.revision'),
        ])->assertOk()->assertJsonPath('appointment.status', 'cancelled');
    }

    public function test_appointment_patch_has_revision_conflict_and_schedule_checks_only_relevant_changes(): void
    {
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $appointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14 11:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);
        $revision = $this->appointmentRevision($appointment);

        $appointment->forceFill(['photos' => ['appointments/new.jpg']])->save();
        $this->desktop()->patchJson("/api/desktop/appointments/{$appointment->id}", [
            'note' => 'stale',
            'revision' => $revision,
        ])->assertConflict()->assertJsonPath('appointment.note', null);

        $freshRevision = $this->appointmentRevision($appointment->refresh());
        $this->desktop()->patchJson("/api/desktop/appointments/{$appointment->id}", [
            'starts_at' => '2026-09-14T03:00:00+03:00',
            'revision' => $freshRevision,
        ])->assertUnprocessable()->assertJsonValidationErrors('starts_at');
    }

    public function test_package_edit_resyncs_root_fields_and_preserves_money_photos_campaign_and_app_links(): void
    {
        $this->mondayHours();
        $appUser = AppUser::query()->create([
            'name' => 'Customer',
            'email' => 'customer@example.com',
            'password' => 'password',
        ]);
        $customer = Customer::query()->create(['name' => 'First']);
        $newCustomer = Customer::query()->create(['name' => 'Second']);
        $service = Service::factory()->create();
        $newService = Service::factory()->create();
        $campaign = Campaign::query()->create(['title' => 'Promo']);
        $root = Appointment::query()->create([
            'customer_id' => $customer->id,
            'app_user_id' => $appUser->id,
            'service_id' => $service->id,
            'campaign_id' => $campaign->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'price' => '1500.00',
            'is_paid' => true,
            'payment_method' => 'kart',
            'photos' => ['appointments/before.jpg'],
            'status' => 'confirmed',
        ]);
        AppointmentSessions::split($root, 2, 7);

        $this->desktop()->patchJson("/api/desktop/appointments/{$root->id}", [
            'customer_id' => $newCustomer->id,
            'service_id' => $newService->id,
            'revision' => $this->appointmentRevision($root->refresh()),
        ])->assertOk();

        $sessions = AppointmentSessions::all($root->refresh());
        $this->assertSame([$newCustomer->id, $newCustomer->id], $sessions->pluck('customer_id')->all());
        $this->assertSame([$newService->id, $newService->id], $sessions->pluck('service_id')->all());
        $root->refresh();
        $this->assertSame('1500.00', $root->price);
        $this->assertTrue($root->is_paid);
        $this->assertSame('kart', $root->payment_method);
        $this->assertSame(['appointments/before.jpg'], $root->photos);
        $this->assertSame($campaign->id, $root->campaign_id);
        $this->assertSame($appUser->id, $root->app_user_id);

        $child = $sessions->last();
        $this->desktop()->patchJson("/api/desktop/appointments/{$child->id}", [
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'note' => 'Session note',
            'revision' => $this->appointmentRevision($child),
        ])->assertOk();
        $this->assertSame($newCustomer->id, $child->refresh()->customer_id);
        $this->assertSame($newService->id, $child->service_id);
    }

    public function test_hours_update_uses_expected_value_and_preserves_other_settings_and_sites(): void
    {
        $main = Setting::query()->create([
            'site' => null,
            'phone' => '0500',
            'hours' => [['days' => ['Monday'], 'open' => '10:00', 'close' => '19:00']],
        ]);
        $microsite = Setting::query()->create([
            'site' => 'microblading-ankara',
            'phone' => '0999',
            'hours' => [['days' => ['Tuesday'], 'open' => '11:00', 'close' => '17:00']],
        ]);
        $expected = $this->desktop()->getJson('/api/desktop/state')->json('hours');
        $hours = $expected;
        $hours[1] = ['id' => 2, 'enabled' => true, 'open' => 660, 'close' => 1080];

        $response = $this->desktop()->putJson('/api/desktop/hours', [
            'hours' => $hours,
            'expected_hours' => $expected,
        ])->assertOk()->assertJsonPath('hours.1.open', 660);

        $this->assertSame('0500', $main->refresh()->phone);
        $this->assertSame('0999', $microsite->refresh()->phone);
        $this->assertSame('11:00', $microsite->hours[0]['open']);

        $this->desktop()->putJson('/api/desktop/hours', [
            'hours' => $expected,
            'expected_hours' => $expected,
        ])->assertConflict()->assertJsonPath('hours.1.open', $response->json('hours.1.open'));
    }

    public function test_hours_reject_invalid_ranges_and_noncanonical_closed_days(): void
    {
        $hours = $this->closedHours();
        $hours[0] = ['id' => 1, 'enabled' => true, 'open' => 900, 'close' => 800];

        $this->desktop()->putJson('/api/desktop/hours', [
            'hours' => $hours,
            'expected_hours' => $this->closedHours(),
        ])->assertUnprocessable()->assertJsonValidationErrors('hours');

        $hours = $this->closedHours();
        $hours[0]['open'] = 600;
        $this->desktop()->putJson('/api/desktop/hours', [
            'hours' => $hours,
            'expected_hours' => $this->closedHours(),
        ])->assertUnprocessable()->assertJsonValidationErrors('hours');
    }

    public function test_create_splits_into_numbered_package_with_interval(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $service = Service::factory()->create();

        $response = $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
            'session_total' => 4,
            'interval_days' => 28,
        ])->assertCreated()
            ->assertJsonPath('appointment.session_no', 1)
            ->assertJsonPath('appointment.session_total', 4)
            ->assertJsonPath('appointment.parent_id', null)
            ->assertJsonCount(4, 'appointments');

        $rootId = $response->json('appointment.id');
        $members = $response->json('appointments');
        $this->assertSame([1, 2, 3, 4], array_column($members, 'session_no'));
        $this->assertSame([4, 4, 4, 4], array_column($members, 'session_total'));
        $this->assertSame([null, $rootId, $rootId, $rootId], array_column($members, 'parent_id'));
        $this->assertSame([
            '2026-09-14T10:00:00+03:00',
            '2026-10-12T10:00:00+03:00',
            '2026-11-09T10:00:00+03:00',
            '2026-12-07T10:00:00+03:00',
        ], array_column($members, 'starts_at'));
        $this->assertDatabaseCount('appointments', 4);
    }

    public function test_create_rejects_out_of_range_session_total(): void
    {
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);

        $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
            'session_total' => 13,
        ])->assertUnprocessable()->assertJsonValidationErrors('session_total');

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_create_package_rolls_back_when_a_session_overlaps_confirmed(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        // Blocker overlaps session 2 (2026-10-12 10:00-11:00).
        Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-10-12 10:30:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);

        $response = $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
            'session_total' => 4,
            'interval_days' => 28,
        ])->assertUnprocessable()->assertJsonValidationErrors('starts_at');

        $this->assertStringStartsWith(
            '2. seans (12.10.2026 10:00):',
            $response->json('errors.starts_at.0'),
        );
        // Only the pre-existing blocker survives; the package was rolled back.
        $this->assertDatabaseCount('appointments', 1);
    }

    public function test_add_session_appends_with_revision_guard(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $appointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);
        $revision = $this->appointmentRevision($appointment);

        $this->desktop()->postJson("/api/desktop/appointments/{$appointment->id}/sessions", [
            'revision' => str_repeat('0', 64),
            'interval_days' => 28,
        ])->assertStatus(409)->assertJsonPath('appointment.id', $appointment->id);
        $this->assertDatabaseCount('appointments', 1);

        $this->desktop()->postJson("/api/desktop/appointments/{$appointment->id}/sessions", [
            'revision' => $revision,
            'interval_days' => 28,
        ])->assertCreated()
            ->assertJsonPath('appointment.session_no', 2)
            ->assertJsonPath('appointment.starts_at', '2026-10-12T10:00:00+03:00')
            ->assertJsonCount(2, 'appointments');
        $this->assertDatabaseCount('appointments', 2);
    }

    public function test_delete_middle_session_renumbers_package(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $root = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);
        AppointmentSessions::split($root, 4, 28);
        $middle = AppointmentSessions::all($root)[1];
        $revision = $this->appointmentRevision($middle);

        $response = $this->desktop()->deleteJson("/api/desktop/appointments/{$middle->id}", [
            'revision' => $revision,
        ])->assertOk()
            ->assertJsonPath('deleted_id', $middle->id)
            ->assertJsonCount(3, 'appointments');

        $remaining = $response->json('appointments');
        $this->assertSame([1, 2, 3], array_column($remaining, 'session_no'));
        $this->assertSame([3, 3, 3], array_column($remaining, 'session_total'));
        $this->assertDatabaseMissing('appointments', ['id' => $middle->id]);
        $this->assertDatabaseCount('appointments', 3);
    }

    public function test_delete_root_transfers_money_to_new_root(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $root = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'price' => '1500.00',
            'is_paid' => true,
            'payment_method' => 'kart',
        ]);
        AppointmentSessions::split($root, 3, 28);
        $revision = $this->appointmentRevision($root->refresh());

        $response = $this->desktop()->deleteJson("/api/desktop/appointments/{$root->id}", [
            'revision' => $revision,
        ])->assertOk()
            ->assertJsonPath('deleted_id', $root->id)
            ->assertJsonCount(2, 'appointments');

        $members = $response->json('appointments');
        $this->assertSame([1, 2], array_column($members, 'session_no'));
        $this->assertNull($members[0]['parent_id']);

        $newRoot = Appointment::query()->find($members[0]['id']);
        $this->assertSame('1500.00', $newRoot->price);
        $this->assertTrue($newRoot->is_paid);
        $this->assertSame('kart', $newRoot->payment_method);
        $this->assertDatabaseMissing('appointments', ['id' => $root->id]);
    }

    public function test_delete_single_appointment_removes_it(): void
    {
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $appointment = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);
        $revision = $this->appointmentRevision($appointment);

        $this->desktop()->deleteJson("/api/desktop/appointments/{$appointment->id}", [
            'revision' => $revision,
        ])->assertOk()
            ->assertJsonPath('deleted_id', $appointment->id)
            ->assertJsonCount(0, 'appointments');
        $this->assertDatabaseCount('appointments', 0);
    }

    private function desktop()
    {
        $user = User::factory()->create();

        return $this->withToken(
            $user->createToken('desktop-test', ['desktop:manage'], now()->addDay())->plainTextToken,
        );
    }

    private function mondayHours(): Setting
    {
        return Setting::query()->create([
            'site' => null,
            'hours' => [['days' => ['Monday'], 'open' => '10:00', 'close' => '19:00']],
        ]);
    }

    private function appointmentRevision(Appointment $appointment): string
    {
        return $this->desktop()->getJson('/api/desktop/state')
            ->collect('appointments')
            ->firstWhere('id', $appointment->id)['revision'];
    }

    /** @return array<int, array{id:int, enabled:bool, open:int, close:int}> */
    private function closedHours(): array
    {
        return collect(range(1, 7))->map(fn (int $id): array => [
            'id' => $id,
            'enabled' => false,
            'open' => 540,
            'close' => 1140,
        ])->all();
    }
}
