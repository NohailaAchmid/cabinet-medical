<?php

namespace App\Http\Controllers;

use App\Models\Medication;
use App\Models\Prescription;
use App\Services\PdfDocumentService;
use Illuminate\Http\Request;

class PrescriptionController extends Controller
{
    public function index()
    {
        return response()->json(
            Prescription::query()->with(['patient', 'items'])->latest('prescribed_at')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'consultation_id' => ['nullable', 'exists:consultations,id'],
            'prescribed_at' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.medication_id' => ['nullable', 'exists:medications,id'],
            'items.*.medication_name' => ['nullable', 'string', 'max:255'],
            'items.*.dosage' => ['nullable', 'string', 'max:120'],
            'items.*.posology' => ['nullable', 'string', 'max:255'],
            'items.*.duration' => ['nullable', 'string', 'max:120'],
            'items.*.quantity' => ['nullable', 'string', 'max:120'],
        ]);

        $prescription = Prescription::create([
            'patient_id' => $data['patient_id'],
            'consultation_id' => $data['consultation_id'] ?? null,
            'user_id' => $request->user()->id,
            'prescribed_at' => $data['prescribed_at'],
            'notes' => $data['notes'] ?? null,
        ]);

        foreach ($data['items'] as $item) {
            $name = $item['medication_name'] ?? null;
            if (! $name && ! empty($item['medication_id'])) {
                $name = Medication::query()->find($item['medication_id'])?->name;
            }

            $prescription->items()->create([
                'medication_id' => $item['medication_id'] ?? null,
                'medication_name' => $name ?: 'Médicament',
                'dosage' => $item['dosage'] ?? null,
                'posology' => $item['posology'] ?? null,
                'duration' => $item['duration'] ?? null,
                'quantity' => $item['quantity'] ?? null,
            ]);
        }

        return response()->json($prescription->load(['patient', 'items']), 201);
    }

    public function show(Prescription $prescription)
    {
        return response()->json($prescription->load(['patient', 'items', 'user']));
    }

    public function destroy(Prescription $prescription)
    {
        $prescription->delete();

        return response()->json(['message' => 'Ordonnance supprimée.']);
    }

    public function pdf(Prescription $prescription, PdfDocumentService $pdf)
    {
        $filename = 'ordonnance-'.$prescription->id.'.pdf';

        return $pdf->prescription($prescription)->download($filename);
    }
}
