@extends('pdf.layout')

@section('content')
    <h1>Demande d’examen radiologique</h1>
    <div class="box">
        <strong>Patient :</strong> {{ $patient->full_name }}<br>
        @if($patient->birth_date) Date de naissance : {{ $patient->birth_date->format('d/m/Y') }}<br>@endif
        @if($patient->phone) Téléphone : {{ $patient->phone }}@endif
    </div>
    <p><strong>Examen demandé :</strong> {{ $document->exam_type }}</p>
    <p><strong>Indication médicale :</strong><br>{{ $document->indication }}</p>
    @if($document->notes)
        <p><strong>Notes :</strong> {{ $document->notes }}</p>
    @endif
    <div class="sign">
        <div>Prescrit le {{ $document->prescribed_at->format('d/m/Y') }}</div>
        <div class="stamp">{{ $document->user->name ?? $cabinet->doctor_name }}</div>
        <div>Signature du médecin</div>
    </div>
@endsection
