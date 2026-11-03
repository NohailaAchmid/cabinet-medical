<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 28px 32px; }
        body { font-family: DejaVu Sans, sans-serif; color: #0f172a; font-size: 12px; }
        .header { display: table; width: 100%; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 18px; }
        .header-left, .header-right { display: table-cell; vertical-align: middle; }
        .header-right { text-align: right; }
        .logo { height: 58px; }
        .clinic { font-size: 18px; color: #2563eb; font-weight: bold; margin: 0; }
        .muted { color: #64748b; }
        h1 { font-size: 16px; letter-spacing: 1px; text-transform: uppercase; color: #2563eb; text-align: center; margin: 22px 0 18px; }
        .box { border: 1px solid #e2e8f0; background: #f8fafc; padding: 10px 12px; margin-bottom: 14px; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #2563eb; color: #fff; text-align: left; padding: 7px 8px; font-size: 11px; }
        td { border-bottom: 1px solid #e2e8f0; padding: 8px; }
        .footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 8px; }
        .sign { margin-top: 40px; text-align: right; }
        .stamp { font-size: 11px; color: #2563eb; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <div class="header-left">
            @if($logo)
                <img class="logo" src="{{ $logo }}" alt="logo">
            @endif
            <p class="clinic">{{ $cabinet->name ?? 'Cabinet médical' }}</p>
            <div class="muted">{{ $cabinet->specialty ?? '' }}</div>
        </div>
        <div class="header-right muted">
            <div>{{ $cabinet->doctor_name ?? '' }}</div>
            <div>{{ $cabinet->address ?? '' }} {{ $cabinet->city ?? '' }}</div>
            <div>{{ $cabinet->phone ?? '' }} · {{ $cabinet->email ?? '' }}</div>
            <div>{{ $cabinet->location_text ?? '' }}</div>
        </div>
    </div>
    @yield('content')
    <div class="footer">
        Document généré électroniquement — {{ $cabinet->name ?? 'Cabinet' }} — confidentiel
    </div>
</body>
</html>
