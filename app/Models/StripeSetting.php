<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StripeSetting extends Model
{
    protected $fillable = [
        'secret_key',
        'webhook_secret',
        'is_active',
        'updated_by',
    ];

    protected $hidden = [
        'secret_key',
        'webhook_secret',
    ];

    protected function casts(): array
    {
        return [
            'secret_key'     => 'encrypted',
            'webhook_secret' => 'encrypted',
            'is_active'      => 'boolean',
        ];
    }

    /**
     * Whether a secret key has been stored.
     */
    public function hasSecretKey(): bool
    {
        return ! empty($this->attributes['secret_key']);
    }

    /**
     * Whether a webhook secret has been stored.
     */
    public function hasWebhookSecret(): bool
    {
        return ! empty($this->attributes['webhook_secret']);
    }

    /**
     * Masked display value for the secret key (last 4 chars visible).
     */
    public function getMaskedSecretKeyAttribute(): ?string
    {
        if (! $this->hasSecretKey()) {
            return null;
        }

        return 'sk_•••' . substr($this->secret_key, -4);
    }

    /**
     * Masked display value for the webhook secret (last 4 chars visible).
     */
    public function getMaskedWebhookSecretAttribute(): ?string
    {
        if (! $this->hasWebhookSecret()) {
            return null;
        }

        return 'whsec_•••' . substr($this->webhook_secret, -4);
    }

    /**
     * The super admin who last updated these settings.
     */
    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
