<?php

namespace App\Http\Controllers\Musteri;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\Customer;
use App\Support\AppointmentSessions;
use Carbon\CarbonImmutable;
use Illuminate\Contracts\View\View;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CustomerController extends Controller
{
    public function index(Request $request): View
    {
        $query = Customer::query();

        if ($request->filled('q')) {
            $term = '%'.$request->string('q')->value().'%';
            $query->where(function (Builder $q) use ($term): void {
                $q->where('name', 'like', $term)
                    ->orWhere('phone', 'like', $term)
                    ->orWhere('email', 'like', $term);
            });
        }

        $customers = $query->orderBy('name')->paginate(25)->withQueryString();

        // Her müşteri için son/sonraki randevu ve toplam ödenen (paket bir kez).
        $ids = $customers->pluck('id');
        $now = CarbonImmutable::now();

        $paidTotals = Appointment::query()
            ->whereIn('customer_id', $ids)
            ->where('is_paid', true)
            ->whereNotNull('price')
            ->selectRaw('customer_id, SUM(price) as total')
            ->groupBy('customer_id')
            ->pluck('total', 'customer_id');
        $lastAt = Appointment::query()
            ->whereIn('customer_id', $ids)
            ->where('starts_at', '<', $now)
            ->selectRaw('customer_id, MAX(starts_at) as at')
            ->groupBy('customer_id')
            ->pluck('at', 'customer_id');
        $nextAt = Appointment::query()
            ->whereIn('customer_id', $ids)
            ->where('starts_at', '>=', $now)
            ->whereIn('status', ['confirmed', 'requested'])
            ->selectRaw('customer_id, MIN(starts_at) as at')
            ->groupBy('customer_id')
            ->pluck('at', 'customer_id');

        return view('musteri.musteriler.index', [
            'customers' => $customers,
            'paidTotals' => $paidTotals,
            'lastAt' => $lastAt,
            'nextAt' => $nextAt,
            'filters' => ['q' => $request->string('q')->value()],
        ]);
    }

    public function show(int $id): View
    {
        $customer = Customer::query()->findOrFail($id);

        $appointments = Appointment::query()
            ->with(['service:id,name_tr'])
            ->where('customer_id', $customer->id)
            ->orderByDesc('starts_at')
            ->get();

        // Paket fiyatı bir kez: yalnızca kök (parent_id null) randevuların ödemesi.
        $paidTotal = $appointments
            ->where('is_paid', true)
            ->whereNull('parent_id')
            ->sum(fn (Appointment $a): float => (float) $a->price);

        return view('musteri.musteriler.show', [
            'customer' => $customer,
            'appointments' => $appointments,
            'paidTotal' => $paidTotal,
            'appointmentCount' => $appointments->whereNull('parent_id')->count(),
        ]);
    }

    public function create(): View
    {
        return view('musteri.musteriler.form', ['customer' => null, 'duplicate' => null]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validateCustomer($request);
        $customer = Customer::query()->create($validated);

        return redirect()
            ->route('musteri.customers.show', $customer->id)
            ->with('flash', ['type' => 'success', 'message' => 'Müşteri eklendi.']);
    }

    public function edit(int $id): View
    {
        $customer = Customer::query()->findOrFail($id);

        return view('musteri.musteriler.form', [
            'customer' => $customer,
            'duplicate' => $this->duplicatePhone($customer->phone, $customer->id),
        ]);
    }

    public function update(Request $request, int $id): RedirectResponse
    {
        $customer = Customer::query()->findOrFail($id);
        $validated = $this->validateCustomer($request);
        $customer->fill($validated)->save();

        return redirect()
            ->route('musteri.customers.show', $customer->id)
            ->with('flash', ['type' => 'success', 'message' => 'Müşteri güncellendi.']);
    }

    public function destroy(int $id): RedirectResponse
    {
        $customer = Customer::query()->findOrFail($id);
        // appointments.customer_id FK nullOnDelete: randevular silinmez, müşteri bağı kalkar.
        $customer->delete();

        return redirect()
            ->route('musteri.customers.index')
            ->with('flash', ['type' => 'success', 'message' => 'Müşteri silindi. Randevu kayıtları korundu.']);
    }

    /** @return array<string, mixed> */
    private function validateCustomer(Request $request): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'string', 'email', 'max:255'],
            'instagram' => ['nullable', 'string', 'max:255'],
            'heard_from' => ['nullable', Rule::in(array_keys(Customer::HEARD_FROM))],
            'notes' => ['nullable', 'string', 'max:10000'],
        ]);

        $validated['name'] = trim($validated['name']);
        foreach (['phone', 'email', 'instagram', 'notes'] as $field) {
            $validated[$field] = filled($validated[$field] ?? null) ? trim($validated[$field]) : null;
        }

        return $validated;
    }

    private function duplicatePhone(?string $phone, int $exceptId): ?Customer
    {
        if (! filled($phone)) {
            return null;
        }

        return Customer::query()
            ->where('phone', $phone)
            ->whereKeyNot($exceptId)
            ->first();
    }
}
