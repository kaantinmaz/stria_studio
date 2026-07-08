<?php

namespace App\Http\Controllers;

use App\Http\Resources\ServiceApiResource;
use App\Http\Resources\ServiceListResource;
use App\Models\Service;

class ServiceController extends Controller
{
    public function index()
    {
        return ServiceListResource::collection(Service::active()->get());
    }

    public function show(string $slug)
    {
        $service = Service::active()->where('slug', $slug)->firstOrFail();
        return new ServiceApiResource($service);
    }
}
