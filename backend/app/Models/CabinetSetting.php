<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CabinetSetting extends Model
{
    protected $fillable = [
        'name',
        'doctor_name',
        'specialty',
        'address',
        'city',
        'postal_code',
        'phone',
        'email',
        'logo_path',
        'location_text',
        'about',
        'opening_hours',
    ];

    public function logoUrl(): ?string
    {
        if (! $this->logo_path) {
            return null;
        }

        return '/storage/'.$this->logo_path;
    }

    public function toPublicArray(): array
    {
        return [
            'name' => $this->name,
            'doctor_name' => $this->doctor_name,
            'specialty' => $this->specialty,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'phone' => $this->phone,
            'email' => $this->email,
            'logo_url' => $this->logoUrl(),
            'location_text' => $this->location_text,
            'about' => $this->about,
            'opening_hours' => $this->opening_hours,
        ];
    }
}
