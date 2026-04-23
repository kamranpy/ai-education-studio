<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'exam_id',
        'type',
        'text',
        'points',
        'grading_guidelines',
        'order',
    ];

    protected $attributes = [
        'points' => 1,
        'order' => 0,
    ];

    protected function casts(): array
    {
        return [
            'points' => 'integer',
            'order' => 'integer',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function choices(): HasMany
    {
        return $this->hasMany(QuestionChoice::class);
    }
}
