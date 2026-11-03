<?php

namespace App\Http\Controllers;

use App\Models\RadiologyRequest;
use App\Services\PdfDocumentService;
use Illuminate\Http\Request;

class RadiologyRequestController extends Controller
{
    public function index()
    {
        return response()->json(
            RadiologyRequest::query()->with('patient')->latest('prescribed_at')->get()
        );
    }

    public function store(Request $request)
    {
        $indication = $request->input('indication') ?? $request->input('clinical_indication') ?? 'Bilan clinique et radiologique.';
        $region = $request->input('region');
        $notes = $request->input('notes') ?? '';
        if ($region) {
            $notes = trim($notes . ' Région anatomique : ' . $region);
        }
        if ($request->boolean('urgent')) {
            $notes = trim($notes . ' [URGENT]');
        }

        $prescribedAt = $request->input('prescribed_at') ?? now()->toDateString();

        $data = [
            'patient_id' => $request->validate(['patient_id' => ['required', 'exists:patients,id']])['patient_id'],
            'exam_type' => $request->validate(['exam_type' => ['required', 'string', 'max:255']])['exam_type'],
            'indication' => $indication,
            'prescribed_at' => $prescribedAt,
            'notes' => $notes ?: null,
            'user_id' => $request->user()->id,
        ];

        $item = RadiologyRequest::create($data);

        return response()->json($item->load('patient'), 201);
    }

    public function pdf(RadiologyRequest $radiologyRequest, PdfDocumentService $pdf)
    {
        return $pdf->radiology($radiologyRequest)->download('examen-radio-'.$radiologyRequest->id.'.pdf');
    }

    public function destroy(RadiologyRequest $radiologyRequest)
    {
        $radiologyRequest->delete();

        return response()->json(['message' => 'Demande supprimée.']);
    }
}
