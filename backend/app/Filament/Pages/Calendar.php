<?php

namespace App\Filament\Pages;

use App\Models\Appointment;
use App\Models\Customer;
use App\Models\Service;
use BackedEnum;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Support\Enums\Width;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Livewire\WithFileUploads;
use Throwable;

class Calendar extends Page
{
    use WithFileUploads;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;

    protected static ?string $navigationLabel = 'Takvim';

    protected static ?int $navigationSort = 1;

    protected static ?string $title = 'Takvim';

    protected string $view = 'filament.pages.calendar';

    protected Width|string|null $maxContentWidth = Width::Full;

    public string $month = '';

    public bool $showAppointmentModal = false;

    public bool $creatingCustomer = false;

    public ?int $editingAppointmentId = null;

    public string $appointmentStatus = 'confirmed';

    public ?int $customerId = null;

    public ?int $serviceId = null;

    public string $newCustomerName = '';

    public string $newCustomerPhone = '';

    public string $selectedDate = '';

    public string $appointmentTime = '10:00';

    public int $durationMin = 60;

    public ?string $price = null;

    /** @var array{title: string, new_price: ?string}|null */
    public ?array $appointmentCampaign = null;

    public bool $is_paid = false;

    public ?string $payment_method = null;

    public string $note = '';

    public array $newPhotos = [];

    public array $appointmentPhotos = [];

    public ?int $customerDoneCount = null;

    public ?int $appointmentSequence = null;

    public function mount(): void
    {
        $this->month = now()->format('Y-m');
    }

    public function getHeading(): ?string
    {
        return null;
    }

    public function prevMonth(): void
    {
        $this->month = $this->monthDate()->subMonth()->format('Y-m');
    }

    public function nextMonth(): void
    {
        $this->month = $this->monthDate()->addMonth()->format('Y-m');
    }

    public function goToday(): void
    {
        $this->month = now()->format('Y-m');
    }

    public function openCreateModal(string $date): void
    {
        if (! $this->isValidDate($date)) {
            return;
        }

        $this->resetAppointmentForm();
        $this->selectedDate = $date;
        $this->showAppointmentModal = true;
    }

    public function openEditModal(int $appointmentId): void
    {
        $appointment = Appointment::query()->with('campaign:id,title,new_price')->findOrFail($appointmentId);

        $this->resetAppointmentForm();
        $this->editingAppointmentId = $appointment->id;
        $this->appointmentStatus = $appointment->status;
        $this->customerId = $appointment->customer_id;
        $this->serviceId = $appointment->service_id;
        $this->selectedDate = $appointment->starts_at->format('Y-m-d');
        $this->appointmentTime = $appointment->starts_at->format('H:i');
        $this->durationMin = $appointment->duration_min;
        $this->price = $appointment->price;
        if ($appointment->campaign !== null) {
            $newPrice = $appointment->campaign->new_price !== null
                ? (string) $appointment->campaign->new_price
                : null;
            $this->appointmentCampaign = [
                'title' => $appointment->campaign->title,
                'new_price' => $newPrice,
            ];
            if (blank($this->price) && filled($newPrice)) {
                $this->price = $newPrice;
            }
        }
        $this->is_paid = $appointment->is_paid;
        $this->payment_method = $appointment->payment_method;
        $this->note = $appointment->note ?? '';
        $this->creatingCustomer = false;
        $this->newCustomerName = '';
        $this->newCustomerPhone = '';
        $this->appointmentPhotos = array_values($appointment->photos ?? []);
        $this->loadCustomerStats($appointment->customer_id, $appointment->starts_at);
        $this->showAppointmentModal = true;
    }

    public function closeAppointmentModal(): void
    {
        $this->showAppointmentModal = false;
        $this->resetAppointmentForm();
    }

    public function updatedNewPhotos(): void
    {
        $this->uploadAppointmentPhotos();
    }

