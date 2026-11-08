@extends('musteri.layout')
@section('title', 'Randevu')
@php
  use App\Support\MusteriPanel as MP;
  use App\Support\BodyRegions;
@endphp

@section('content')
<a class="back-link" href="{{ route('musteri.appointments.index') }}">← Randevular</a>

<div class="page-head">
  <div>
    <h1>{{ $appointment->starts_at->format('d.m.Y H:i') }}</h1>
    <div class="greeting">
      <span class="chip {{ MP::statusClass($appointment->status) }}">{{ MP::statusLabel($appointment->status) }}</span>
      @if ($appointment->app_user_id)<span class="badge-mobil">Mobil uygulama</span>@endif
    </div>
  </div>
  <div class="head-actions">
    @if ($appointment->status === 'requested')
      <form method="post" action="{{ route('musteri.appointments.confirm', $appointment->id) }}">@csrf<button class="btn btn-sm btn-primary">Onayla</button></form>
    @endif
    <a class="btn btn-outline btn-sm" href="{{ route('musteri.appointments.edit', $appointment->id) }}">Düzenle</a>
    <form method="post" action="{{ route('musteri.appointments.destroy', $appointment->id) }}" data-confirm="Bu randevu silinsin mi?">
      @csrf @method('DELETE')
      <button class="btn btn-sm btn-danger">Sil</button>
    </form>
  </div>
</div>

<div class="col-2">
  <div class="card pad">
    <h2 class="card-title">Randevu</h2>
    <dl class="dl">
      <dt>Müşteri</dt>
      <dd>@if ($appointment->customer)<a class="link" href="{{ route('musteri.customers.show', $appointment->customer->id) }}">{{ $appointment->customer->name }}</a>@if ($appointment->customer->phone) · {{ $appointment->customer->phone }}@endif @else Silinmiş müşteri @endif</dd>
      <dt>Hizmet</dt><dd>{{ $appointment->service?->name_tr ?? '—' }}</dd>
      <dt>Alt uygulamalar</dt><dd>{{ filled($appointment->subservices) ? implode(', ', $appointment->subservices) : '—' }}</dd>
      <dt>Bölgeler</dt><dd>{{ filled($appointment->body_regions) ? BodyRegions::labels($appointment->body_regions) : '—' }}</dd>
      <dt>Süre</dt><dd>{{ $appointment->duration_min }} dk</dd>
      <dt>Seans</dt><dd>@if ($appointment->isSessionPackage()){{ $appointment->session_no }}/{{ $appointment->session_total }}@else Tek randevu @endif</dd>
      <dt>Kampanya</dt><dd>{{ $appointment->campaign?->title ?? '—' }}</dd>
      <dt>Kaynak</dt><dd>{{ MP::sourceLabel($appointment) }}</dd>
      <dt>Not</dt><dd>{{ $appointment->note ?? '—' }}</dd>
    </dl>
  </div>

  <div class="card pad">
    <h2 class="card-title">Ödeme <span class="muted small">(paket kökü: {{ $root->starts_at->format('d.m.Y') }})</span></h2>
    <dl class="dl">
      <dt>Tutar</dt><dd>{{ $root->price !== null ? MP::money($root->price) : '—' }}</dd>
      <dt>Durum</dt><dd>@if ($root->is_paid)<span class="chip chip-ok">Ödendi</span>@else<span class="chip chip-warn">Ödenmedi</span>@endif</dd>
      <dt>Yöntem</dt><dd>{{ MP::paymentLabel($root->payment_method) }}</dd>
      <dt>Ödeme zamanı</dt><dd>{{ $root->paid_at?->format('d.m.Y H:i') ?? '—' }}</dd>
    </dl>
    @if ($appointment->isSessionChild())
      <p class="muted small" style="margin-top:12px">Para yalnızca paketin 1. seansında tutulur.</p>
    @endif
  </div>
</div>

@if ($sessions->count() > 1)
<div class="card pad">
  <h2 class="card-title">Paket seansları ({{ $sessions->count() }})</h2>
  <div class="session-list">
    @foreach ($sessions as $s)
      <a class="session-row {{ $s->is($appointment) ? 'is-current' : '' }}" href="{{ route('musteri.appointments.show', $s->id) }}">
        <span class="session-no">{{ $s->session_no }}</span>
        <span style="flex:1">{{ $s->starts_at->format('d.m.Y H:i') }} · {{ $s->duration_min }} dk</span>
        <span class="chip {{ MP::statusClass($s->status) }}">{{ MP::statusLabel($s->status) }}</span>
      </a>
    @endforeach
  </div>
</div>
@endif

@php $photos = $appointment->photoUrls(); @endphp
@if (count($photos))
<div class="card pad">
  <h2 class="card-title">Fotoğraflar</h2>
  <div class="photos">
    @foreach ($photos as $url)<a href="{{ $url }}" target="_blank" rel="noopener"><img src="{{ $url }}" alt="Fotoğraf"></a>@endforeach
  </div>
</div>
@endif
@endsection
