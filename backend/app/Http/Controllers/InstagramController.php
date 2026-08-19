<?php

namespace App\Http\Controllers;

use App\Http\Resources\InstagramPostResource;
use App\Models\InstagramPost;

class InstagramController extends Controller
{
    public function index()
    {
        return InstagramPostResource::collection(
            InstagramPost::latestFirst()->limit(config('services.instagram.limit'))->get()
        );
    }
}