    public function uploadAppointmentPhotos(): void
    {
        abort_unless($this->editingAppointmentId, 404);

        $this->validate([
            'newPhotos.*' => ['image', 'max:10240'],
        ]);

        $appointment = Appointment::query()->findOrFail($this->editingAppointmentId);
        $photos = array_values($appointment->photos ?? []);

        foreach ($this->newPhotos as $photo) {
            $photos[] = $photo->store('appointments', 'public');
        }

        $appointment->photos = $photos;
        $appointment->save();

        $this->appointmentPhotos = array_values($appointment->fresh()->photos ?? []);
        $this->newPhotos = [];

        Notification::make()
            ->title('Fotoğraflar eklendi')
            ->success()
            ->send();
    }

    public function removeAppointmentPhoto(int $index): void
    {
        abort_unless($this->editingAppointmentId, 404);

        $appointment = Appointment::query()->findOrFail($this->editingAppointmentId);
        $photos = array_values($appointment->photos ?? []);

        if (! array_key_exists($index, $photos)) {
            return;
        }

        $path = $photos[$index];
        unset($photos[$index]);
        $photos = array_values($photos);

        $appointment->photos = $photos;
        $appointment->save();

        if (is_string($path) && str_starts_with($path, 'appointments/')) {
            Storage::disk('public')->delete($path);
        }

        $this->appointmentPhotos = $photos;
    }

    public function useNewCustomer(): void
    {
        $this->creatingCustomer = true;
        $this->customerId = null;
        $this->resetValidation(['customerId', 'newCustomerName']);
    }

    public function useExistingCustomer(): void
    {
        $this->creatingCustomer = false;
        $this->newCustomerName = '';
        $this->newCustomerPhone = '';
        $this->resetValidation(['customerId', 'newCustomerName']);
    }

    public function createAppointment(): void
    {
        $this->validateAppointment();

        DB::transaction(function (): void {
            Appointment::query()->create([
                'customer_id' => $this->resolveCustomerId(),
                'service_id' => $this->serviceId,
                'starts_at' => $this->appointmentStartsAt(),
                'duration_min' => $this->durationMin,
                'price' => filled($this->price) ? $this->price : null,
                'is_paid' => $this->is_paid,
                'payment_method' => $this->payment_method,
                'note' => filled($this->note) ? trim($this->note) : null,
            ]);
        });

        $this->showAppointmentModal = false;
        $this->resetAppointmentForm();

        Notification::make()
            ->title('Randevu eklendi')
            ->success()
            ->send();
    }

    public function updateAppointment(): void
    {
        abort_unless($this->editingAppointmentId, 404);

        $this->validateAppointment();

        DB::transaction(function (): void {
            Appointment::query()->findOrFail($this->editingAppointmentId)->update([
                'customer_id' => $this->resolveCustomerId(),
                'service_id' => $this->serviceId,
                'starts_at' => $this->appointmentStartsAt(),
                'duration_min' => $this->durationMin,
                'price' => filled($this->price) ? $this->price : null,
                'is_paid' => $this->is_paid,
                'payment_method' => $this->payment_method,
                'note' => filled($this->note) ? trim($this->note) : null,
            ]);
        });

        $this->showAppointmentModal = false;
        $this->resetAppointmentForm();

        Notification::make()
            ->title('Randevu güncellendi')
            ->success()
            ->send();
    }

    public function deleteAppointment(): void
    {
        abort_unless($this->editingAppointmentId, 404);

        Appointment::query()->findOrFail($this->editingAppointmentId)->delete();
        $this->showAppointmentModal = false;
        $this->resetAppointmentForm();

        Notification::make()
            ->title('Randevu silindi')
            ->success()
            ->send();
    }

    public function approveRequest(): void
    {
        abort_unless($this->editingAppointmentId && $this->appointmentStatus === 'requested', 404);

        Appointment::query()->findOrFail($this->editingAppointmentId)->update([
            'status' => 'confirmed',
        ]);
        $this->showAppointmentModal = false;
        $this->resetAppointmentForm();

        Notification::make()
            ->title('Randevu talebi onaylandı')
            ->success()
            ->send();
    }

    public function rejectRequest(): void
    {
        abort_unless($this->editingAppointmentId && $this->appointmentStatus === 'requested', 404);

        Appointment::query()->findOrFail($this->editingAppointmentId)->update([
            'status' => 'cancelled',
        ]);
        $this->showAppointmentModal = false;
        $this->resetAppointmentForm();

        Notification::make()
            ->title('Randevu talebi reddedildi')
            ->success()
            ->send();
    }

