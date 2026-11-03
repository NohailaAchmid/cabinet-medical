<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Appointment extends Model
{
    protected $fillable = [
        'patient_id',
        'guest_name',
        'guest_email',
        'guest_phone',
        'date',
        'time',
        'duration',
        'reason',
        'status',
        'source',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function displayName(): string
    {
        if ($this->patient) {
            return $this->patient->full_name;
        }

        return $this->guest_name ?? 'Patient';
    }
}
