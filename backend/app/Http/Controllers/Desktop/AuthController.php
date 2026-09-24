<?php

namespace App\Http\Controllers\Desktop;

use App\Http\Controllers\Controller;
use App\Models\User;
use Filament\Facades\Filament;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ]);

        $user = User::query()
            ->where('email', strtolower(trim($validated['email'])))
            ->first();

        if ($user === null
            || ! Hash::check($validated['password'], $user->password)
            || ! $user->canAccessPanel(Filament::getPanel('admin'))) {
            throw ValidationException::withMessages([
                'email' => ['E-posta adresi veya parola hatalı.'],
            ]);
        }

        $token = $user->createToken(
            'Stria Studio Desktop',
            ['desktop:manage'],
            now()->addDays(7),
        );

        return response()->json([
            'token' => $token->plainTextToken,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
