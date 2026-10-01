<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Support\Carbon;

class StudioFactsController extends Controller
{
    public function __invoke()
    {
        // "Completed" follows the project convention (see App\Support\Loyalty):
        // confirmed appointments whose session already started.
        $base = Appointment::query()
            ->where('status', 'confirmed')
            ->where('starts_at', '<', now());

        $completedSessions = (clone $base)->count();
        $customersServed = (clone $base)->distinct()->whereNotNull('customer_id')->count('customer_id');
        $earliest = (clone $base)->min('starts_at');

        return response()->json([
            'data' => [
                'completed_sessions' => $completedSessions,
                'customers_served' => $customersServed,
                'records_since' => $earliest ? Carbon::parse($earliest)->format('Y-m-d') : null,
            ],
        ]);
    }
}
