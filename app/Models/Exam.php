<?php

namespace App\Models;

use App\Traits\HasInstitute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exam extends Model
{
    use HasFactory, HasInstitute;

    protected $fillable = [
        'title',
        'description',
        'time_limit_minutes',
        'passing_score',
        'status',
        'institute_id',
    ];

    protected $attributes = [
        'status' => 'draft',
        'passing_score' => 50,
    ];

    protected function casts(): array
    {
        return [
            'time_limit_minutes' => 'integer',
            'passing_score' => 'integer',
        ];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)->orderBy('order');
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }

    public function isLocked(): bool
    {
        return $this->status === 'locked';
    }
}
