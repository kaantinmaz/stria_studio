<?php

use App\Http\Controllers\AdminPostController;
use App\Http\Controllers\App\AnnouncementController as AppAnnouncementController;
use App\Http\Controllers\App\AppointmentController as AppAppointmentController;
use App\Http\Controllers\App\AuthController as AppAuthController;
use App\Http\Controllers\App\CampaignController as AppCampaignController;
use App\Http\Controllers\App\ChatController as AppChatController;
use App\Http\Controllers\App\MeController as AppMeController;
use App\Http\Controllers\BlogController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\FaqController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\MicrositeController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\TrackController;
use Illuminate\Support\Facades\Route;

Route::post('/contact', [ContactController::class, 'store']);
Route::post('/chat', [ChatController::class, 'store'])->middleware('throttle:20,1');

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

Route::prefix('app')->group(function () {
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/register', [AppAuthController::class, 'register']);
        Route::post('/login', [AppAuthController::class, 'login']);
    });

    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
        Route::post('/logout', [AppAuthController::class, 'logout']);
        Route::delete('/account', [AppAuthController::class, 'destroy']);
        Route::get('/me', AppMeController::class);
        Route::get('/appointments', [AppAppointmentController::class, 'index']);
        Route::get('/slots', [AppAppointmentController::class, 'slots']);
        Route::post('/appointments', [AppAppointmentController::class, 'store']);
        Route::post('/appointments/{id}/cancel', [AppAppointmentController::class, 'cancel']);
        Route::get('/campaigns', [AppCampaignController::class, 'index']);
        Route::get('/announcements', [AppAnnouncementController::class, 'index']);
        Route::post('/chat', [AppChatController::class, 'store'])->middleware('throttle:20,1');
    });
});

Route::prefix('admin')->middleware(App\Http\Middleware\EnsureAdminApiToken::class)->group(function () {
    Route::post('/posts', [AdminPostController::class, 'store']);
    Route::delete('/posts/{slug}', [AdminPostController::class, 'destroy']);
});

// Per-service SEO microsites (e.g. microbladingankara.com). Site-scoped, read-only + contact.
Route::prefix('microsites/{site}')->group(function () {
    Route::get('/service', [MicrositeController::class, 'service']);
    Route::get('/posts', [MicrositeController::class, 'posts']);
    Route::get('/posts/{slug}', [MicrositeController::class, 'post']);
    Route::get('/faqs', [MicrositeController::class, 'faqs']);
    Route::get('/gallery', [MicrositeController::class, 'gallery']);
    Route::get('/settings', [MicrositeController::class, 'settings']);
    Route::post('/contact', [MicrositeController::class, 'contact'])->middleware('throttle:30,1');
});
