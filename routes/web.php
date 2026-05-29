<?php

use App\Http\Controllers\Admin\ExamAttemptAdminController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\ExamController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\UserInviteController;
use App\Http\Controllers\Institute\BillingController;
use App\Http\Controllers\StripeWebhookController;
use App\Http\Controllers\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Student\ExamAttemptController;
use App\Http\Controllers\Student\ResultsController;
use App\Http\Controllers\InstallController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\InstituteController;
use App\Http\Controllers\SuperAdmin\LicenseController;
use App\Http\Controllers\SuperAdmin\LlmSettingController;
use App\Http\Controllers\SuperAdmin\CreditPackageController;
use App\Http\Controllers\SuperAdmin\SiteSettingController;
use App\Http\Controllers\SuperAdmin\StripeSettingController;
use App\Http\Middleware\EnsureInstituteAdmin;
use App\Http\Middleware\EnsureSuperAdmin;
use App\Models\SiteSetting;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration())
            && (bool) SiteSetting::get('registration_open', true),
    ]);
})->name('home');

Route::get('/maintenance', function () {
    return Inertia::render('maintenance');
})->name('maintenance');

// Install wizard — no auth middleware
Route::get('/install', [InstallController::class, 'index'])->name('install');
Route::get('/install/requirements', [InstallController::class, 'checkRequirements']);
Route::post('/install/license', [InstallController::class, 'validateLicense']);
Route::post('/install/database', [InstallController::class, 'testDatabase']);
Route::post('/install', [InstallController::class, 'install']);

