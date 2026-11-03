<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Patient extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'birth_date',
        'gender',
        'national_id',
        'address',
        'city',
        'blood_type',
        'allergies',
        'medical_history',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function getFullNameAttribute(): string
    {
        return trim($this->last_name.' '.$this->first_name);
    }

    public function consultations(): HasMany
    {
        return $this->hasMany(Consultation::class)->orderByDesc('consulted_at');
    }

    public function appointments(): HasMany
    {
        return $this->hasMany(Appointment::class)->orderByDesc('date');
    }

    public function prescriptions(): HasMany
    {
        return $this->hasMany(Prescription::class)->orderByDesc('prescribed_at');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class)->orderByDesc('issued_at');
    }

    public function radiologyRequests(): HasMany
    {
        return $this->hasMany(RadiologyRequest::class)->orderByDesc('prescribed_at');
    }
}
