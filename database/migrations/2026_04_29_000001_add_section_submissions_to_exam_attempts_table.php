<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->timestamp('tf_submitted_at')->nullable()->after('submitted_at');
            $table->timestamp('mcqs_submitted_at')->nullable()->after('tf_submitted_at');
            $table->timestamp('written_submitted_at')->nullable()->after('mcqs_submitted_at');
        });
    }

    public function down(): void
    {
        Schema::table('exam_attempts', function (Blueprint $table) {
            $table->dropColumn(['tf_submitted_at', 'mcqs_submitted_at', 'written_submitted_at']);
        });
    }
};
