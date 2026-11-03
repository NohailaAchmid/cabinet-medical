<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AppointmentRequest extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'phone',
        'requested_date',
        'requested_time',
        'reason',
        'status',
        'appointment_id',
        'doctor_note',
    ];

    protected function casts(): array
    {
        return [
            'requested_date' => 'date',
        ];
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
