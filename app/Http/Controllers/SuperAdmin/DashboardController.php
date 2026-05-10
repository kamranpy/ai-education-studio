<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ExamAttempt;
use App\Models\Institute;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Carbon\CarbonInterface;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Show the Super Admin analytics dashboard.
     *
     * Accepts a `range` query param: 7d | 30d | 90d | all (default: 30d).
     */
    public function index(Request $request): Response
    {
        $range = in_array($request->query('range'), ['7d', '30d', '90d', 'all'])
            ? $request->query('range')
            : '30d';

        $from = $this->dateFrom($range);

        // --- Stat cards ---

        // Total institutes is always all-time (not filtered by range)
        $totalInstitutes = Institute::count();

        $totalExams = ExamAttempt::whereIn('status', ['submitted', 'graded'])
            ->when($from, fn ($q) => $q->where('submitted_at', '>=', $from))
            ->count();

        $totalRevenueCents = Transaction::where('status', 'completed')
            ->where('type', 'stripe_purchase')
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->sum('amount_cents');

        $totalCreditsSold = Transaction::where('status', 'completed')
            ->where('type', 'stripe_purchase')
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->sum('credits_added');

        // --- Time-series charts ---

        $examsOverTime = ExamAttempt::selectRaw('DATE(submitted_at) as date, COUNT(*) as count')
            ->whereIn('status', ['submitted', 'graded'])
            ->when($from, fn ($q) => $q->where('submitted_at', '>=', $from))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $revenueOverTime = Transaction::selectRaw('DATE(created_at) as date, SUM(amount_cents) as revenue')
            ->where('status', 'completed')
            ->where('type', 'stripe_purchase')
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $institutesOverTime = Institute::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->when($from, fn ($q) => $q->where('created_at', '>=', $from))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return Inertia::render('SuperAdmin/Dashboard', [
            'stats' => [
                'total_institutes'    => $totalInstitutes,
                'total_exams'         => $totalExams,
                'total_revenue_cents' => $totalRevenueCents,
                'total_credits_sold'  => $totalCreditsSold,
            ],
            'charts' => [
                'exams_over_time'      => $examsOverTime,
                'revenue_over_time'    => $revenueOverTime,
                'institutes_over_time' => $institutesOverTime,
            ],
            'range' => $range,
        ]);
    }

    /**
     * Resolve the start date for the given range string.
     * Returns null for 'all' (no date filter).
     */
    private function dateFrom(string $range): ?CarbonInterface
    {
        return match ($range) {
            '7d'  => now()->subDays(7),
            '30d' => now()->subDays(30),
            '90d' => now()->subDays(90),
            default => null,
        };
    }
}
