@extends('pdf.layout')

@section('content')
    <h1>{{ $document->title }}</h1>
    <div class="box">
        <strong>Patient :</strong> {{ $patient->full_name }}<br>
        @if($patient->birth_date) Né(e) le {{ $patient->birth_date->format('d/m/Y') }}<br>@endif
        @if($patient->national_id) Identifiant : {{ $patient->national_id }}@endif
    </div>
    <p>{{ $document->content }}</p>
    @if($document->start_date)
        <p>Période : du {{ $document->start_date->format('d/m/Y') }}
            @if($document->end_date) au {{ $document->end_date->format('d/m/Y') }}@endif
        </p>
    @endif
    <div class="sign">
        <div>Fait le {{ $document->issued_at->format('d/m/Y') }}</div>
        <div class="stamp">{{ $document->user->name ?? $cabinet->doctor_name }}</div>
        <div>Signature du médecin</div>
    </div>
@endsection
