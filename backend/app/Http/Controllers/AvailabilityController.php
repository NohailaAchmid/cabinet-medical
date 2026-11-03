<?php

namespace App\Http\Controllers;

use App\Models\Availability;
use Illuminate\Http\Request;

class AvailabilityController extends Controller
{
    public function index()
    {
        return response()->json(Availability::query()->orderBy('weekday')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'weekday' => ['required', 'integer', 'between:0,6'],
            'start_time' => ['required'],
            'end_time' => ['required'],
            'slot_minutes' => ['nullable', 'integer', 'min:10'],
            'is_active' => ['boolean'],
        ]);

        return response()->json(Availability::create($data), 201);
    }

    public function update(Request $request, Availability $availability)
    {
        $data = $request->validate([
            'weekday' => ['sometimes', 'integer', 'between:0,6'],
            'start_time' => ['sometimes'],
            'end_time' => ['sometimes'],
            'slot_minutes' => ['nullable', 'integer', 'min:10'],
            'is_active' => ['boolean'],
        ]);

        $availability->update($data);

        return response()->json($availability);
    }

    public function destroy(Availability $availability)
    {
        $availability->delete();

        return response()->json(['message' => 'Disponibilité supprimée.']);
    }
}
