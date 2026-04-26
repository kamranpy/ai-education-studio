<?php

namespace App\Models;

use App\Enums\LlmProvider;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LlmSetting extends Model
{
    protected $fillable = [
        'provider',
        'model',
        'api_key',
        'base_url',
        'extra',
        'is_active',
        'updated_by',
    ];

    protected $casts = [
        'provider' => LlmProvider::class,
        'api_key' => 'encrypted',
        'extra' => 'array',
        'is_active' => 'boolean',
    ];

    protected $hidden = ['api_key'];

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * Check if an API key has been set (without revealing it).
     */
    public function hasApiKey(): bool
    {
        return ! empty($this->attributes['api_key']);
    }

    /**
     * Get a masked version of the API key for display.
     * Shows the last 4 characters with a masked prefix.
     */
    public function getMaskedApiKeyAttribute(): ?string
    {
        if (! $this->hasApiKey()) {
            return null;
        }

        $key = $this->api_key;
        $suffix = substr($key, -4);

        return 'sk-•••'.$suffix;
    }
}
