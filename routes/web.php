<?php

use App\Http\Controllers\Admin\ExamAttemptAdminController;
use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserInviteController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\ExamAttemptController;
use App\Http\Controllers\SuperAdmin\LlmSettingController;
use App\Http\Middleware\EnsureInstituteAdmin;
use App\Http\Middleware\EnsureSuperAdmin;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('super-admin')->middleware(EnsureSuperAdmin::class)->group(function () {
        Route::inertia('dashboard', 'SuperAdmin/Dashboard')->name('super_admin.dashboard');

        Route::get('llm', [LlmSettingController::class, 'index'])->name('super_admin.llm.index');
        Route::post('llm', [LlmSettingController::class, 'store'])->name('super_admin.llm.store');
        Route::post('llm/test', [LlmSettingController::class, 'testConnection'])
            ->middleware('throttle:5,1')
            ->name('super_admin.llm.test');
    });

    Route::prefix('admin')->middleware(EnsureInstituteAdmin::class)->group(function () {
        Route::inertia('dashboard', 'Admin/Dashboard')->name('admin.dashboard');

        Route::get('users', [UserController::class, 'index'])->name('admin.users.index');
        Route::get('users/invite', [UserInviteController::class, 'create'])->name('admin.users.invite');
        Route::post('users/invite', [UserInviteController::class, 'store'])->name('admin.users.invite.store');

        Route::get('exams', [ExamController::class, 'index'])->name('admin.exams.index');
        Route::get('exams/create', [ExamController::class, 'create'])->name('admin.exams.create');
        Route::post('exams', [ExamController::class, 'store'])->name('admin.exams.store');
        Route::get('exams/{exam}', [ExamController::class, 'show'])->name('admin.exams.show');
        Route::get('exams/{exam}/edit', [ExamController::class, 'edit'])->name('admin.exams.edit');
        Route::put('exams/{exam}', [ExamController::class, 'update'])->name('admin.exams.update');
        Route::post('exams/{exam}/publish', [ExamController::class, 'publish'])->name('admin.exams.publish');
        Route::post('exams/{exam}/unpublish', [ExamController::class, 'unpublish'])->name('admin.exams.unpublish');

        Route::get('exams/{exam}/attempts', [ExamAttemptAdminController::class, 'index'])->name('admin.exams.attempts.index');
        Route::get('exams/{exam}/attempts/export', [ExamAttemptAdminController::class, 'export'])->name('admin.exams.attempts.export');
        Route::get('exams/{exam}/attempts/{attempt}', [ExamAttemptAdminController::class, 'show'])->name('admin.exams.attempts.show');
        Route::post('exams/{exam}/attempts/{attempt}/override', [ExamAttemptAdminController::class, 'override'])->name('admin.exams.attempts.override');
        Route::post('exams/{exam}/attempts/{attempt}/mark-reviewed', [ExamAttemptAdminController::class, 'markReviewed'])->name('admin.exams.attempts.mark-reviewed');
    });

    Route::prefix('student')->group(function () {
        Route::get('dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');

        Route::post('exams/{exam}/attempts', [ExamAttemptController::class, 'store'])->name('student.attempts.store');
        Route::get('exams/{exam}/attempts/{attempt}', [ExamAttemptController::class, 'show'])->name('student.attempts.show');
        Route::put('exams/{exam}/attempts/{attempt}', [ExamAttemptController::class, 'update'])->name('student.attempts.update');
        Route::post('exams/{exam}/attempts/{attempt}/track', [ExamAttemptController::class, 'logTracking'])->name('student.attempts.track');
        Route::get('exams/{exam}/attempts/{attempt}/results', [ExamAttemptController::class, 'results'])->name('student.attempts.results');
    });
});

require __DIR__.'/settings.php';
