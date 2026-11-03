<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    public function index(Request $request)
    {
        $date = $request->query('date');
        $status = $request->query('status');

        $appointments = Appointment::query()
            ->with('patient')
            ->when($date, fn ($q) => $q->whereDate('date', $date))
            ->when($status, fn ($q) => $q->where('status', $status))
            ->orderBy('date')
            ->orderBy('time')
            ->get()
            ->map(function (Appointment $appointment) {
                return array_merge($appointment->toArray(), [
                    'display_name' => $appointment->displayName(),
                    'time' => substr((string) $appointment->time, 0, 5),
                ]);
            });

        return response()->json($appointments);
    }

    public function store(Request $request)
    {
        if ($request->has('patient_name') && ! $request->has('guest_name')) {
            $request->merge(['guest_name' => $request->input('patient_name')]);
        }
        if ($request->has('patient_phone') && ! $request->has('guest_phone')) {
            $request->merge(['guest_phone' => $request->input('patient_phone')]);
        }

        $data = $this->validated($request, true);
        $data['source'] = $data['source'] ?? 'doctor';
        $appointment = Appointment::create($data);

        return response()->json($appointment->load('patient'), 201);
    }

    public function update(Request $request, Appointment $appointment)
    {
        $appointment->update($this->validated($request, false));

        return response()->json($appointment->load('patient'));
    }

    public function destroy(Appointment $appointment)
    {
        $appointment->update(['status' => 'cancelled']);

        return response()->json($appointment);
    }

    private function validated(Request $request, bool $creating): array
    {
        return $request->validate([
            'patient_id' => ['nullable', 'exists:patients,id'],
            'guest_name' => ['nullable', 'string', 'max:255'],
            'guest_email' => ['nullable', 'email'],
            'guest_phone' => ['nullable', 'string', 'max:50'],
            'date' => [$creating ? 'required' : 'sometimes', 'date'],
            'time' => [$creating ? 'required' : 'sometimes'],
            'duration' => ['nullable', 'integer', 'min:10'],
            'reason' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'string', 'max:40'],
            'source' => ['nullable', 'string', 'max:40'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
