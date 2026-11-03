<?php

namespace App\Http\Controllers;

use App\Models\Medication;
use Illuminate\Http\Request;

class MedicationController extends Controller
{
    public function index(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $items = Medication::query()
            ->when($q !== '', fn ($query) => $query->where('name', 'like', "%{$q}%")
                ->orWhere('form', 'like', "%{$q}%"))
            ->orderBy('name')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        return response()->json(Medication::create($this->rules($request)), 201);
    }

    public function update(Request $request, Medication $medication)
    {
        $medication->update($this->rules($request, false));

        return response()->json($medication);
    }

    public function destroy(Medication $medication)
    {
        $medication->delete();

        return response()->json(['message' => 'Médicament supprimé.']);
    }

    private function rules(Request $request, bool $creating = true): array
    {
        return $request->validate([
            'name' => [$creating ? 'required' : 'sometimes', 'string', 'max:255'],
            'form' => ['nullable', 'string', 'max:120'],
            'dosage' => ['nullable', 'string', 'max:120'],
            'manufacturer' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);
    }
}
