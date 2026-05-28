<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class SiteSetting extends Model
{
    protected $fillable = ['key', 'value', 'type'];

    public const CACHE_KEY = 'site_settings';

    /**
     * Get all settings cached forever (busted on set()).
     * Stores a plain PHP array to avoid __PHP_Incomplete_Class on unserialize.
     */
    public static function allCached(): Collection
    {
        $cached = Cache::rememberForever(self::CACHE_KEY, function () {
            return self::all()
                ->mapWithKeys(fn (self $s) => [
                    $s->key => ['value' => $s->value, 'type' => $s->type],
                ])
                ->all();
        });

        return collect($cached);
    }

    /**
     * Get a setting value with optional default. Casts based on stored type.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $settings = self::allCached();

        if (! $settings->has($key)) {
            return $default;
        }

        /** @var array{value: string|null, type: string} $setting */
        $setting = $settings->get($key);

        if ($setting['value'] === null) {
            return $default;
        }

        return match ($setting['type']) {
            'boolean' => filter_var($setting['value'], FILTER_VALIDATE_BOOLEAN),
            'json' => json_decode($setting['value'], true),
            default => $setting['value'],
        };
    }

    /**
     * Set a setting value. Busts the cache.
     */
    public static function set(string $key, mixed $value, string $type = 'string'): void
    {
        $storedValue = match ($type) {
            'boolean' => $value ? '1' : '0',
            'json' => json_encode($value),
            default => $value === null ? null : (string) $value,
        };

        self::updateOrCreate(
            ['key' => $key],
            ['value' => $storedValue, 'type' => $type]
        );

        Cache::forget(self::CACHE_KEY);
    }

    /**
     * Get the public URL for a stored relative path setting.
     */
    public static function getFileUrl(string $key): ?string
    {
        $path = self::get($key);

        if (! $path) {
            return null;
        }

        return Storage::url($path);
    }
}
