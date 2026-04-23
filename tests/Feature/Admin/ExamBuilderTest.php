<?php

namespace Tests\Feature\Admin;

use App\Models\Exam;
use App\Models\Institute;
use App\Models\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ExamBuilderTest extends TestCase
{
    use RefreshDatabase;

    private Institute $institute;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RoleSeeder::class);

        $this->institute = Institute::factory()->create();
        $adminRole = Role::where('slug', Role::INSTITUTE_ADMIN)->first();

        $this->admin = User::factory()->create([
            'institute_id' => $this->institute->id,
            'role_id' => $adminRole->id,
        ]);
    }

    private function validExamPayload(array $overrides = []): array
    {
        return array_merge([
            'title' => 'Midterm Exam',
            'description' => 'A comprehensive midterm.',
            'time_limit_minutes' => 60,
            'passing_score' => 50,
            'questions' => [
                [
                    'type' => 'mcq',
                    'text' => 'What is 2+2?',
                    'points' => 5,
                    'grading_guidelines' => null,
                    'choices' => [
                        ['text' => '3', 'is_correct' => false],
                        ['text' => '4', 'is_correct' => true],
                        ['text' => '5', 'is_correct' => false],
                    ],
                ],
                [
                    'type' => 'true_false',
                    'text' => 'The earth is flat.',
                    'points' => 2,
                    'choices' => [
                        ['text' => 'True', 'is_correct' => false],
                        ['text' => 'False', 'is_correct' => true],
                    ],
                ],
                [
                    'type' => 'written_answer',
                    'text' => 'Explain photosynthesis.',
                    'points' => 10,
                    'grading_guidelines' => 'Should mention light, CO2, water, glucose, and chlorophyll.',
                ],
            ],
        ], $overrides);
    }

    public function test_admin_can_create_exam_with_all_question_types(): void
    {
        $response = $this->actingAs($this->admin)->post(
            route('admin.exams.store'),
            $this->validExamPayload()
        );

        $response->assertRedirect(route('admin.exams.index'));

        $this->assertDatabaseHas('exams', [
            'title' => 'Midterm Exam',
            'institute_id' => $this->institute->id,
            'status' => 'draft',
        ]);

        $exam = Exam::where('title', 'Midterm Exam')->first();
        $this->assertCount(3, $exam->questions);

        $mcq = $exam->questions->where('type', 'mcq')->first();
        $this->assertCount(3, $mcq->choices);
        $this->assertEquals(1, $mcq->choices->where('is_correct', true)->count());

        $tf = $exam->questions->where('type', 'true_false')->first();
        $this->assertNotNull($tf);
        $this->assertEquals(2, $tf->points);

        $written = $exam->questions->where('type', 'written_answer')->first();
        $this->assertNotNull($written);
        $this->assertNotNull($written->grading_guidelines);
    }

    public function test_exam_is_scoped_to_admin_institute(): void
    {
        $this->actingAs($this->admin)->post(
            route('admin.exams.store'),
            $this->validExamPayload()
        );

        $exam = Exam::first();
        $this->assertEquals($this->institute->id, $exam->institute_id);
    }

    public function test_admin_can_update_draft_exam(): void
    {
        $exam = Exam::factory()->create([
            'institute_id' => $this->institute->id,
            'title' => 'Old Title',
        ]);
        $exam->questions()->create([
            'type' => 'true_false',
            'text' => 'Old question',
            'points' => 1,
            'order' => 0,
        ]);

        $response = $this->actingAs($this->admin)->put(
            route('admin.exams.update', $exam),
            $this->validExamPayload(['title' => 'Updated Title'])
        );

        $response->assertRedirect(route('admin.exams.index'));

        $exam->refresh();
        $this->assertEquals('Updated Title', $exam->title);
        $this->assertCount(3, $exam->questions);
    }

    public function test_update_deletes_old_questions_and_choices(): void
    {
        $exam = Exam::factory()->create([
            'institute_id' => $this->institute->id,
        ]);
        $question = $exam->questions()->create([
            'type' => 'mcq',
            'text' => 'Old MCQ',
            'points' => 1,
            'order' => 0,
        ]);
        $question->choices()->createMany([
            ['text' => 'A', 'is_correct' => true],
            ['text' => 'B', 'is_correct' => false],
        ]);

        $this->actingAs($this->admin)->put(
            route('admin.exams.update', $exam),
            $this->validExamPayload()
        );

        $this->assertDatabaseMissing('questions', ['text' => 'Old MCQ']);
        $this->assertDatabaseMissing('question_choices', ['text' => 'A']);
    }

    public function test_admin_can_publish_draft_exam(): void
    {
        $exam = Exam::factory()->create([
            'institute_id' => $this->institute->id,
            'status' => 'draft',
        ]);
        $exam->questions()->create([
            'type' => 'true_false',
            'text' => 'Test question',
            'points' => 1,
            'order' => 0,
        ]);

        $response = $this->actingAs($this->admin)->post(
            route('admin.exams.publish', $exam)
        );

        $response->assertRedirect(route('admin.exams.index'));
        $this->assertEquals('published', $exam->fresh()->status);
    }

    public function test_cannot_publish_exam_without_questions(): void
    {
        $exam = Exam::factory()->create([
            'institute_id' => $this->institute->id,
            'status' => 'draft',
        ]);

        $response = $this->actingAs($this->admin)->post(
            route('admin.exams.publish', $exam)
        );

        $response->assertStatus(422);
    }

    public function test_admin_can_unpublish_published_exam(): void
    {
        $exam = Exam::factory()->create([
            'institute_id' => $this->institute->id,
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->admin)->post(
            route('admin.exams.unpublish', $exam)
        );

        $response->assertRedirect(route('admin.exams.index'));
        $this->assertEquals('draft', $exam->fresh()->status);
    }

    public function test_cannot_update_published_exam(): void
    {
        $exam = Exam::factory()->create([
            'institute_id' => $this->institute->id,
            'status' => 'published',
        ]);

        $response = $this->actingAs($this->admin)->put(
            route('admin.exams.update', $exam),
            $this->validExamPayload()
        );

        $response->assertForbidden();
    }

    public function test_validation_requires_title_and_questions(): void
    {
        $response = $this->actingAs($this->admin)->post(
            route('admin.exams.store'),
            ['title' => '', 'passing_score' => 50, 'questions' => []]
        );

        $response->assertSessionHasErrors(['title', 'questions']);
    }

    public function test_validation_requires_mcq_to_have_choices(): void
    {
        $payload = $this->validExamPayload();
        $payload['questions'] = [[
            'type' => 'mcq',
            'text' => 'No choices MCQ',
            'points' => 1,
        ]];

        $response = $this->actingAs($this->admin)->post(
            route('admin.exams.store'),
            $payload
        );

        $response->assertSessionHasErrors('questions.0.choices');
    }

    public function test_validation_requires_written_to_have_grading_guidelines(): void
    {
        $payload = $this->validExamPayload();
        $payload['questions'] = [[
            'type' => 'written_answer',
            'text' => 'Explain something.',
            'points' => 5,
        ]];

        $response = $this->actingAs($this->admin)->post(
            route('admin.exams.store'),
            $payload
        );

        $response->assertSessionHasErrors('questions.0.grading_guidelines');
    }

    public function test_student_cannot_create_exam(): void
    {
        $studentRole = Role::where('slug', Role::STUDENT)->first();
        $student = User::factory()->create([
            'institute_id' => $this->institute->id,
            'role_id' => $studentRole->id,
        ]);

        $response = $this->actingAs($student)->post(
            route('admin.exams.store'),
            $this->validExamPayload()
        );

        $response->assertForbidden();
    }

    public function test_admin_cannot_see_other_institute_exams(): void
    {
        $otherInstitute = Institute::factory()->create();
        Exam::factory()->create(['institute_id' => $otherInstitute->id]);

        $response = $this->actingAs($this->admin)->get(route('admin.exams.index'));

        $response->assertOk();
        $response->assertInertia(fn ($page) => $page
            ->component('Admin/Exams/Index')
            ->has('exams.data', 0)
        );
    }
}