    public function markNoShow(): void
    {
        abort_unless($this->editingAppointmentId && $this->appointmentStatus === 'confirmed', 404);

        Appointment::query()->findOrFail($this->editingAppointmentId)->update([
            'status' => 'no_show',
        ]);
        $this->showAppointmentModal = false;
        $this->resetAppointmentForm();

        Notification::make()
            ->title('Gelmedi olarak işaretlendi')
            ->success()
            ->send();
    }

    public function markAttended(): void
    {
        abort_unless($this->editingAppointmentId && $this->appointmentStatus === 'no_show', 404);

        Appointment::query()->findOrFail($this->editingAppointmentId)->update([
            'status' => 'confirmed',
        ]);
        $this->showAppointmentModal = false;
        $this->resetAppointmentForm();

        Notification::make()
            ->title('Geldi olarak işaretlendi')
            ->success()
            ->send();
    }

    /**
     * @return array<string, mixed>
     */
    protected function getViewData(): array
    {
        $month = $this->monthDate();

        return [
            'calendarDays' => $this->calendarDays($month),
            'customers' => Customer::query()
                ->orderBy('name')
                ->get(['id', 'name', 'phone'])
                ->map(fn (Customer $customer): array => [
                    'id' => $customer->id,
                    'name' => $customer->name,
                    'phone' => $customer->phone,
                ])
                ->values()
                ->all(),
            'selectedCustomerName' => $this->customerId
                ? Customer::query()->whereKey($this->customerId)->value('name') ?? ''
                : '',
            'services' => Service::query()
                ->where('is_active', true)
                ->orderBy('sort_order')
                ->pluck('name_tr', 'id')
                ->all(),
            'monthName' => $this->turkishMonthName($month->month),
            'monthYear' => $month->year,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function calendarDays(CarbonImmutable $month): array
    {
        $gridStart = $month->startOfWeek(CarbonInterface::MONDAY);
        $gridEnd = $month->endOfMonth()->endOfWeek(CarbonInterface::SUNDAY);
        $appointments = Appointment::query()
            ->with(['customer:id,name,app_user_id'])
            ->whereBetween('starts_at', [$gridStart->startOfDay(), $gridEnd->endOfDay()])
            ->orderBy('starts_at')
            ->get()
            ->groupBy(fn (Appointment $appointment): string => $appointment->starts_at->format('Y-m-d'));

        $days = [];

        for ($date = $gridStart; $date->lte($gridEnd); $date = $date->addDay()) {
            $dateKey = $date->format('Y-m-d');
            $dayAppointments = $appointments->get($dateKey, collect())
                ->map(fn (Appointment $appointment): array => [
                    'id' => $appointment->id,
                    'time' => $appointment->starts_at->format('H:i'),
                    'customer' => $this->shortCustomerName($appointment->customer?->name),
                    'is_paid' => $appointment->is_paid,
                    'status' => $appointment->status,
                    'has_app_user' => filled($appointment->customer?->app_user_id),
                ])
                ->values()
                ->all();

            $days[] = [
                'date' => $dateKey,
                'day' => $date->day,
                'isCurrentMonth' => $date->month === $month->month,
                'isToday' => $date->isToday(),
                'appointments' => $dayAppointments,
                'overflow' => max(count($dayAppointments) - 3, 0),
            ];
        }

        return $days;
    }

    private function monthDate(): CarbonImmutable
    {
        if (preg_match('/^(\d{4})-(\d{2})$/', $this->month, $matches)) {
            $year = (int) $matches[1];
            $month = (int) $matches[2];

            if (checkdate($month, 1, $year)) {
                return CarbonImmutable::create($year, $month, 1)->startOfDay();
            }
        }

        return CarbonImmutable::now()->startOfMonth();
    }

    private function validateAppointment(): void
    {
        $rules = [
            'selectedDate' => ['required', 'date_format:Y-m-d'],
            'appointmentTime' => ['required', 'date_format:H:i'],
            'durationMin' => ['required', 'integer', 'min:5', 'max:1440'],
            'serviceId' => ['nullable', 'integer', 'exists:services,id'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'is_paid' => ['boolean'],
            'payment_method' => ['nullable', 'in:nakit,kart,havale'],
            'note' => ['nullable', 'string'],
            'newCustomerPhone' => ['nullable', 'string', 'max:255'],
        ];

        if ($this->creatingCustomer) {
            $rules['newCustomerName'] = ['required', 'string', 'max:255'];
            $rules['customerId'] = ['nullable'];
        } else {
            $rules['customerId'] = ['required', 'integer', 'exists:customers,id'];
            $rules['newCustomerName'] = ['nullable'];
        }

        $this->validate($rules, attributes: [
            'selectedDate' => 'tarih',
            'appointmentTime' => 'saat',
            'durationMin' => 'süre',
            'serviceId' => 'hizmet',
            'customerId' => 'müşteri',
            'newCustomerName' => 'yeni müşteri adı',
            'newCustomerPhone' => 'telefon',
            'price' => 'fiyat',
            'is_paid' => 'ödeme durumu',
            'payment_method' => 'ödeme yöntemi',
            'note' => 'not',
        ]);

        if (! $this->is_paid) {
            $this->payment_method = null;
        }
    }

    private function resolveCustomerId(): int
    {
        if (! $this->creatingCustomer) {
            return (int) $this->customerId;
        }

        return Customer::query()->create([
            'name' => trim($this->newCustomerName),
            'phone' => filled($this->newCustomerPhone) ? trim($this->newCustomerPhone) : null,
        ])->id;
    }

    private function appointmentStartsAt(): CarbonImmutable
    {
        return CarbonImmutable::createFromFormat(
            '!Y-m-d H:i',
            "{$this->selectedDate} {$this->appointmentTime}",
        );
    }

    private function resetAppointmentForm(): void
    {
        $this->resetValidation();
        $this->editingAppointmentId = null;
        $this->appointmentStatus = 'confirmed';
        $this->customerId = null;
        $this->serviceId = null;
        $this->creatingCustomer = false;
        $this->newCustomerName = '';
        $this->newCustomerPhone = '';
        $this->appointmentTime = '10:00';
        $this->durationMin = 60;
        $this->price = null;
        $this->appointmentCampaign = null;
        $this->is_paid = false;
        $this->payment_method = null;
        $this->note = '';
        $this->newPhotos = [];
        $this->appointmentPhotos = [];
        $this->customerDoneCount = null;
        $this->appointmentSequence = null;
    }

    private function loadCustomerStats(?int $customerId, ?CarbonInterface $startsAt): void
    {
        if (! $customerId) {
            $this->customerDoneCount = null;
            $this->appointmentSequence = null;

            return;
        }

        $this->customerDoneCount = Appointment::query()
            ->where('customer_id', $customerId)
            ->where('status', 'confirmed')
            ->where('starts_at', '<', now())
            ->count();

        $this->appointmentSequence = $startsAt
            ? Appointment::query()
                ->where('customer_id', $customerId)
                ->where('status', 'confirmed')
                ->where('starts_at', '<', $startsAt)
                ->count() + 1
            : null;
    }

    private function isValidDate(string $date): bool
    {
        try {
            $parsed = CarbonImmutable::createFromFormat('!Y-m-d', $date);
        } catch (Throwable) {
            return false;
        }

        return $parsed->format('Y-m-d') === $date;
    }

    private function shortCustomerName(?string $name): string
    {
        if (blank($name)) {
            return 'Müşteri silindi';
        }

        $parts = preg_split('/\s+/u', trim($name)) ?: [];

        if (count($parts) === 1) {
            return $parts[0];
        }

        return $parts[0].' '.mb_strtoupper(mb_substr($parts[count($parts) - 1], 0, 1)).'.';
    }

    private function turkishMonthName(int $month): string
    {
        return [
            1 => 'Ocak',
            2 => 'Şubat',
            3 => 'Mart',
            4 => 'Nisan',
            5 => 'Mayıs',
            6 => 'Haziran',
            7 => 'Temmuz',
            8 => 'Ağustos',
            9 => 'Eylül',
            10 => 'Ekim',
            11 => 'Kasım',
            12 => 'Aralık',
        ][$month];
    }
}
