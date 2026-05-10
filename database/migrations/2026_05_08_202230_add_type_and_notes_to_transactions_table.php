<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->string('type')->default('stripe_purchase')->after('status');
            $table->text('notes')->nullable()->after('type');
            $table->index('type');
        });

        // Backfill existing rows that have no type set
        DB::table('transactions')->whereNull('type')->update(['type' => 'stripe_purchase']);
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropIndex(['type']);
            $table->dropColumn(['type', 'notes']);
        });
    }
};
