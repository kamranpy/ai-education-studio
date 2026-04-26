<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('llm_settings', function (Blueprint $table) {
            $table->id();
            $table->string('provider'); // enum-cast in model
            $table->string('model');
            $table->text('api_key'); // encrypted at app layer (Eloquent cast); TEXT for variable ciphertext length
            $table->string('base_url')->nullable();
            $table->json('extra')->nullable();
            $table->boolean('is_active')->default(false);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('llm_settings_audit', function (Blueprint $table) {
            $table->id();
            $table->foreignId('llm_setting_id')->constrained('llm_settings')->cascadeOnDelete();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('field_changed'); // e.g. 'api_key', 'model', 'is_active'
            $table->timestamps();
            // intentionally no value column — security best practice
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('llm_settings_audit');
        Schema::dropIfExists('llm_settings');
    }
};
