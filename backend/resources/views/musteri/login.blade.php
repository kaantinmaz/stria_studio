<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Giriş · Stria Studio</title>
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Jost:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{{ asset('musteri-assets/panel.css') }}?v={{ @filemtime(public_path('musteri-assets/panel.css')) }}">
<link rel="icon" href="{{ asset('favicon.ico') }}">
</head>
<body>
<div class="auth-wrap">
  <div class="auth-card">
    <img class="auth-logo" src="{{ asset('logo.png') }}" alt="Stria Studio">
    <h1>Müşteri Takip Paneli</h1>
    <p class="auth-sub">Stria Studio</p>

    @if ($errors->any())
      <div class="flash flash--error">{{ $errors->first() }}</div>
    @endif

    <form method="post" action="{{ route('musteri.login.submit') }}" class="form">
      @csrf
      <label class="field">
        <span>E-posta</span>
        <input type="email" name="email" value="{{ old('email') }}" autocomplete="username" required autofocus>
      </label>
      <label class="field">
        <span>Şifre</span>
        <input type="password" name="password" autocomplete="current-password" required>
      </label>
      <button type="submit" class="btn btn-primary btn-block">Giriş yap</button>
    </form>
  </div>
</div>
</body>
</html>
