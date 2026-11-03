<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AppointmentRequest;
use App\Models\CabinetSetting;
use App\Models\Certificate;
use App\Models\Medication;
use App\Models\Patient;
use App\Models\Prescription;
use App\Models\RadiologyRequest;
use Illuminate\Support\Facades\Storage;

class BackupController extends Controller
{
    public function download()
    {
        $payload = [
            'exported_at' => now()->toIso8601String(),
            'cabinet' => CabinetSetting::query()->first(),
            'patients' => Patient::with('consultations')->get(),
            'appointments' => Appointment::all(),
            'appointment_requests' => AppointmentRequest::all(),
            'medications' => Medication::all(),
            'prescriptions' => Prescription::with('items')->get(),
            'certificates' => Certificate::all(),
            'radiology_requests' => RadiologyRequest::all(),
        ];

        $filename = 'sauvegarde-cabinet-'.now()->format('Y-m-d-His').'.json';
        Storage::disk('local')->put('backups/'.$filename, json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

        return response()->streamDownload(function () use ($payload) {
            echo json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        }, $filename, ['Content-Type' => 'application/json']);
    }
}
