<?php

use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserInviteController;
use App\Http\Middleware\EnsureInstituteAdmin;
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

    Route::prefix('admin')->middleware(EnsureInstituteAdmin::class)->group(function () {
        Route::inertia('dashboard', 'Admin/Dashboard')->name('admin.dashboard');

        Route::get('users', [UserController::class, 'index'])->name('admin.users.index');
        Route::get('users/invite', [UserInviteController::class, 'create'])->name('admin.users.invite');
        Route::post('users/invite', [UserInviteController::class, 'store'])->name('admin.users.invite.store');
    });

    Route::prefix('student')->group(function () {
        Route::inertia('dashboard', 'Student/Dashboard')->name('student.dashboard');
    });
});

require __DIR__.'/settings.php';
