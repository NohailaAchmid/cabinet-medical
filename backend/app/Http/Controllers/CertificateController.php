<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\Patient;
use App\Services\PdfDocumentService;
use Illuminate\Http\Request;

class CertificateController extends Controller
{
    public function index()
    {
        return response()->json(
            Certificate::query()->with('patient')->latest('issued_at')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'patient_id' => ['required', 'exists:patients,id'],
            'type' => ['required', 'string', 'max:100'],
            'title' => ['nullable', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'issued_at' => ['required', 'date'],
        ]);

        $patient = Patient::findOrFail($data['patient_id']);
        $data['user_id'] = $request->user()->id;
        $data['title'] = $data['title'] ?: $this->defaultTitle($data['type']);
        $data['content'] = $data['content'] ?: $this->defaultContent($data['type'], $patient, $data);

        $certificate = Certificate::create($data);

        return response()->json($certificate->load('patient'), 201);
    }

    public function pdf(Certificate $certificate, PdfDocumentService $pdf)
    {
        return $pdf->certificate($certificate)->download('attestation-'.$certificate->id.'.pdf');
    }

    public function destroy(Certificate $certificate)
    {
        $certificate->delete();

        return response()->json(['message' => 'Attestation supprimée.']);
    }

    private function defaultTitle(string $type): string
    {
        return match ($type) {
            'presence' => 'Attestation de présence',
            'medical' => 'Certificat médical',
            'consultation' => 'Attestation de consultation',
            default => 'Document médical',
        };
    }

    private function defaultContent(string $type, Patient $patient, array $data): string
    {
        $name = $patient->full_name;
        $start = $data['start_date'] ?? now()->toDateString();
        $end = $data['end_date'] ?? $start;

        return match ($type) {
            'presence' => "Je soussigné(e) certifie que {$name} s’est présenté(e) à la consultation du {$start}.",
            'medical' => "Je soussigné(e) certifie que l’état de santé de {$name} nécessite un repos / une dispense du {$start} au {$end}.",
            'consultation' => "Je soussigné(e) atteste avoir examiné {$name} en consultation à la date du {$start}.",
            default => "Document établi pour {$name} en date du {$start}.",
        };
    }
}
