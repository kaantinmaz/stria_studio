<?php

namespace App\Http\Controllers;

use App\Models\Lead;
use App\Support\Attribution;
use App\Support\MetaConversions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request, MetaConversions $meta): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'phone' => ['required', 'string', 'max:40'],
            'email' => ['nullable', 'email', 'max:160'],
            'service' => ['nullable', 'string', 'max:80'],
            'preferred_date' => ['nullable', 'date'],
            'message' => ['nullable', 'string', 'max:2000'],
            'locale' => ['nullable', 'string', 'in:tr,en'],
        ] + MetaConversions::rules() + Attribution::rules());

        $metaBlock = $data['meta'] ?? null;
        $tracking = array_intersect_key($data, array_flip(['meta', 'attr', 'ref']));
        unset($data['meta'], $data['attr'], $data['ref']);

        $lead = Lead::create($data + ['locale' => $data['locale'] ?? 'tr']);
        Attribution::record('form', $tracking + ['path' => $request->input('path')], $request, $data['phone']);

        $meta->dispatch('Lead', $metaBlock, $request,
            ['email' => $data['email'] ?? null, 'phone' => $data['phone']],
            array_filter(['content_name' => $data['service'] ?? null]));

        return response()->json(['ok' => true, 'id' => $lead->id], 201);
    }
}
