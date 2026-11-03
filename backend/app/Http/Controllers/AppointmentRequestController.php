<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentRequest;
use App\Models\Patient;
use App\Services\SlotService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AppointmentRequestController extends Controller
{
    public function publicStore(Request $request, SlotService $slots)
    {
        $data = $request->validate([
            'first_name' => ['required', 'string', 'max:120'],
            'last_name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email'],
            'phone' => ['required', 'string', 'max:50'],
            'requested_date' => ['required', 'date', 'after_or_equal:today'],
            'requested_time' => ['required'],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $available = collect($slots->slotsForDate($data['requested_date']))
            ->firstWhere('time', substr($data['requested_time'], 0, 5));

        if (! $available || ! $available['available']) {
            throw ValidationException::withMessages([
                'requested_time' => ['Ce créneau n’est plus disponible.'],
            ]);
        }

        $item = AppointmentRequest::create($data);

        return response()->json([
            'message' => 'Votre demande a bien été transmise au médecin.',
            'request' => $item,
        ], 201);
    }

    public function index(Request $request)
    {
        $status = $request->query('status');

        $items = AppointmentRequest::query()
            ->when($status, fn ($q) => $q->where('status', $status))
            ->latest()
            ->get();

        return response()->json($items);
    }

    public function confirm(Request $request, AppointmentRequest $appointmentRequest)
    {
        if ($appointmentRequest->status !== 'pending') {
            return response()->json(['message' => 'Cette demande a déjà été traitée.'], 422);
        }

        $patient = Patient::query()
            ->where('email', $appointmentRequest->email)
            ->orWhere(function ($q) use ($appointmentRequest) {
                $q->where('first_name', $appointmentRequest->first_name)
                    ->where('last_name', $appointmentRequest->last_name)
                    ->where('phone', $appointmentRequest->phone);
            })
            ->first();

        if (! $patient) {
            $patient = Patient::create([
                'first_name' => $appointmentRequest->first_name,
                'last_name' => $appointmentRequest->last_name,
                'email' => $appointmentRequest->email,
                'phone' => $appointmentRequest->phone,
            ]);
        }

        $appointment = Appointment::create([
            'patient_id' => $patient->id,
            'date' => $appointmentRequest->requested_date,
            'time' => $appointmentRequest->requested_time,
            'reason' => $appointmentRequest->reason,
            'status' => 'confirmed',
            'source' => 'request',
        ]);

        $appointmentRequest->update([
            'status' => 'confirmed',
            'appointment_id' => $appointment->id,
            'doctor_note' => $request->input('doctor_note'),
        ]);

        return response()->json($appointmentRequest->fresh('appointment'));
    }

    public function refuse(Request $request, AppointmentRequest $appointmentRequest)
    {
        $appointmentRequest->update([
            'status' => 'refused',
            'doctor_note' => $request->input('doctor_note'),
        ]);

        return response()->json($appointmentRequest);
    }
}
