<?php

namespace Tests\Feature\SuperAdmin;

use App\Models\Exam;
use App\Models\ExamAttempt;
use App\Models\Institute;
use App\Models\Role;
use App\Models\Transaction;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);

        $superAdminRole = Role::where('slug', Role::SUPER_ADMIN)->first();

        $this->superAdmin = User::factory()->create([
            'role_id' => $superAdminRole->id,
        ]);
    }

    public function test_super_admin_can_view_dashboard(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('SuperAdmin/Dashboard')
            ->has('stats')
            ->has('charts')
            ->has('range')
        );
    }

    public function test_dashboard_defaults_to_30d_range(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('range', '30d')
        );
    }

    public function test_dashboard_accepts_valid_range_params(): void
    {
        foreach (['7d', '30d', '90d', 'all'] as $range) {
            $response = $this->actingAs($this->superAdmin)
                ->get(route('super_admin.dashboard', ['range' => $range]));

            $response->assertOk();
            $response->assertInertia(fn ($page) => $page
                ->where('range', $range)
            );
        }
    }

    public function test_dashboard_rejects_invalid_range_and_defaults_to_30d(): void
    {
        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.dashboard', ['range' => 'invalid']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('range', '30d')
        );
    }

    public function test_total_institutes_is_always_all_time(): void
    {
        // Create an institute with a created_at older than 7 days
        $oldInstitute = Institute::factory()->create();
        $oldInstitute->created_at = now()->subDays(30);
        $oldInstitute->save();

        // Request with 7d range — total_institutes should still include the old one
        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.dashboard', ['range' => '7d']));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.total_institutes', 1)
        );
    }

    public function test_stats_count_submitted_and_graded_exams(): void
    {
        $institute = Institute::factory()->create();
        $studentRole = Role::where('slug', Role::STUDENT)->first();
        $student = User::factory()->create([
            'institute_id' => $institute->id,
            'role_id' => $studentRole->id,
        ]);
        $exam = Exam::factory()->create(['institute_id' => $institute->id]);

        // submitted — should be counted
        ExamAttempt::create([
            'user_id' => $student->id,
            'exam_id' => $exam->id,
            'status' => 'submitted',
            'started_at' => now()->subHour(),
            'submitted_at' => now(),
            'question_order' => [],
        ]);

        // graded — should be counted
        ExamAttempt::create([
            'user_id' => $student->id,
            'exam_id' => $exam->id,
            'status' => 'graded',
            'started_at' => now()->subHour(),
            'submitted_at' => now(),
            'question_order' => [],
        ]);

        // in_progress — should NOT be counted
        ExamAttempt::create([
            'user_id' => $student->id,
            'exam_id' => $exam->id,
            'status' => 'in_progress',
            'started_at' => now(),
            'submitted_at' => null,
            'question_order' => [],
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.total_exams', 2)
        );
    }

    public function test_revenue_only_counts_stripe_purchases(): void
    {
        $institute = Institute::factory()->create();

        // stripe_purchase — should be counted
        Transaction::create([
            'institute_id' => $institute->id,
            'credits_added' => 100,
            'amount_cents' => 5000,
            'currency' => 'usd',
            'status' => 'completed',
            'type' => 'stripe_purchase',
        ]);

        // manual_adjustment — should NOT be counted in revenue
        Transaction::create([
            'institute_id' => $institute->id,
            'credits_added' => 50,
            'amount_cents' => 0,
            'currency' => 'usd',
            'status' => 'completed',
            'type' => 'manual_adjustment',
        ]);

        $response = $this->actingAs($this->superAdmin)
            ->get(route('super_admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->where('stats.total_revenue_cents', 5000)
        );
    }

    public function test_non_super_admin_cannot_view_dashboard(): void
    {
        $adminRole = Role::where('slug', Role::INSTITUTE_ADMIN)->first();
        $institute = Institute::factory()->create();
        $instituteAdmin = User::factory()->create([
            'institute_id' => $institute->id,
            'role_id' => $adminRole->id,
        ]);

        $response = $this->actingAs($instituteAdmin)
            ->get(route('super_admin.dashboard'));

        $response->assertForbidden();
    }
}
