<?php

use App\Http\Controllers\Musteri\AppointmentController;
use App\Http\Controllers\Musteri\AuthController;
use App\Http\Controllers\Musteri\CustomerController;
use App\Http\Controllers\Musteri\DashboardController;
use App\Http\Controllers\Musteri\ExportController;
use App\Http\Controllers\Musteri\ReportController;
use App\Http\Middleware\MusteriAuth;
use App\Http\Middleware\MusteriNoindex;
use Illuminate\Support\Facades\Route;

// Müşteri takip paneli — yalnızca config('musteri.domain') host'unda yayınlanır.
// Admin alan adının kök davranışını etkilememesi için bu grup önce gelir.
Route::domain(config('musteri.domain'))
    ->middleware(MusteriNoindex::class)
    ->name('musteri.')
    ->group(function (): void {
        Route::get('/giris', [AuthController::class, 'showLogin'])->name('login');
        Route::post('/giris', [AuthController::class, 'login'])->name('login.submit');
        Route::post('/cikis', [AuthController::class, 'logout'])->name('logout');

        Route::middleware(MusteriAuth::class)->group(function (): void {
            Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

            Route::get('/randevular', [AppointmentController::class, 'index'])->name('appointments.index');
            Route::get('/randevular/disa-aktar', [AppointmentController::class, 'export'])->name('appointments.export');
            Route::get('/randevular/yeni', [AppointmentController::class, 'create'])->name('appointments.create');
            Route::post('/randevular', [AppointmentController::class, 'store'])->name('appointments.store');
            Route::get('/randevular/{id}', [AppointmentController::class, 'show'])->whereNumber('id')->name('appointments.show');
            Route::get('/randevular/{id}/duzenle', [AppointmentController::class, 'edit'])->whereNumber('id')->name('appointments.edit');
            Route::put('/randevular/{id}', [AppointmentController::class, 'update'])->whereNumber('id')->name('appointments.update');
            Route::delete('/randevular/{id}', [AppointmentController::class, 'destroy'])->whereNumber('id')->name('appointments.destroy');
            Route::post('/randevular/{id}/onayla', [AppointmentController::class, 'confirm'])->whereNumber('id')->name('appointments.confirm');
            Route::post('/randevular/{id}/iptal', [AppointmentController::class, 'cancel'])->whereNumber('id')->name('appointments.cancel');

            Route::get('/musteriler', [CustomerController::class, 'index'])->name('customers.index');
            Route::get('/musteriler/yeni', [CustomerController::class, 'create'])->name('customers.create');
            Route::post('/musteriler', [CustomerController::class, 'store'])->name('customers.store');
            Route::get('/musteriler/{id}', [CustomerController::class, 'show'])->whereNumber('id')->name('customers.show');
            Route::get('/musteriler/{id}/duzenle', [CustomerController::class, 'edit'])->whereNumber('id')->name('customers.edit');
            Route::put('/musteriler/{id}', [CustomerController::class, 'update'])->whereNumber('id')->name('customers.update');
            Route::delete('/musteriler/{id}', [CustomerController::class, 'destroy'])->whereNumber('id')->name('customers.destroy');

            Route::get('/raporlar', [ReportController::class, 'index'])->name('reports.index');

            Route::get('/disa-aktar', [ExportController::class, 'index'])->name('export.index');
            Route::get('/disa-aktar/musteriler', [ExportController::class, 'customers'])->name('export.customers');
            Route::get('/disa-aktar/randevular', [ExportController::class, 'appointments'])->name('export.appointments');
        });
    });

// Admin alan adı (ve diğer host'lar) kökü Filament'e yönlendirir.
Route::redirect('/', '/admin');
