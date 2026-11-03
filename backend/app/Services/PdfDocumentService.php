<?php

namespace App\Services;

use App\Models\CabinetSetting;
use App\Models\Certificate;
use App\Models\Prescription;
use App\Models\RadiologyRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class PdfDocumentService
{
    public function prescription(Prescription $prescription)
    {
        $prescription->load(['patient', 'items', 'user']);

        return $this->make('pdf.prescription', [
            'document' => $prescription,
            'patient' => $prescription->patient,
            'items' => $prescription->items,
        ]);
    }

    public function certificate(Certificate $certificate)
    {
        $certificate->load(['patient', 'user']);

        return $this->make('pdf.certificate', [
            'document' => $certificate,
            'patient' => $certificate->patient,
        ]);
    }

    public function radiology(RadiologyRequest $request)
    {
        $request->load(['patient', 'user']);

        return $this->make('pdf.radiology', [
            'document' => $request,
            'patient' => $request->patient,
        ]);
    }

    private function make(string $view, array $data)
    {
        $cabinet = CabinetSetting::query()->first();
        $logo = null;

        if ($cabinet?->logo_path && Storage::disk('public')->exists($cabinet->logo_path)) {
            $logo = 'data:image/png;base64,'.base64_encode(Storage::disk('public')->get($cabinet->logo_path));
        }

        return Pdf::loadView($view, array_merge($data, [
            'cabinet' => $cabinet,
            'logo' => $logo,
        ]))->setPaper('a4');
    }
}
