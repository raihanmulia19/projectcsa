<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    public function __invoke(EmailVerificationRequest $request): RedirectResponse
    {
        $dashboardRoute = $request->user()->role === 'atasan' 
            ? route('dashboard.atasan', absolute: false) 
            : route('dashboard.admin', absolute: false);

        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->intended($dashboardRoute.'?verified=1');
        }

        if ($request->user()->markEmailAsVerified()) {
            event(new Verified($request->user()));
        }

        return redirect()->intended($dashboardRoute.'?verified=1');
    }
}
