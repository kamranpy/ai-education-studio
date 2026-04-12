<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $fillable = [
        'name',
        'slug',
    ];

    public const SUPER_ADMIN = 'super_admin';

    public const INSTITUTE_ADMIN = 'institute_admin';

    public const STUDENT = 'student';

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }
}
