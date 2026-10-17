<?php

namespace Tests\Feature;

use App\Filament\Pages\Calendar;
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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;
use Livewire\Livewire;
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

    public function test_confirmed_create_allows_any_time_and_ignores_cancelled_appointments_for_overlap(): void
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

        // Outside working hours and on a closed day (only Monday is open) are allowed.
        $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T08:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
        ])->assertCreated();
        $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-15T22:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
        ])->assertCreated();
    }

    public function test_strict_dates_return_validation_errors(): void
    {
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $payload = [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
        ];

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

    public function test_appointment_patch_has_revision_conflict_and_allows_moving_outside_hours(): void
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
        ])->assertOk()->assertJsonPath('appointment.starts_at', '2026-09-14T03:00:00+03:00');
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

    public function test_create_package_with_custom_session_starts(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);

        $response = $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
            'session_total' => 3,
            'interval_days' => 28,
            'session_starts' => ['2026-09-21T12:00:00+03:00', '2026-11-02T08:00:00Z'],
        ])->assertCreated()->assertJsonCount(3, 'appointments');

        $members = $response->json('appointments');
        $this->assertSame([1, 2, 3], array_column($members, 'session_no'));
        $this->assertSame([3, 3, 3], array_column($members, 'session_total'));
        $this->assertSame([
            '2026-09-14T10:00:00+03:00',
            '2026-09-21T12:00:00+03:00',
            '2026-11-02T11:00:00+03:00',
        ], array_column($members, 'starts_at'));
        $this->assertDatabaseCount('appointments', 3);
    }

    public function test_create_rejects_invalid_session_starts(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $base = [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
            'session_total' => 3,
        ];

        foreach ([
            'wrong length' => ['2026-09-21T10:00:00+03:00'],
            'single appointment' => ['session_total' => 1, 'session_starts' => []],
            'not after root' => ['2026-09-14T10:00:00+03:00', '2026-09-28T10:00:00+03:00'],
            'non-increasing' => ['2026-09-28T10:00:00+03:00', '2026-09-21T10:00:00+03:00'],
            'equal to previous' => ['2026-09-21T10:00:00+03:00', '2026-09-21T10:00:00+03:00'],
            'no timezone' => ['2026-09-21T10:00:00', '2026-09-28T10:00:00+03:00'],
        ] as $input) {
            $payload = array_key_exists('session_starts', $input)
                ? [...$base, ...$input]
                : [...$base, 'session_starts' => $input];

            $this->desktop()->postJson('/api/desktop/appointments', $payload)
                ->assertUnprocessable()
                ->assertJsonValidationErrors('session_starts');
        }

        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_create_package_with_custom_starts_rolls_back_on_overlap(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        // Blocker overlaps the custom session 2 (2026-09-21 10:00-11:00).
        Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-21 10:30:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);

        $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'service_id' => null,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            'note' => null,
            'session_total' => 2,
            'session_starts' => ['2026-09-21T10:00:00+03:00'],
        ])->assertUnprocessable()->assertJsonValidationErrors('starts_at');

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

    public function test_create_stores_price_on_single_appointment_and_package_root_only(): void
    {
        CarbonImmutable::setTestNow('2026-09-13 09:00:00');
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $payload = [
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'requested',
        ];

        $single = $this->desktop()->postJson('/api/desktop/appointments', $payload + ['price' => 1500.5])
            ->assertCreated()
            ->assertJsonPath('appointment.price', 1500.5);
        $this->assertSame('1500.50', Appointment::query()->find($single->json('appointment.id'))->price);
        $this->desktop()->getJson('/api/desktop/state')
            ->assertJsonPath('appointments.0.price', 1500.5);

        $package = $this->desktop()->postJson('/api/desktop/appointments', [
            ...$payload,
            'starts_at' => '2026-09-14T15:00:00+03:00',
            'price' => 3000,
            'session_total' => 3,
        ])->assertCreated()
            ->assertJsonPath('appointment.price', 3000);
        $this->assertSame([3000, null, null], array_column($package->json('appointments'), 'price'));
    }

    public function test_patch_price_updates_and_clears_root_and_rejects_child(): void
    {
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $root = Appointment::query()->create([
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
        ]);
        AppointmentSessions::split($root, 2, 28);

        $this->desktop()->patchJson("/api/desktop/appointments/{$root->id}", [
            'price' => 2500,
            'revision' => $this->appointmentRevision($root->refresh()),
        ])->assertOk()->assertJsonPath('appointment.price', 2500);
        $this->assertSame('2500.00', $root->refresh()->price);

        $this->desktop()->patchJson("/api/desktop/appointments/{$root->id}", [
            'price' => null,
            'revision' => $this->appointmentRevision($root),
        ])->assertOk()->assertJsonPath('appointment.price', null);
        $this->assertNull($root->refresh()->price);

        $child = AppointmentSessions::all($root)->last();
        $this->desktop()->patchJson("/api/desktop/appointments/{$child->id}", [
            'price' => 100,
            'revision' => $this->appointmentRevision($child),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['price' => 'Paket fiyatı 1. seansta düzenlenir.']);
        $this->assertNull($child->refresh()->price);
    }

    public function test_negative_price_is_rejected(): void
    {
        $this->mondayHours();
        $customer = Customer::query()->create(['name' => 'Ayşe']);

        $this->desktop()->postJson('/api/desktop/appointments', [
            'customer_id' => $customer->id,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'requested',
            'price' => -1,
        ])->assertUnprocessable()->assertJsonValidationErrors('price');
        $this->assertDatabaseCount('appointments', 0);
    }

    public function test_photos_upload_appends_and_returns_urls(): void
    {
        Storage::fake('public');
        $appointment = $this->plainAppointment(['photos' => ['appointments/old.jpg']]);

        $response = $this->desktop()->post("/api/desktop/appointments/{$appointment->id}/photos", [
            'photos' => [UploadedFile::fake()->image('a.jpg'), UploadedFile::fake()->image('b.png')],
        ], ['Accept' => 'application/json'])->assertCreated();

        $photos = $appointment->refresh()->photos;
        $this->assertCount(3, $photos);
        $this->assertSame('appointments/old.jpg', $photos[0]);
        Storage::disk('public')->assertExists([$photos[1], $photos[2]]);
        $this->assertSame(
            array_map(fn (string $p): string => asset('storage/'.$p), $photos),
            $response->json('appointment.photos'),
        );
        $this->desktop()->getJson('/api/desktop/state')
            ->assertJsonPath('appointments.0.photos.0', asset('storage/appointments/old.jpg'));

        $this->desktop()->post("/api/desktop/appointments/{$appointment->id}/photos", [
            'photos' => [UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf')],
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('photos.0');
        $this->assertCount(3, $appointment->refresh()->photos);

        $this->desktop()->post('/api/desktop/appointments/999999/photos', [
            'photos' => [UploadedFile::fake()->image('c.jpg')],
        ], ['Accept' => 'application/json'])->assertNotFound();
    }

    public function test_photo_delete_by_index_removes_file_and_reindexes_with_revision_guard(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('appointments/a.jpg', 'a');
        Storage::disk('public')->put('appointments/b.jpg', 'b');
        $appointment = $this->plainAppointment(['photos' => ['appointments/a.jpg', 'appointments/b.jpg']]);
        $url = "/api/desktop/appointments/{$appointment->id}/photos";

        $this->desktop()->deleteJson("{$url}/0", ['revision' => str_repeat('0', 64)])
            ->assertConflict()
            ->assertJsonPath('appointment.id', $appointment->id);
        $this->assertCount(2, $appointment->refresh()->photos);

        $this->desktop()->deleteJson("{$url}/5", ['revision' => $this->appointmentRevision($appointment)])
            ->assertNotFound();

        $this->desktop()->deleteJson("{$url}/0", ['revision' => $this->appointmentRevision($appointment)])
            ->assertOk()
            ->assertJsonPath('appointment.photos', [asset('storage/appointments/b.jpg')]);
        $this->assertSame(['appointments/b.jpg'], $appointment->refresh()->photos);
        Storage::disk('public')->assertMissing('appointments/a.jpg');
        Storage::disk('public')->assertExists('appointments/b.jpg');
    }

    public function test_state_exposes_service_subservices(): void
    {
        $this->subserviceService();
        Service::factory()->create(['name_tr' => 'Microblading', 'sort_order' => 2]);

        $this->desktop()->getJson('/api/desktop/state')
            ->assertJsonPath('services.0.subservices', ['Çatlak Gizleme', 'Yanık İzi'])
            ->assertJsonPath('services.1.subservices', []);
    }

    public function test_create_stores_subservices_on_package_and_rejects_invalid_names(): void
    {
        $this->mondayHours();
        $service = $this->subserviceService();
        $other = Service::factory()->create();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $payload = [
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'requested',
        ];

        $package = $this->desktop()->postJson('/api/desktop/appointments', $payload + [
            'subservices' => ['Yanık İzi', 'Çatlak Gizleme'],
            'session_total' => 3,
        ])->assertCreated();
        $this->assertSame(
            array_fill(0, 3, ['Çatlak Gizleme', 'Yanık İzi']),
            array_column($package->json('appointments'), 'subservices'),
        );

        $this->desktop()->postJson('/api/desktop/appointments', $payload + ['subservices' => ['Dövme']])
            ->assertUnprocessable()->assertJsonValidationErrors('subservices');
        $this->desktop()->postJson('/api/desktop/appointments', [
            ...$payload,
            'service_id' => $other->id,
            'subservices' => ['Yanık İzi'],
        ])->assertUnprocessable()->assertJsonValidationErrors('subservices');
        $this->assertDatabaseCount('appointments', 3);

        $this->desktop()->postJson('/api/desktop/appointments', [...$payload, 'service_id' => $other->id, 'subservices' => []])
            ->assertCreated()->assertJsonPath('appointment.subservices', []);
    }

    public function test_patch_subservices_on_root_propagates_rejects_child_and_service_change_clears(): void
    {
        $this->mondayHours();
        $service = $this->subserviceService();
        $other = Service::factory()->create();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $root = Appointment::query()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'requested',
        ]);
        AppointmentSessions::split($root, 2, 28);
        $child = AppointmentSessions::all($root)->last();

        $this->desktop()->patchJson("/api/desktop/appointments/{$root->id}", [
            'subservices' => ['Yanık İzi'],
            'revision' => $this->appointmentRevision($root->refresh()),
        ])->assertOk()->assertJsonPath('appointment.subservices', ['Yanık İzi']);
        $this->assertSame(['Yanık İzi'], $child->refresh()->subservices);

        $this->desktop()->patchJson("/api/desktop/appointments/{$child->id}", [
            'subservices' => [],
            'revision' => $this->appointmentRevision($child),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['subservices' => 'Alt uygulamalar 1. seansta düzenlenir.']);

        $this->desktop()->patchJson("/api/desktop/appointments/{$root->id}", [
            'service_id' => $other->id,
            'revision' => $this->appointmentRevision($root->refresh()),
        ])->assertOk()->assertJsonPath('appointment.subservices', []);
        $this->assertNull($root->refresh()->subservices);
        $this->assertNull($child->refresh()->subservices);
    }

    public function test_state_exposes_service_slug(): void
    {
        $service = $this->subserviceService();

        $this->desktop()->getJson('/api/desktop/state')
            ->assertJsonPath('services.0.slug', $service->slug);
    }

    public function test_create_stores_body_regions_canonically_on_package_and_rejects_unknown_keys(): void
    {
        $this->mondayHours();
        $service = $this->subserviceService();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $payload = [
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-09-14T10:00:00+03:00',
            'duration_min' => 60,
            'status' => 'requested',
        ];

        $package = $this->desktop()->postJson('/api/desktop/appointments', $payload + [
            'body_regions' => ['hand_l', 'forehead', 'hand_l', 'cheek_r'],
            'session_total' => 3,
        ])->assertCreated();
        $this->assertSame(
            array_fill(0, 3, ['forehead', 'cheek_r', 'hand_l']),
            array_column($package->json('appointments'), 'body_regions'),
        );

        $this->desktop()->postJson('/api/desktop/appointments', $payload + ['body_regions' => ['forehead', 'knee']])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['body_regions' => 'Bölgeler geçerli bölge anahtarları olmalı.']);
        $this->assertDatabaseCount('appointments', 3);

        $this->desktop()->postJson('/api/desktop/appointments', $payload + ['body_regions' => []])
            ->assertCreated()->assertJsonPath('appointment.body_regions', []);
    }

    public function test_patch_body_regions_on_root_propagates_rejects_child_and_empty_clears(): void
    {
        $this->mondayHours();
        $service = $this->subserviceService();
        $other = Service::factory()->create();
        $customer = Customer::query()->create(['name' => 'Ayşe']);
        $root = Appointment::query()->create([
            'customer_id' => $customer->id,
            'service_id' => $service->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'requested',
        ]);
        AppointmentSessions::split($root, 2, 28);
        $child = AppointmentSessions::all($root)->last();

        $this->desktop()->patchJson("/api/desktop/appointments/{$root->id}", [
            'body_regions' => ['neck_back', 'nose'],
            'revision' => $this->appointmentRevision($root->refresh()),
        ])->assertOk()->assertJsonPath('appointment.body_regions', ['nose', 'neck_back']);
        $this->assertSame(['nose', 'neck_back'], $child->refresh()->body_regions);

        $this->desktop()->patchJson("/api/desktop/appointments/{$child->id}", [
            'body_regions' => [],
            'revision' => $this->appointmentRevision($child),
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['body_regions' => 'Bölgeler 1. seansta düzenlenir.']);

        $this->desktop()->patchJson("/api/desktop/appointments/{$root->id}", [
            'service_id' => $other->id,
            'revision' => $this->appointmentRevision($root->refresh()),
        ])->assertOk()->assertJsonPath('appointment.body_regions', ['nose', 'neck_back']);

        $this->desktop()->patchJson("/api/desktop/appointments/{$root->id}", [
            'body_regions' => [],
            'revision' => $this->appointmentRevision($root->refresh()),
        ])->assertOk()->assertJsonPath('appointment.body_regions', []);
        $this->assertNull($root->refresh()->body_regions);
        $this->assertNull($child->refresh()->body_regions);
    }

    public function test_panel_shows_root_body_regions_read_only(): void
    {
        $root = $this->plainAppointment(['body_regions' => ['forehead', 'hand_l']]);
        AppointmentSessions::split($root, 2, 28);
        $child = AppointmentSessions::all($root)->last();

        Livewire::actingAs(User::factory()->create())
            ->test(Calendar::class)
            ->call('openEditModal', $child->id)
            ->assertSet('bodyRegionLabels', 'Alın, Sol el')
            ->assertSee('Bölgeler')
            ->call('openEditModal', $this->plainAppointment()->id)
            ->assertSet('bodyRegionLabels', '')
            ->call('openEditModal', $root->id)
            ->call('updateAppointment');

        $this->assertSame(['forehead', 'hand_l'], $root->refresh()->body_regions);
    }

    public function test_state_exposes_service_session_price(): void
    {
        Service::factory()->create(['name_tr' => 'Kamuflaj', 'sort_order' => 1, 'session_price' => '6000.50']);
        Service::factory()->create(['name_tr' => 'Laminasyon', 'sort_order' => 2]);

        $response = $this->desktop()->getJson('/api/desktop/state')
            ->assertOk()
            ->assertJsonPath('services.0.session_price', 6000.5)
            ->assertJsonPath('services.1.session_price', null);
        $this->assertStringContainsString('"session_price":6000.5', $response->getContent());
    }

    public function test_service_prices_update_listed_services_only(): void
    {
        $a = Service::factory()->create(['sort_order' => 1, 'session_price' => 100]);
        $b = Service::factory()->create(['sort_order' => 2, 'session_price' => 200]);
        $c = Service::factory()->create(['sort_order' => 3, 'session_price' => 300]);

        $this->desktop()->putJson('/api/desktop/service-prices', [
            'prices' => [(string) $a->id => '2000', (string) $b->id => null],
        ])->assertOk()
            ->assertJsonPath('services.0.id', $a->id)
            ->assertJsonPath('services.0.session_price', 2000)
            ->assertJsonPath('services.1.session_price', null)
            ->assertJsonPath('services.2.session_price', 300);

        $this->assertSame('2000.00', $a->refresh()->session_price);
        $this->assertNull($b->refresh()->session_price);
        $this->assertSame('300.00', $c->refresh()->session_price);
        $this->desktop()->getJson('/api/desktop/state')->assertJsonPath('services.0.session_price', 2000);
    }

    public function test_service_prices_reject_unknown_ids_and_negative_values(): void
    {
        $service = Service::factory()->create(['session_price' => 100]);

        $this->desktop()->putJson('/api/desktop/service-prices', [
            'prices' => [(string) $service->id => 500, '999999' => 500],
        ])->assertUnprocessable()->assertJsonValidationErrors('prices');

        $this->desktop()->putJson('/api/desktop/service-prices', [
            'prices' => [(string) $service->id => -1],
        ])->assertUnprocessable()->assertJsonValidationErrors('prices.'.$service->id);

        $this->assertSame('100.00', $service->refresh()->session_price);
    }

    private function subserviceService(): Service
    {
        return Service::factory()->create([
            'name_tr' => 'Kamuflaj Makyaj',
            'sort_order' => 1,
            'subservices_tr' => [
                ['name' => 'Çatlak Gizleme', 'desc' => '...'],
                ['name' => 'Yanık İzi', 'desc' => '...'],
            ],
        ]);
    }

    /** @param array<string, mixed> $attributes */
    private function plainAppointment(array $attributes = []): Appointment
    {
        return Appointment::query()->create([
            'customer_id' => Customer::query()->create(['name' => 'Ayşe'])->id,
            'starts_at' => '2026-09-14 10:00:00',
            'duration_min' => 60,
            'status' => 'confirmed',
            ...$attributes,
        ]);
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
