<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'institute_id',
        'stripe_session_id',
        'credits_added',
        'amount_cents',
        'currency',
        'status',
        'type',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'credits_added' => 'integer',
            'amount_cents' => 'integer',
        ];
    }

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }
}
