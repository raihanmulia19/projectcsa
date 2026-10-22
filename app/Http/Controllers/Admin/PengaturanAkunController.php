<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Karyawan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PengaturanAkunController extends Controller
{
    public function index()
    {
        $users = User::orderBy('created_at', 'desc')->get();
        return Inertia::render('SuperAdmin/Akun/Index', [
            'users' => $users
        ]);
    }

    public function create()
    {
        return Inertia::render('SuperAdmin/Akun/Form');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::in(['admin', 'atasan', 'karyawan', 'super_admin'])],
        ]);

        if ($request->role === 'karyawan') {
            $request->validate([
                'no_hp' => 'nullable|string|max:255',
                'jabatan' => 'nullable|string|max:255',
                'departemen' => 'nullable|string|max:255',
            ]);
        }

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        if ($request->role === 'karyawan') {
            Karyawan::create([
                'user_id' => $user->id,
                'no_hp' => $request->no_hp,
                'jabatan' => $request->jabatan,
                'departemen' => $request->departemen,
            ]);
        }

        $this->logActivity('CREATE', 'Manajemen Pengguna', "Menambahkan akun baru: {$user->name} ({$user->username}, Role: {$user->role})");

        return redirect()->route('pengaturan.akun.index')->with('success', 'Pengguna berhasil ditambahkan.');
    }

    public function edit(User $akun)
    {
        $akun->load('karyawan');
        return Inertia::render('SuperAdmin/Akun/Form', [
            'userEdit' => $akun
        ]);
    }

    public function update(Request $request, User $akun)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => ['required', 'string', 'max:255', Rule::unique('users')->ignore($akun->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($akun->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::in(['admin', 'atasan', 'karyawan', 'super_admin'])],
        ]);

        if ($request->role === 'karyawan') {
            $request->validate([
                'no_hp' => 'nullable|string|max:255',
                'jabatan' => 'nullable|string|max:255',
                'departemen' => 'nullable|string|max:255',
            ]);
        }

        $data = [
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->email,
            'role' => $request->role,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $akun->update($data);

        if ($request->role === 'karyawan') {
            Karyawan::updateOrCreate(
                ['user_id' => $akun->id],
                [
                    'no_hp' => $request->no_hp,
                    'jabatan' => $request->jabatan,
                    'departemen' => $request->departemen,
                ]
            );
        }

        $this->logActivity('UPDATE', 'Manajemen Pengguna', "Memperbarui data akun: {$akun->name} ({$akun->username}, ID: {$akun->id})");

        return redirect()->route('pengaturan.akun.index')->with('success', 'Pengguna berhasil diperbarui.');
    }

    public function destroy(User $akun)
    {
        if ($akun->role === 'super_admin') {
            return redirect()->back()->with('error', 'Super Admin tidak dapat dihapus.');
        }

        $targetName = $akun->name;
        $targetUsername = $akun->username;
        $targetId = $akun->id;

        $akun->delete();

        $this->logActivity('DELETE', 'Manajemen Pengguna', "Menghapus akun pengguna: {$targetName} ({$targetUsername}, ID: {$targetId})");

        return redirect()->route('pengaturan.akun.index')->with('success', 'Pengguna berhasil dihapus.');
    }

    public function resetPassword(User $user)
    {
        $user->update([
            'password' => Hash::make('csa12345')
        ]);

        $this->logActivity('RESET PASSWORD', 'Manajemen Pengguna', "Mereset password pengguna: {$user->name} ({$user->username}) ke default");

        return redirect()->back()->with('success', 'Password berhasil di-reset menjadi: csa12345');
    }
}
