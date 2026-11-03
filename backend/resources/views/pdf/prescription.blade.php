@extends('pdf.layout')

@section('content')
    <h1>Ordonnance médicale</h1>
    <div class="box">
        <strong>Patient :</strong> {{ $patient->full_name }}<br>
        @if($patient->birth_date) Date de naissance : {{ $patient->birth_date->format('d/m/Y') }}<br>@endif
        @if($patient->address) Adresse : {{ $patient->address }} {{ $patient->city }}@endif
    </div>
    <table>
        <thead>
            <tr>
                <th>Médicament</th>
                <th>Dosage</th>
                <th>Posologie</th>
                <th>Durée</th>
                <th>Qté</th>
            </tr>
        </thead>
        <tbody>
            @foreach($items as $item)
                <tr>
                    <td>{{ $item->medication_name }}</td>
                    <td>{{ $item->dosage }}</td>
                    <td>{{ $item->posology }}</td>
                    <td>{{ $item->duration }}</td>
                    <td>{{ $item->quantity }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
    @if($document->notes)
        <p><strong>Notes :</strong> {{ $document->notes }}</p>
    @endif
    <div class="sign">
        <div>Fait le {{ $document->prescribed_at->format('d/m/Y') }}</div>
        <div class="stamp">{{ $document->user->name ?? $cabinet->doctor_name }}</div>
        <div>Signature du médecin</div>
    </div>
@endsection
