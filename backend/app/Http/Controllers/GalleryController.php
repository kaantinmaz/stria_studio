<?php

namespace App\Http\Controllers;

use App\Http\Resources\GalleryImageResource;
use App\Models\GalleryImage;

class GalleryController extends Controller
{
    public function index()
    {
        return GalleryImageResource::collection(GalleryImage::active()->get());
    }
}
