<?php

namespace App\Traits;

use App\Models\Institute;
use App\Models\Scopes\InstituteScope;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Auth;

trait HasInstitute
{
    public static function bootHasInstitute(): void
    {
        static::addGlobalScope(new InstituteScope);

        static::creating(function ($model) {
            if (empty($model->institute_id) && Auth::hasUser()) {
                $model->institute_id = Auth::user()->institute_id;
            }
        });
    }

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }
}
