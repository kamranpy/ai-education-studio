<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserInviteRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserInviteController extends Controller
{
    public function create(): Response
    {
        $roles = Role::whereIn('slug', [Role::INSTITUTE_ADMIN, Role::STUDENT])
            ->get(['id', 'name', 'slug']);

        return Inertia::render('Admin/Users/Invite', [
            'roles' => $roles,
        ]);
    }

    public function store(StoreUserInviteRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->validated('name'),
            'email' => $request->validated('email'),
            'password' => Hash::make(Str::random(32)),
            'role_id' => $request->validated('role_id'),
            'status' => 'invited',
        ]);

        if ($request->validated('send_email', false)) {
            $token = \Illuminate\Support\Facades\Password::broker()->createToken($user);
            $user->notify(new \App\Notifications\UserInvitedNotification($token));
        }

        $message = $request->validated('send_email', false)
            ? __('User invited and email sent.')
            : __('User created successfully.');

        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);

        return to_route('admin.users.index');
    }
}
