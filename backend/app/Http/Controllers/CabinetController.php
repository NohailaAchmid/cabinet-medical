<?php

namespace App\Http\Controllers;

use App\Models\Availability;
use App\Models\CabinetSetting;
use App\Services\SlotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CabinetController extends Controller
{
    public function publicInfo(SlotService $slots)
    {
        $cabinet = CabinetSetting::query()->first();
        $availabilities = Availability::query()->where('is_active', true)->orderBy('weekday')->get();

        return response()->json([
            'cabinet' => $cabinet?->toPublicArray(),
            'availabilities' => $availabilities,
        ]);
    }

    public function slots(Request $request, SlotService $slots)
    {
        $data = $request->validate([
            'date' => ['required', 'date'],
        ]);

        return response()->json($slots->slotsForDate($data['date']));
    }

    public function show()
    {
        return response()->json(CabinetSetting::query()->first());
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'doctor_name' => ['required', 'string', 'max:255'],
            'specialty' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email'],
            'location_text' => ['nullable', 'string', 'max:255'],
            'about' => ['nullable', 'string'],
            'opening_hours' => ['nullable', 'string'],
            'logo' => ['nullable', 'image', 'max:2048'],
        ]);

        $cabinet = CabinetSetting::query()->firstOrNew();

        if ($request->hasFile('logo')) {
            if ($cabinet->logo_path) {
                Storage::disk('public')->delete($cabinet->logo_path);
            }
            $data['logo_path'] = $request->file('logo')->store('logos', 'public');
        }

        unset($data['logo']);
        $cabinet->fill($data)->save();

        return response()->json($cabinet->fresh());
    }
}
