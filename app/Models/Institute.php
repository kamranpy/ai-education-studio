<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Institute extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'status',
        'credits',
    ];

    protected $attributes = [
        'status' => true,
        'credits' => 0,
    ];

    protected function casts(): array
    {
        return [
            'status' => 'boolean',
            'credits' => 'integer',
        ];
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
