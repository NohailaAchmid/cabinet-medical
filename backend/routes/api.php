<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AppointmentRequestController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\CabinetController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ConsultationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MedicationController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\RadiologyRequestController;
use Illuminate\Support\Facades\Route;

Route::prefix('public')->group(function () {
    Route::get('/cabinet', [CabinetController::class, 'publicInfo']);
    Route::get('/slots', [CabinetController::class, 'slots']);
    Route::post('/appointment-requests', [AppointmentRequestController::class, 'publicStore']);
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/cabinet', [CabinetController::class, 'show']);
    Route::post('/cabinet', [CabinetController::class, 'update']);
    Route::get('/backup', [BackupController::class, 'download']);

    Route::apiResource('patients', PatientController::class);
    Route::post('/patients/{patient}/consultations', [ConsultationController::class, 'store']);
    Route::put('/consultations/{consultation}', [ConsultationController::class, 'update']);
    Route::delete('/consultations/{consultation}', [ConsultationController::class, 'destroy']);

    Route::apiResource('appointments', AppointmentController::class)->except(['show']);
    Route::get('/appointment-requests', [AppointmentRequestController::class, 'index']);
    Route::post('/appointment-requests/{appointmentRequest}/confirm', [AppointmentRequestController::class, 'confirm']);
    Route::post('/appointment-requests/{appointmentRequest}/refuse', [AppointmentRequestController::class, 'refuse']);

    Route::apiResource('availabilities', AvailabilityController::class)->except(['show']);
    Route::apiResource('medications', MedicationController::class)->except(['show']);

    Route::get('/prescriptions', [PrescriptionController::class, 'index']);
    Route::post('/prescriptions', [PrescriptionController::class, 'store']);
    Route::get('/prescriptions/{prescription}', [PrescriptionController::class, 'show']);
    Route::delete('/prescriptions/{prescription}', [PrescriptionController::class, 'destroy']);
    Route::get('/prescriptions/{prescription}/pdf', [PrescriptionController::class, 'pdf']);

    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::post('/certificates', [CertificateController::class, 'store']);
    Route::delete('/certificates/{certificate}', [CertificateController::class, 'destroy']);
    Route::get('/certificates/{certificate}/pdf', [CertificateController::class, 'pdf']);

    Route::get('/radiology-requests', [RadiologyRequestController::class, 'index']);
    Route::post('/radiology-requests', [RadiologyRequestController::class, 'store']);
    Route::delete('/radiology-requests/{radiologyRequest}', [RadiologyRequestController::class, 'destroy']);
    Route::get('/radiology-requests/{radiologyRequest}/pdf', [RadiologyRequestController::class, 'pdf']);
});
