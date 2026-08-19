<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\Customer;
use App\Support\CustomerAnonymizer;
use App\Support\CustomerPairing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->merge([
            'email' => AppUser::normalizeEmail($request->input('email')),
        ]);
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:160', 'unique:app_users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:40'],
        ]);

        $user = DB::transaction(function () use ($validated): AppUser {
            $user = AppUser::query()->create([
                'name' => trim($validated['name']),
                'email' => $validated['email'],
                'password' => $validated['password'],
                'phone' => filled($validated['phone'] ?? null) ? trim($validated['phone']) : null,
            ]);

            Customer::query()->create([
                'name' => $user->name,
                'phone' => $user->phone,
                'app_user_id' => $user->id,
            ]);

            return $user;
        });

        return response()->json([
            'data' => [
                'token' => $user->createToken('mobile-app')->plainTextToken,
                'user' => $user->toAppApiArray(),
            ],
        ], 201);
    }

    /**
     * Panelde açılan QR ile eşleşme: müşteri kaydı zaten var, kullanıcı hiçbir
     * şey yazmadan hesap sahibi olup oturum açıyor. Randevular müşteriye bağlı
     * olduğu için eşleşme anında geçmişi ve gelecek randevuları görüyor.
     */
    public function pair(Request $request, CustomerPairing $pairing): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:200'],
        ]);
        $customer = $pairing->resolve($validated['token']);

        $user = DB::transaction(function () use ($customer): AppUser {
            // Aynı QR iki telefonda birden okutulursa ikinci istek burada
            // durur; yoksa ilk hesap sahipsiz kalırdı.
            $locked = Customer::query()->whereKey($customer->id)->lockForUpdate()->first();

            if ($locked === null || $locked->app_user_id !== null) {
                throw ValidationException::withMessages([
                    'token' => ['Bu müşteri kaydı zaten bir uygulama hesabına bağlı.'],
                ]);
            }

            $user = AppUser::query()->create([
                'name' => mb_substr($locked->name, 0, 120),
                'phone' => $locked->phone,
            ]);

            $locked->app_user_id = $user->id;
            $locked->save();

            return $user;
        });

        return response()->json([
            'data' => [
                'token' => $user->createToken('mobile-app')->plainTextToken,
                'user' => $user->toAppApiArray(),
            ],
        ], 201);
    }

    /**
     * Müşteri kendi ad ve telefonunu günceller. Bağlı müşteri kaydına da
     * yazılır: panelde eski ad görünmesin.
     */
    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['nullable', 'string', 'max:40'],
        ], [
            'name.required' => 'Adını ve soyadını yazmalısın.',
            'name.max' => 'Ad soyad en fazla 120 karakter olabilir.',
            'phone.max' => 'Telefon en fazla 40 karakter olabilir.',
        ]);

        $user->update([
            'name' => trim($validated['name']),
            'phone' => filled($validated['phone'] ?? null) ? trim($validated['phone']) : null,
        ]);
        $this->syncCustomer($user, ['name' => $user->name, 'phone' => $user->phone]);

        return response()->json([
            'data' => [
                'user' => $user->toAppApiArray(),
            ],
        ]);
    }

    /**
     * E-posta ve şifreyi belirler ya da değiştirir.
     *
     * QR ile açılan hesapta hiç şifre yoktur; ilk kez belirlerken mevcut şifre
     * sorulmaz. Şifresi olan hesapta ise `current_password` zorunlu — aksi
     * hâlde çalınan bir telefon hesabı sessizce devralabilirdi.
     */
    public function credentials(Request $request): JsonResponse
    {
        $user = $request->user();
        $hasPassword = filled($user->password);

        $request->merge([
            'email' => AppUser::normalizeEmail($request->input('email')),
        ]);
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:160', Rule::unique('app_users', 'email')->ignore($user->id)],
            'password' => [$hasPassword ? 'nullable' : 'required', 'string', 'min:8'],
            'current_password' => [$hasPassword ? 'required' : 'nullable', 'string'],
        ], [
            'email.required' => 'E-posta adresini yazmalısın.',
            'email.email' => 'Geçerli bir e-posta adresi yazmalısın.',
            'email.max' => 'E-posta en fazla 160 karakter olabilir.',
            'email.unique' => 'Bu e-posta adresi başka bir hesapta kullanılıyor.',
            'password.required' => 'Şifre belirlemelisin.',
            'password.min' => 'Şifren en az 8 karakter olmalı.',
            'current_password.required' => 'Mevcut şifreni yazmalısın.',
        ]);

        if ($hasPassword && ! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mevcut şifren hatalı.'],
            ]);
        }

        $user->email = $validated['email'];
        if (filled($validated['password'] ?? null)) {
            $user->password = $validated['password'];
        }
        $user->save();
        $this->syncCustomer($user, ['email' => $user->email]);

        return response()->json([
            'data' => [
                'user' => $user->toAppApiArray(),
            ],
        ]);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    private function syncCustomer(AppUser $user, array $attributes): void
    {
        // Müşteri kendi iletişim bilgisinin kaynağı; stüdyo notlarına dokunmuyoruz.
        $user->customer()->update($attributes);
    }

    public function login(Request $request): JsonResponse
    {
        $request->merge([
            'email' => AppUser::normalizeEmail($request->input('email')),
        ]);
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);
        $user = AppUser::query()
            ->where('email', $validated['email'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['E-posta adresi veya şifre hatalı.'],
            ]);
        }

        return response()->json([
            'data' => [
                'token' => $user->createToken('mobile-app')->plainTextToken,
                'user' => $user->toAppApiArray(),
            ],
        ]);
    }

    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->noContent();
    }

    public function destroy(Request $request, CustomerAnonymizer $anonymizer): Response
    {
        $user = $request->user();

        DB::transaction(function () use ($user, $anonymizer): void {
            $anonymizer->anonymize($user);
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->noContent();
    }
}
