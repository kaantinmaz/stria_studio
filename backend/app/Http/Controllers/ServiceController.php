<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceApiResource;
use App\Http\Resources\ServiceListResource;
use App\Models\Service;

class ServiceController extends Controller
{
    public function index()
    {
        return ServiceListResource::collection(
            Service::active()
                ->withCount(['reviews as rating_count' => fn ($q) => $q->where('is_active', true)])
                ->withAvg(['reviews as rating_avg' => fn ($q) => $q->where('is_active', true)], 'rating')
                ->get()
        );
    }

    public function show(string $slug)
    {
        $service = Service::active()
            ->withCount(['reviews as rating_count' => fn ($q) => $q->where('is_active', true)])
            ->withAvg(['reviews as rating_avg' => fn ($q) => $q->where('is_active', true)], 'rating')
            ->with(['reviews' => fn ($q) => $q->active()])
            ->where('slug', $slug)
            ->firstOrFail();

        return new ServiceApiResource($service);
    }
}
