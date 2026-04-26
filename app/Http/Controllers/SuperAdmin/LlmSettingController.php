<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Enums\LlmProvider;
use App\Http\Controllers\Controller;
use App\Models\LlmSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Schema\ObjectSchema;
use Prism\Prism\Schema\BooleanSchema;
use Throwable;

class LlmSettingController extends Controller
{
    /**
     * Show the LLM settings configuration page.
     */
    public function index(): Response
    {
        $setting = LlmSetting::where('is_active', true)->first();

        return Inertia::render('SuperAdmin/Llm', [
            'setting' => $setting ? [
                'id' => $setting->id,
                'provider' => $setting->provider->value,
                'model' => $setting->model,
                'has_api_key' => $setting->hasApiKey(),
                'masked_api_key' => $setting->masked_api_key,
                'base_url' => $setting->base_url,
                'extra' => $setting->extra,
            ] : null,
            'providers' => collect(LlmProvider::cases())->map(fn (LlmProvider $p) => [
                'value' => $p->value,
                'label' => $p->label(),
            ]),
        ]);
    }

    /**
     * Save or update the active LLM settings.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'string', Rule::in(array_column(LlmProvider::cases(), 'value'))],
            'model' => ['required', 'string', 'max:128'],
            'api_key' => ['nullable', 'string', 'max:512'],
            'base_url' => ['nullable', 'url', 'max:512'],
        ]);

        DB::transaction(function () use ($validated) {
            // Deactivate any existing active settings
            LlmSetting::where('is_active', true)->update(['is_active' => false]);

            $activeSetting = LlmSetting::where('is_active', false)->first();

            $data = [
                'provider' => $validated['provider'],
                'model' => $validated['model'],
                'base_url' => $validated['base_url'] ?? null,
                'is_active' => true,
                'updated_by' => Auth::id(),
            ];

            // Only update API key if one was provided (don't wipe existing on re-save)
            if (! empty($validated['api_key'])) {
                $data['api_key'] = $validated['api_key'];
            }

            if ($activeSetting) {
                // Track field changes for audit
                $changedFields = [];
                foreach (['provider', 'model', 'base_url'] as $field) {
                    if (($activeSetting->$field ?? null) != ($data[$field] ?? null)) {
                        $changedFields[] = $field;
                    }
                }
                if (! empty($validated['api_key'])) {
                    $changedFields[] = 'api_key';
                }

                $activeSetting->update($data);

                foreach ($changedFields as $field) {
                    $activeSetting->audits()->create([
                        'actor_id' => Auth::id(),
                        'field_changed' => $field,
                    ]);
                }
            } else {
                $newSetting = LlmSetting::create($data);

                // Audit the creation
                foreach (['provider', 'model', 'api_key'] as $field) {
                    $newSetting->audits()->create([
                        'actor_id' => Auth::id(),
                        'field_changed' => $field,
                    ]);
                }
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'LLM settings saved successfully.']);

        return to_route('super_admin.llm.index');
    }

    /**
     * Test connection to the configured LLM provider using a minimal prompt.
     * Rate limited to 5/minute per super-admin.
     */
    public function testConnection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'string', Rule::in(array_column(LlmProvider::cases(), 'value'))],
            'model' => ['required', 'string', 'max:128'],
            'api_key' => ['required', 'string', 'max:512'],
            'base_url' => ['nullable', 'url', 'max:512'],
        ]);

        $provider = LlmProvider::from($validated['provider']);

        $providerOpts = [];
        if (! empty($validated['base_url'])) {
            $providerOpts['url'] = $validated['base_url'];
        }

        try {
            $schema = new ObjectSchema(
                name: 'test',
                description: 'Connection test response',
                properties: [
                    new BooleanSchema('ok', 'Always true'),
                ],
                requiredFields: ['ok'],
            );

            $response = Prism::structured()
                ->using($provider->toPrism(), $validated['model'], $providerOpts)
                ->withSchema($schema)
                ->withSystemPrompt('Reply with exactly {"ok": true}')
                ->withPrompt('Ping')
                ->asStructured();

            return response()->json([
                'success' => true,
                'message' => 'Connection successful. Provider responded with: '.json_encode($response->structured),
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Connection failed: '.$e->getMessage(),
            ], 422);
        }
    }
}
