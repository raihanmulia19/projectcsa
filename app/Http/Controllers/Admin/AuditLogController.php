<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('activity_logs')
            ->leftJoin('users', 'activity_logs.user_id', '=', 'users.id')
            ->select('activity_logs.*', 'users.name as user_name', 'users.role as user_role');

        if ($request->filled('action') && $request->action !== 'all') {
            $query->where('activity_logs.action', $request->action);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('activity_logs.description', 'like', "%{$search}%")
                  ->orWhere('activity_logs.module', 'like', "%{$search}%")
                  ->orWhere('users.name', 'like', "%{$search}%")
                  ->orWhere('users.username', 'like', "%{$search}%");
            });
        }

        $logs = $query->orderBy('activity_logs.created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('SuperAdmin/AuditLog', [
            'logs' => $logs,
            'filters' => [
                'action' => $request->action ?? 'all',
                'search' => $request->search ?? '',
            ]
        ]);
    }

    public function logExport(Request $request)
    {
        $request->validate([
            'module' => 'required|string',
            'file_type' => 'required|string',
            'description' => 'required|string',
        ]);

        $this->logActivity('EXPORT', $request->module, $request->description);

        return back();
    }

    public function backupNow(Request $request)
    {
        try {
            $bufferedOutput = new \Symfony\Component\Console\Output\BufferedOutput();
            $exitCode = \Illuminate\Support\Facades\Artisan::call('backup:to-drive', ['--only-db' => true], $bufferedOutput);
            $output = $bufferedOutput->fetch();

            if ($exitCode === 0) {
                return back()->with('success', 'Backup database berhasil dibuat dan diunggah ke Google Drive!');
            }
            return back()->with('error', 'Gagal backup: ' . (trim($output) ?: 'Terjadi kesalahan saat memproses backup.'));
        } catch (\Exception $e) {
            return back()->with('error', 'Error backup: ' . $e->getMessage());
        }
    }
}
