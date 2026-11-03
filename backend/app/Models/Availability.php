<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Availability extends Model
{
    protected $fillable = [
        'weekday',
        'start_time',
        'end_time',
        'slot_minutes',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'weekday' => 'integer',
            'slot_minutes' => 'integer',
        ];
    }
}
