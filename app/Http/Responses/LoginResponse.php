<?php

namespace App\Http\Responses;

use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        if ($request->wantsJson()) {
            return new JsonResponse('', 204);
        }

        $route = match (auth()->user()->role?->slug) {
            Role::SUPER_ADMIN => route('super_admin.dashboard'),
            Role::STUDENT => route('student.dashboard'),
            default => route('admin.dashboard'),
        };

        return redirect()->intended($route);
    }
}
