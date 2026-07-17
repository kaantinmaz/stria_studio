<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Models\AppUser;
use App\Models\Customer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $request->merge([
            'email' => Str::lower((string) $request->input('email')),
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
                'email' => Str::lower($validated['email']),
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

    public function login(Request $request): JsonResponse
    {
        $request->merge([
            'email' => Str::lower((string) $request->input('email')),
        ]);
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);
        $user = AppUser::query()
            ->where('email', Str::lower($validated['email']))
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

    public function destroy(Request $request): Response
    {
        $user = $request->user();

        DB::transaction(function () use ($user): void {
            $user->tokens()->delete();
            $user->delete();
        });

        return response()->noContent();
    }
}
