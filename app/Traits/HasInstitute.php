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

            if (empty($model->institute_id) && ! ($model instanceof \App\Models\User)) {
                throw new \RuntimeException(
                    'Cannot create '.class_basename($model).' without an institute_id. '
                    .'The authenticated user must belong to an institute.'
                );
            }
        });
    }

    public function institute(): BelongsTo
    {
        return $this->belongsTo(Institute::class);
    }
}
