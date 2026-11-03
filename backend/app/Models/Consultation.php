<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Consultation extends Model
{
    protected $fillable = [
        'patient_id',
        'consulted_at',
        'reason',
        'diagnosis',
        'notes',
        'blood_pressure',
        'temperature',
        'weight',
        'height',
    ];

    protected function casts(): array
    {
        return [
            'consulted_at' => 'datetime',
            'temperature' => 'float',
            'weight' => 'float',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }
}
