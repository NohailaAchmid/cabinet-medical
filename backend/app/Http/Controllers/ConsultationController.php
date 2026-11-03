<?php

namespace App\Http\Controllers;

use App\Models\Consultation;
use App\Models\Patient;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function store(Request $request, Patient $patient)
    {
        $data = $request->validate([
            'consulted_at' => ['required', 'date'],
            'reason' => ['nullable', 'string', 'max:255'],
            'diagnosis' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'blood_pressure' => ['nullable', 'string', 'max:30'],
            'temperature' => ['nullable', 'numeric'],
            'weight' => ['nullable', 'numeric'],
            'height' => ['nullable', 'integer'],
        ]);

        $consultation = $patient->consultations()->create($data);

        return response()->json($consultation, 201);
    }

    public function update(Request $request, Consultation $consultation)
    {
        $data = $request->validate([
            'consulted_at' => ['sometimes', 'date'],
            'reason' => ['nullable', 'string', 'max:255'],
            'diagnosis' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
            'blood_pressure' => ['nullable', 'string', 'max:30'],
            'temperature' => ['nullable', 'numeric'],
            'weight' => ['nullable', 'numeric'],
            'height' => ['nullable', 'integer'],
        ]);

        $consultation->update($data);

        return response()->json($consultation);
    }

    public function destroy(Consultation $consultation)
    {
        $consultation->delete();

        return response()->json(['message' => 'Consultation supprimée.']);
    }
}