Route::middleware(['auth', 'verified'])->group(function () {
    // Role-based dashboard redirect — used by the welcome page "Dashboard" link
    Route::get('dashboard', function () {
        $route = match (auth()->user()->role?->slug) {
            \App\Models\Role::SUPER_ADMIN => route('super_admin.dashboard'),
            \App\Models\Role::STUDENT => route('student.dashboard'),
            default => route('admin.dashboard'),
        };
        return redirect($route);
    })->name('dashboard');
    Route::prefix('super-admin')->middleware(EnsureSuperAdmin::class)->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('super_admin.dashboard');

        Route::get('llm', [LlmSettingController::class, 'index'])->name('super_admin.llm.index');
        Route::post('llm', [LlmSettingController::class, 'store'])->name('super_admin.llm.store');
        Route::post('llm/test', [LlmSettingController::class, 'testConnection'])
            ->middleware('throttle:5,1')
            ->name('super_admin.llm.test');

        Route::get('credit-packages', [CreditPackageController::class, 'index'])->name('super_admin.credit_packages.index');
        Route::get('credit-packages/create', [CreditPackageController::class, 'create'])->name('super_admin.credit_packages.create');
        Route::post('credit-packages', [CreditPackageController::class, 'store'])->name('super_admin.credit_packages.store');
        Route::get('credit-packages/{package}/edit', [CreditPackageController::class, 'edit'])->name('super_admin.credit_packages.edit');
        Route::put('credit-packages/{package}', [CreditPackageController::class, 'update'])->name('super_admin.credit_packages.update');
        Route::delete('credit-packages/{package}', [CreditPackageController::class, 'destroy'])->name('super_admin.credit_packages.destroy');

        Route::get('billing', [StripeSettingController::class, 'index'])->name('super_admin.billing.index');
        Route::post('billing', [StripeSettingController::class, 'store'])->name('super_admin.billing.store');

        Route::get('institutes', [InstituteController::class, 'index'])->name('super_admin.institutes.index');
        Route::patch('institutes/{institute}/toggle-status', [InstituteController::class, 'toggleStatus'])->name('super_admin.institutes.toggle-status');
        Route::post('institutes/{institute}/adjust-credits', [InstituteController::class, 'adjustCredits'])->name('super_admin.institutes.adjust-credits');
        Route::delete('institutes/{institute}', [InstituteController::class, 'destroy'])->name('super_admin.institutes.destroy');

        Route::get('settings/website', [SiteSettingController::class, 'index'])->name('super_admin.settings.website');
        Route::post('settings/website/branding', [SiteSettingController::class, 'updateBranding'])->name('super_admin.settings.website.branding');
        Route::post('settings/website/contact', [SiteSettingController::class, 'updateContact'])->name('super_admin.settings.website.contact');
        Route::post('settings/website/flags', [SiteSettingController::class, 'updateFlags'])->name('super_admin.settings.website.flags');
        Route::post('settings/website/logo', [SiteSettingController::class, 'uploadLogo'])->name('super_admin.settings.website.logo.upload');
        Route::delete('settings/website/logo', [SiteSettingController::class, 'deleteLogo'])->name('super_admin.settings.website.logo.delete');
        Route::post('settings/website/favicon', [SiteSettingController::class, 'uploadFavicon'])->name('super_admin.settings.website.favicon.upload');
        Route::delete('settings/website/favicon', [SiteSettingController::class, 'deleteFavicon'])->name('super_admin.settings.website.favicon.delete');

        Route::get('license', [LicenseController::class, 'index'])->name('super_admin.license.index');
        Route::post('license', [LicenseController::class, 'activate'])->name('super_admin.license.activate');
        Route::post('license/verify', [LicenseController::class, 'verify'])->name('super_admin.license.verify');
    });

    Route::prefix('admin')->middleware(EnsureInstituteAdmin::class)->group(function () {
        Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('admin.dashboard');

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
        Route::post('exams/{exam}/announce-results', [ExamController::class, 'announceResults'])->name('admin.exams.announce-results');

        Route::get('exams/{exam}/attempts', [ExamAttemptAdminController::class, 'index'])->name('admin.exams.attempts.index');
        Route::get('exams/{exam}/attempts/export', [ExamAttemptAdminController::class, 'export'])->name('admin.exams.attempts.export');
        Route::get('exams/{exam}/attempts/{attempt}', [ExamAttemptAdminController::class, 'show'])->name('admin.exams.attempts.show');
        Route::post('exams/{exam}/attempts/{attempt}/override', [ExamAttemptAdminController::class, 'override'])->name('admin.exams.attempts.override');
        Route::post('exams/{exam}/attempts/{attempt}/mark-reviewed', [ExamAttemptAdminController::class, 'markReviewed'])->name('admin.exams.attempts.mark-reviewed');

        Route::get('billing', [BillingController::class, 'index'])->name('admin.billing.index');
        Route::post('billing/checkout', [BillingController::class, 'checkout'])->name('admin.billing.checkout');
        Route::get('billing/success', [BillingController::class, 'success'])->name('admin.billing.success');
        Route::get('billing/cancel', [BillingController::class, 'cancel'])->name('admin.billing.cancel');
    });

    Route::prefix('student')->group(function () {
        Route::get('dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');

        Route::post('exams/{exam}/attempts', [ExamAttemptController::class, 'store'])->name('student.attempts.store');
        Route::get('exams/{exam}/attempts/{attempt}', [ExamAttemptController::class, 'show'])->name('student.attempts.show');
        Route::put('exams/{exam}/attempts/{attempt}', [ExamAttemptController::class, 'update'])->name('student.attempts.update');
        Route::post('exams/{exam}/attempts/{attempt}/submit-section', [ExamAttemptController::class, 'submitSection'])->name('student.attempts.submit-section');
        Route::post('exams/{exam}/attempts/{attempt}/track', [ExamAttemptController::class, 'logTracking'])->name('student.attempts.track');
        Route::get('exams/{exam}/attempts/{attempt}/results', [ExamAttemptController::class, 'results'])->name('student.attempts.results');

        Route::get('results', [ResultsController::class, 'index'])->name('student.results.index');
    });
});

// Stripe webhook — outside auth middleware, CSRF excluded in bootstrap/app.php
Route::post('/stripe/webhook', [StripeWebhookController::class, 'handle']);

require __DIR__.'/settings.php';
