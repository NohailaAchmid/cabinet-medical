<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentRequest;
use App\Models\Patient;
use App\Models\Prescription;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->toDateString();

        return response()->json([
            'patients_count' => Patient::count(),
            'appointments_today' => Appointment::query()
                ->whereDate('date', $today)
                ->whereNotIn('status', ['cancelled'])
                ->count(),
            'pending_requests' => AppointmentRequest::query()->where('status', 'pending')->count(),
            'prescriptions_month' => Prescription::query()
                ->whereMonth('prescribed_at', now()->month)
                ->whereYear('prescribed_at', now()->year)
                ->count(),
            'upcoming' => Appointment::query()
                ->with('patient')
                ->whereDate('date', '>=', $today)
                ->whereNotIn('status', ['cancelled', 'completed'])
                ->orderBy('date')
                ->orderBy('time')
                ->limit(8)
                ->get()
                ->map(fn (Appointment $a) => [
                    'id' => $a->id,
                    'date' => $a->date->toDateString(),
                    'time' => substr((string) $a->time, 0, 5),
                    'status' => $a->status,
                    'reason' => $a->reason,
                    'name' => $a->displayName(),
                ]),
            'latest_patients' => Patient::query()->latest()->limit(5)->get(),
        ]);
    }
}
