<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use Illuminate\Http\Request;

class PatientController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $patients = Patient::query()
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($inner) use ($q) {
                    $inner->where('first_name', 'like', "%{$q}%")
                        ->orWhere('last_name', 'like', "%{$q}%")
                        ->orWhere('phone', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%")
                        ->orWhere('national_id', 'like', "%{$q}%");
                });
            })
            ->orderBy('last_name')
            ->paginate(12);

        return response()->json($patients);
    }

    public function store(Request $request)
    {
        $patient = Patient::create($this->rules($request));

        return response()->json($patient, 201);
    }

    public function show(Patient $patient)
    {
        $patient->load(['consultations', 'appointments', 'prescriptions.items', 'certificates', 'radiologyRequests']);

        return response()->json($patient);
    }

    public function update(Request $request, Patient $patient)
    {
        $patient->update($this->rules($request, false));

        return response()->json($patient);
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();

        return response()->json(['message' => 'Patient supprimé.']);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        return $request->validate([
            'first_name' => [$creating ? 'required' : 'sometimes', 'string', 'max:120'],
            'last_name' => [$creating ? 'required' : 'sometimes', 'string', 'max:120'],
            'email' => ['nullable', 'email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:20'],
            'national_id' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:120'],
            'blood_type' => ['nullable', 'string', 'max:10'],
            'allergies' => ['nullable', 'string'],
            'medical_history' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);
    }
}
