<?php

namespace App\Http\Controllers;

use App\Http\Resources\LinkResource;
use App\Models\Link;

class LinkController extends Controller
{
    public function index()
    {
        return LinkResource::collection(Link::active()->get());
    }
}
