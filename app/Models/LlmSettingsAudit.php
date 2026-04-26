<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LlmSettingsAudit extends Model
{
    protected $table = 'llm_settings_audit';

    protected $fillable = [
        'llm_setting_id',
        'actor_id',
        'field_changed',
    ];

    public function llmSetting(): BelongsTo
    {
        return $this->belongsTo(LlmSetting::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
