<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $karyawan = null;
        if ($request->user()->role === 'karyawan') {
            $karyawan = clone $request->user()->karyawan()->firstOrCreate([]);
        }

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
            'karyawan' => $karyawan,
        ]);
    }

    public function updateKaryawan(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$request->user()->id,
            'nik' => 'nullable|string|max:255',
            'jabatan' => 'nullable|string|max:255',
            'departemen' => 'nullable|string|max:255',
            'no_hp' => 'nullable|string|max:255',
            'alamat' => 'nullable|string',
            'tanggal_lahir' => 'nullable|date',
            'jenis_kelamin' => 'nullable|in:Laki-laki,Perempuan',
        ]);

        if ($request->user()->role === 'karyawan') {
            $user = $request->user();
            
            $user->fill([
                'name' => $request->name,
                'email' => $request->email,
            ]);

            if ($user->isDirty('email')) {
                $user->email_verified_at = null;
            }
            $user->save();

            $user->karyawan()->updateOrCreate(
                ['user_id' => $user->id],
                $request->only(['nik', 'jabatan', 'departemen', 'no_hp', 'alamat', 'tanggal_lahir', 'jenis_kelamin'])
            );
        }

        return Redirect::route('profile.edit')->with('status', 'karyawan-updated');
    }

    /**
     * Update the user's profile information.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
