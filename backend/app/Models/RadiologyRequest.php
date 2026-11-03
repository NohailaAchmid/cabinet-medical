<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RadiologyRequest extends Model
{
    protected $fillable = [
        'patient_id',
        'user_id',
        'exam_type',
        'indication',
        'prescribed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'prescribed_at' => 'date',
        ];
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
