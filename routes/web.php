<?php

use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('super-admin')->group(function () {
        Route::inertia('dashboard', 'SuperAdmin/Dashboard')->name('super_admin.dashboard');
    });

    Route::prefix('admin')->group(function () {
        Route::inertia('dashboard', 'Admin/Dashboard')->name('admin.dashboard');
    });

    Route::prefix('student')->group(function () {
        Route::inertia('dashboard', 'Student/Dashboard')->name('student.dashboard');
    });
});

require __DIR__.'/settings.php';
