@php
    use Illuminate\Support\Facades\Auth;
    $user = Auth::guard('web')->user();
    $cur = request()->path();
    $nav = function (string $p) use ($cur): string {
        if ($p === '/') {
            return $cur === '/' ? ' active' : '';
        }
        $p = ltrim($p, '/');
        return ($cur === $p || str_starts_with($cur, $p.'/')) ? ' active' : '';
    };
    $icons = [
        'panel' => '<path d="M4 13h7V4H4zM13 20h7V4h-7zM4 20h7v-5H4z"/>',
        'randevular' => '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        'musteriler' => '<circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 5.5a3 3 0 0 1 0 5.5M17.5 19a5 5 0 0 0-3-4.6"/>',
        'raporlar' => '<path d="M5 20V10M12 20V4M19 20v-7"/>',
        'disa' => '<path d="M12 3v12M8 7l4-4 4 4M5 21h14"/>',
        'cikis' => '<path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 12h9M16 8l4 4-4 4"/>',
        'menu' => '<path d="M4 6h16M4 12h16M4 18h16"/>',
        'plus' => '<path d="M12 5v14M5 12h14"/>',
    ];
    $svg = fn (string $n) => '<svg viewBox="0 0 24 24" aria-hidden="true">'.($icons[$n] ?? '').'</svg>';
    $flash = session('flash');
@endphp
<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>@yield('title', 'Panel') · Stria Studio</title>
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ asset('musteri-assets/panel.css') }}?v={{ @filemtime(public_path('musteri-assets/panel.css')) }}">
<link rel="icon" href="{{ asset('favicon.ico') }}">
</head>
<body>
<div class="app">
  <div class="scrim" id="scrim"></div>

  <aside class="sidebar" id="sidebar">
    <a class="brand" href="{{ route('musteri.dashboard') }}">
      <img src="{{ asset('logo.png') }}" alt="Stria Studio">
      <span>Stria Studio</span>
    </a>
    <nav class="nav">
      <a class="nav-link{{ $nav('/') }}" href="{{ route('musteri.dashboard') }}">{!! $svg('panel') !!}<span>Özet</span></a>
      <a class="nav-link{{ $nav('/randevular') }}" href="{{ route('musteri.appointments.index') }}">{!! $svg('randevular') !!}<span>Randevular</span></a>
      <a class="nav-link{{ $nav('/musteriler') }}" href="{{ route('musteri.customers.index') }}">{!! $svg('musteriler') !!}<span>Müşteriler</span></a>
      <a class="nav-link{{ $nav('/raporlar') }}" href="{{ route('musteri.reports.index') }}">{!! $svg('raporlar') !!}<span>Raporlar</span></a>
      <a class="nav-link{{ $nav('/disa-aktar') }}" href="{{ route('musteri.export.index') }}">{!! $svg('disa') !!}<span>Dışa Aktar</span></a>
    </nav>
    <div class="nav-foot">
      <span class="nav-link" style="cursor:default">{{ $user?->name ?? 'Hesap' }}</span>
      <form method="post" action="{{ route('musteri.logout') }}">
        @csrf
        <button type="submit" class="nav-link nav-logout">{!! $svg('cikis') !!}<span>Çıkış</span></button>
      </form>
    </div>
  </aside>

  <div class="content">
    <header class="appbar">
      <button class="icon-btn menu-toggle" data-menu-toggle aria-label="Menü">{!! $svg('menu') !!}</button>
      <div class="appbar-title"><h1>@yield('title', 'Panel')</h1></div>
      @hasSection('appbar-action')@yield('appbar-action')@endif
    </header>

    <main class="main">
      @if ($flash)
        <div class="flash flash--{{ $flash['type'] === 'error' ? 'error' : ($flash['type'] === 'warn' ? 'warn' : 'success') }}">{{ $flash['message'] }}</div>
      @endif
      @yield('content')
    </main>
  </div>
</div>

<nav class="bottombar">
  <a class="bb-item{{ $nav('/') }}" href="{{ route('musteri.dashboard') }}">{!! $svg('panel') !!}<span>Özet</span></a>
  <a class="bb-item{{ $nav('/randevular') }}" href="{{ route('musteri.appointments.index') }}">{!! $svg('randevular') !!}<span>Randevu</span></a>
  <a class="bb-item{{ $nav('/musteriler') }}" href="{{ route('musteri.customers.index') }}">{!! $svg('musteriler') !!}<span>Müşteri</span></a>
  <a class="bb-item{{ $nav('/raporlar') }}" href="{{ route('musteri.reports.index') }}">{!! $svg('raporlar') !!}<span>Rapor</span></a>
</nav>

@stack('scripts')
<script src="{{ asset('musteri-assets/panel.js') }}?v={{ @filemtime(public_path('musteri-assets/panel.js')) }}" defer></script>
</body>
</html>
