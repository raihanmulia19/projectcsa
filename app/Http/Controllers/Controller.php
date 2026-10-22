<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

abstract class Controller
{
    /**
     * Helper untuk mencatat aktivitas log.
     */
    protected function logActivity($action, $module, $description, $userId = null)
    {
        self::recordActivity($action, $module, $description, $userId);
    }

    /**
     * Static helper untuk mencatat aktivitas log dari mana saja.
     */
    public static function recordActivity($action, $module, $description, $userId = null)
    {
        $id = $userId ?? Auth::id();
        DB::table('activity_logs')->insert([
            'user_id' => $id,
            'action' => $action,
            'module' => $module,
            'description' => $description,
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }
}
