<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = $request->user();
        if ($user) {
            $this->logActivity('LOGIN', 'Autentikasi', "User {$user->name} ({$user->username}) berhasil login ke sistem", $user->id);
        }

        $role = $user ? $user->role : null;
        if ($role === 'karyawan') {
            return redirect()->intended(route('karyawan.absensi', absolute: false));
        } elseif ($role === 'atasan') {
            return redirect()->intended(route('dashboard.atasan', absolute: false));
        }

        return redirect()->intended(route('dashboard.admin', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        if ($user) {
            $this->logActivity('LOGOUT', 'Autentikasi', "User {$user->name} ({$user->username}) logout dari sistem", $user->id);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
