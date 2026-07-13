<?php

use App\Http\Controllers\AdminPostController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\MicrositeController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TrackController;
use Illuminate\Support\Facades\Route;

Route::post('/contact', [ContactController::class, 'store']);

Route::get('/posts', [BlogController::class, 'index']);
Route::get('/posts/{slug}', [BlogController::class, 'show']);
Route::get('/categories', [BlogController::class, 'categories']);
Route::get('/tags', [BlogController::class, 'tags']);

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);

Route::get('/settings', [SettingController::class, 'show']);

Route::get('/gallery', [GalleryController::class, 'index']);
Route::get('/faqs', [FaqController::class, 'index']);

Route::post('/track', [TrackController::class, 'store'])->middleware('throttle:120,1');

Route::prefix('admin')->middleware(App\Http\Middleware\EnsureAdminApiToken::class)->group(function () {
    Route::post('/posts', [AdminPostController::class, 'store']);
    Route::delete('/posts/{slug}', [AdminPostController::class, 'destroy']);
});

// Per-service SEO microsites (e.g. mikrobladingankara.com). Site-scoped, read-only + contact.
Route::prefix('microsites/{site}')->group(function () {
    Route::get('/service', [MicrositeController::class, 'service']);
    Route::get('/posts', [MicrositeController::class, 'posts']);
    Route::get('/posts/{slug}', [MicrositeController::class, 'post']);
    Route::get('/faqs', [MicrositeController::class, 'faqs']);
    Route::get('/gallery', [MicrositeController::class, 'gallery']);
    Route::get('/settings', [MicrositeController::class, 'settings']);
    Route::post('/contact', [MicrositeController::class, 'contact'])->middleware('throttle:30,1');
});
