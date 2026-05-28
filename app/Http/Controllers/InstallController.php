<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\SiteSetting;
use App\Models\User;
use App\Services\LicenseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class InstallController extends Controller
{
    /**
     * Show the install wizard page.
     */
    public function index(): Response|RedirectResponse
    {
        if (LicenseService::isLocked()) {
            return redirect()->route('login');
        }

        return Inertia::render('install');
    }

    /**
     * Check system requirements.
     */
    public function checkRequirements(): JsonResponse
    {
        $phpVersionOk = version_compare(PHP_VERSION, '8.3.0', '>=');

        $requiredExtensions = [
            'ctype', 'curl', 'dom', 'fileinfo', 'filter', 'hash',
            'mbstring', 'openssl', 'pcre', 'pdo', 'pdo_mysql',
            'session', 'tokenizer', 'xml', 'zip', 'gd', 'intl',
            'bcmath', 'redis',
        ];

        $extensions = [];
        foreach ($requiredExtensions as $ext) {
            $extensions[] = [
                'name' => $ext,
                'installed' => extension_loaded($ext),
            ];
        }

        $allExtensionsInstalled = collect($extensions)->every('installed');

        $storageWritable = is_writable(storage_path());
        $cacheWritable = is_writable(base_path('bootstrap/cache'));
        $envExists = file_exists(base_path('.env'));

        return response()->json([
            'php_version' => PHP_VERSION,
            'php_version_ok' => $phpVersionOk,
            'extensions' => $extensions,
            'all_extensions_installed' => $allExtensionsInstalled,
            'storage_writable' => $storageWritable,
            'cache_writable' => $cacheWritable,
            'env_exists' => $envExists,
            'all_ok' => $phpVersionOk && $allExtensionsInstalled && $storageWritable && $cacheWritable && $envExists,
        ]);
    }

    /**
     * Validate a license key with the CRM server.
     */
    public function validateLicense(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'license_key' => ['required', 'string'],
        ]);

        $result = LicenseService::validate(
            $validated['license_key'],
            $request->getHost()
        );

        if (($result['status'] ?? '') === 'success') {
            return response()->json(['valid' => true]);
        }

        return response()->json([
            'valid' => false,
            'message' => $result['message'] ?? 'Invalid license key.',
        ], 422);
    }

    /**
     * Test database connection with submitted credentials.
     */
    public function testDatabase(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'host' => ['required', 'string'],
            'port' => ['required', 'integer'],
            'database' => ['required', 'string'],
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        Config::set('database.connections.temp', [
            'driver' => 'mysql',
            'host' => $validated['host'],
            'port' => $validated['port'],
            'database' => $validated['database'],
            'username' => $validated['username'],
            'password' => $validated['password'],
            'charset' => 'utf8mb4',
            'collation' => 'utf8mb4_unicode_ci',
        ]);

        try {
            DB::connection('temp')->getPdo();

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Complete the installation.
     */
    public function install(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'license_key' => ['required', 'string'],
            'app_url' => ['required', 'url'],
            'host' => ['required', 'string'],
            'port' => ['required', 'integer'],
            'database' => ['required', 'string'],
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
            'admin_email' => ['required', 'email'],
            'admin_password' => ['required', 'string', 'min:8'],
        ]);

        try {
            // 1. Write .env
            $this->writeEnv($validated);

            // 2. Generate app key
            Artisan::call('key:generate');

            // 3. Set DB config so migrations can run
            Config::set('database.connections.mysql', [
                'driver' => 'mysql',
                'host' => $validated['host'],
                'port' => $validated['port'],
                'database' => $validated['database'],
                'username' => $validated['username'],
                'password' => $validated['password'],
                'charset' => 'utf8mb4',
                'collation' => 'utf8mb4_unicode_ci',
            ]);

            // 4. Run migrations
            Artisan::call('migrate', ['--force' => true]);

            // 5. Seed roles (and any other seeders)
            try {
                Artisan::call('db:seed', ['--force' => true]);
            } catch (\Throwable $e) {
                // Seeder may fail if data already exists — continue
            }

            // 6. Ensure super-admin role exists
            $role = Role::firstOrCreate(
                ['slug' => Role::SUPER_ADMIN],
                ['name' => 'Super Admin']
            );

            // 7. Create first Super Admin user
            User::create([
                'name' => 'Super Admin',
                'email' => $validated['admin_email'],
                'password' => Hash::make($validated['admin_password']),
                'role_id' => $role->id,
                'email_verified_at' => now(),
                'status' => true,
            ]);

            // 8. Store license
            $domain = parse_url($validated['app_url'], PHP_URL_HOST) ?? $request->getHost();
            LicenseService::setStatus('active', $validated['license_key'], $domain);
            SiteSetting::set('license_activated_at', now()->toDateTimeString(), 'string');

            // 9. Create install lock
            LicenseService::lock();

            return response()->json(['success' => true]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Write the .env file with installation values.
     */
    private function writeEnv(array $data): void
    {
        $envPath = base_path('.env');

        $envContent = file_exists($envPath) ? file_get_contents($envPath) : '';

        $replacements = [
            'APP_NAME' => 'AI Education Studio',
            'APP_ENV' => 'production',
            'APP_DEBUG' => 'false',
            'APP_URL' => $data['app_url'],
            'APP_KEY' => 'base64:'.base64_encode(Str::random(32)),

            'DB_CONNECTION' => 'mysql',
            'DB_HOST' => $data['host'],
            'DB_PORT' => (string) $data['port'],
            'DB_DATABASE' => $data['database'],
            'DB_USERNAME' => $data['username'],
            'DB_PASSWORD' => $data['password'],

            'QUEUE_CONNECTION' => 'database',
            'CACHE_STORE' => 'redis',
            'SESSION_DRIVER' => 'database',

            'MAIL_MAILER' => 'log',

            'VITE_APP_NAME' => '${APP_NAME}',
        ];

        foreach ($replacements as $key => $value) {
            $pattern = '/^'.preg_quote($key, '/').'=.*/m';
            $line = $key.'='.$value;

            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, $line, $envContent);
            } else {
                $envContent .= PHP_EOL.$line;
            }
        }

        $result = file_put_contents($envPath, $envContent, LOCK_EX);

        if ($result === false) {
            throw new \RuntimeException('Failed to write .env file. Please check file permissions.');
        }
    }
}
