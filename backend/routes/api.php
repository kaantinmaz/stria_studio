<?php

use App\Http\Controllers\BlogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\ServiceController;
use Illuminate\Support\Facades\Route;

Route::post('/contact', [ContactController::class, 'store']);

Route::get('/posts', [BlogController::class, 'index']);
Route::get('/posts/{slug}', [BlogController::class, 'show']);
Route::get('/categories', [BlogController::class, 'categories']);
Route::get('/tags', [BlogController::class, 'tags']);

Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);
