<?php

namespace App\Http\Responses;

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

        $route = match (auth()->user()->role) {
            'super_admin' => route('super_admin.dashboard'),
            'student' => route('student.dashboard'),
            default => route('admin.dashboard'),
        };

        return redirect()->intended($route);
    }
}
