<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:160'],
            'service' => ['nullable', 'string', 'max:80'],
            'preferred_date' => ['nullable', 'date'],
            'message' => ['nullable', 'string', 'max:2000'],
            'locale' => ['nullable', 'string', 'in:tr,en'],
        ]);

        $lead = Lead::create($data + ['locale' => $data['locale'] ?? 'tr']);

        return response()->json(['ok' => true, 'id' => $lead->id], 201);
    }
}
