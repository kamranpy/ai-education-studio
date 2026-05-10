# Phase 1: Foundation & Multi-Tenancy - Research

**Date:** 2026-04-12
**Mode:** ecosystem

## Standard Stack

- **Multi-Tenancy Enforcer:** Laravel Global Scopes (e.g., `InstituteScope`) combined with a `HasInstitute` trait to automatically filter records based on the logged-in user's `institute_id`.
- **Authentication Framework:** `laravel/fortify` to handle all headless auth backends (login, registration, password resets).
- **UI Components:** `shadcn/ui` for React, built on Radix UI and Tailwind CSS v4.
- **Routing:** `laravel/wayfinder` to expose backend routes to the React frontend safely.
- **Frontend Framework:** `Inertia.js` + `React 19`.

## Architecture Patterns

### 1. Inferred Tenant (Invisible Routing)
Because the routing strategy does not rely on subdomains or paths, the tenant constraint must be strictly inferred from `Auth::user()->institute_id`. 
* **Implementation:** The `InstituteScope` reads the authenticated user's `institute_id` and automatically appends a `where('institute_id', ...)` clause to all queries.

### 2. Role-Based Redirection
Since there are three distinct layouts and portal areas (`Super Admin`, `Institute Admin`, `Student`), authentication requires role-aware redirection immediately upon login.
* **Implementation:** Bind a custom `LoginResponse` in the `FortifyServiceProvider`. This response inspects `Auth::user()->role` and redirects to the correct dashboard (`/super-admin`, `/admin`, or `/student`). 

### 3. Open Self-Registration Flow
When a user self-registers as an Institute Admin, the system must create the tenant environment and the user atomically.
* **Implementation:** Customize Fortify's `CreateNewUser` action. Use a database transaction to:
  1. Create the `Institute` record.
  2. Create the `User` record, setting their role to `institute_admin` and assigning the `institute_id`.

### 4. Distinct Layout Architecture
* **Implementation:** In the React codebase (`resources/js`), create separate layout components in `resources/js/layouts/` (e.g. `SuperAdminLayout.tsx`, `AdminLayout.tsx`, `StudentLayout.tsx`). Map these to individual pages via the Inertia persistent layout pattern (`Dashboard.layout = (page) => <AdminLayout children={page} />`).

## Don't Hand-Roll

- **Authentication Controllers:** Do NOT write custom controllers for login or registration. Fortify handles this securely. Just customize Fortify's `FortifyServiceProvider` and actions (e.g., `CreateNewUser`).
- **UI Components:** Do NOT build modals, dropdowns, or complex form inputs from scratch. Use the `shadcn/ui` CLI or copy the raw Radix-backed primitives as preferred.
- **Impersonation/Support Access:** Do NOT hand-roll complex session-swapping logic if you simply want Super Admins to view Institute data. Instead, allow Super Admins to bypass `InstituteScope` and append a global `tenant_id` selector to the UI state.

## Common Pitfalls

1. **Leaking Tenant Data:** Creating models but forgetting to add the `HasInstitute` trait. 
   **Check:** Verification logic must include unit tests asserting that an Institute Admin cannot see another Institute's records.
2. **Fortify Default Redirection:** Fortify redirects to `RouteServiceProvider::HOME` by default, which is static. This will break the distinct layout routing.
   **Check:** Must implement a dynamic `LoginResponse` contract.
3. **Super Admin Seeding:** Failing to create a default Super Admin account during database migrations makes it impossible to log in to the global dashboard on fresh installs.
   **Check:** Add a database seeder for initial Super Admin setup.
4. **Registration Validation:** Creating the user before the institute fails DB constraints if the user table requires `institute_id`. They must be created inside together using `DB::transaction`.

## Code Examples

### Role-Aware `LoginResponse`
```php
namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Illuminate\Support\Facades\Auth;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request)
    {
        $role = Auth::user()->role;
        
        $url = match($role) {
            'super_admin' => route('super_admin.dashboard'),
            'institute_admin' => route('admin.dashboard'),
            'student' => route('student.dashboard'),
            default => route('home'),
        };

        return redirect()->intended($url);
    }
}
```

### Global Scope for Tenancy
```php
namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class InstituteScope implements Scope
{
    public function apply(Builder $builder, Model $model)
    {
        if (Auth::hasUser() && Auth::user()->role !== 'super_admin') {
            $builder->where($model->getTable() . '.institute_id', Auth::user()->institute_id);
        }
    }
}
```

### Fortify CreateNewUser Transaction
```php
public function create(array $input)
{
    Validator::make($input, [
        'institute_name' => ['required', 'string', 'max:255'],
        'name' => ['required', 'string', 'max:255'],
        'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
        'password' => $this->passwordRules(),
    ])->validate();

    return DB::transaction(function () use ($input) {
        $institute = Institute::create([
            'name' => $input['institute_name'],
        ]);

        return User::create([
            'institute_id' => $institute->id,
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
            'role' => 'institute_admin',
        ]);
    });
}
```
