<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_attempt_answers', function (Blueprint $table) {
            // AI grading fields
            $table->decimal('ai_score', 6, 2)->nullable()->after('ai_evaluation_data');
            $table->decimal('ai_confidence', 4, 3)->nullable()->after('ai_score');
            $table->text('ai_explanation')->nullable()->after('ai_confidence');
            $table->json('ai_axes')->nullable()->after('ai_explanation');
            $table->string('ai_provider')->nullable()->after('ai_axes');
            $table->string('ai_model')->nullable()->after('ai_provider');
            $table->unsignedInteger('tokens_in')->nullable()->after('ai_model');
            $table->unsignedInteger('tokens_out')->nullable()->after('tokens_in');

            // Manual override fields
            $table->decimal('override_score', 6, 2)->nullable()->after('tokens_out');
            $table->text('override_comment')->nullable()->after('override_score');
            $table->foreignUuid('overridden_by')->nullable()->after('override_comment')->constrained('users')->nullOnDelete();
            $table->timestamp('overridden_at')->nullable()->after('overridden_by');

            // Answer grading status
            $table->string('status')->default('pending')->after('overridden_at'); // pending|graded|needs_review
        });

        Schema::create('exam_attempt_answer_overrides', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_attempt_answer_id')->constrained()->cascadeOnDelete();
            $table->decimal('from_score', 6, 2)->nullable();
            $table->decimal('to_score', 6, 2);
            $table->text('comment')->nullable();
            $table->foreignUuid('actor_id')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_attempt_answer_overrides');

        Schema::table('exam_attempt_answers', function (Blueprint $table) {
            $table->dropForeign(['overridden_by']);
            $table->dropColumn([
                'ai_score', 'ai_confidence', 'ai_explanation', 'ai_axes',
                'ai_provider', 'ai_model', 'tokens_in', 'tokens_out',
                'override_score', 'override_comment', 'overridden_by', 'overridden_at',
                'status',
            ]);
        });
    }
};
