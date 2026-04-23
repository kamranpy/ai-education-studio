<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('institute_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedSmallInteger('time_limit_minutes')->nullable();
            $table->unsignedTinyInteger('passing_score')->default(50);
            $table->string('status')->default('draft')->index();
            $table->timestamps();

            $table->index('institute_id');
        });

        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->text('text');
            $table->unsignedSmallInteger('points')->default(1);
            $table->text('grading_guidelines')->nullable();
            $table->unsignedSmallInteger('order')->default(0);
            $table->timestamps();

            $table->index('exam_id');
        });

        Schema::create('question_choices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained()->cascadeOnDelete();
            $table->string('text');
            $table->boolean('is_correct')->default(false);
            $table->timestamps();

            $table->index('question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_choices');
        Schema::dropIfExists('questions');
        Schema::dropIfExists('exams');
    }
};
