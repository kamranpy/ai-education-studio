<?php

namespace App\Http\Requests\Admin;

use App\Models\Role;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserInviteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isInstituteAdmin();
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        $allowedRoles = Role::whereIn('slug', [Role::INSTITUTE_ADMIN, Role::STUDENT])->pluck('id');

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'role_id' => ['required', Rule::in($allowedRoles)],
            'send_email' => ['boolean'],
        ];
    }
}
