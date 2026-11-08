@extends('musteri.layout')
@section('title', 'Özet')

@php use App\Support\MusteriPanel as MP; @endphp

@section('content')
<div class="stat-grid">
  <div class="card stat">
    <div class="stat-label">Bu ay ciro</div>
    <div class="stat-value">{{ MP::money($monthIncome) }}</div>
    <div class="stat-foot muted">ödenen (paket bir kez)</div>
  </div>
  <div class="card stat">
    <div class="stat-label">Bu ay randevu</div>
    <div class="stat-value">{{ $monthAppointments }}</div>
    <div class="stat-foot muted">seanslar dahil</div>
  </div>
  <div class="card stat">
    <div class="stat-label">Yeni müşteri</div>
    <div class="stat-value">{{ $monthNewCustomers }}</div>
    <div class="stat-foot muted">bu ay</div>
  </div>
</div>

@if ($pending->isNotEmpty())
<div class="card pad">
  <h2 class="card-title">Onay bekleyen mobil talepler <span class="count">{{ $pending->count() }}</span></h2>
  <div class="table-wrap">
    <table class="table">
      <thead><tr><th>Tarih / Saat</th><th>Müşteri</th><th>Hizmet</th><th></th></tr></thead>
      <tbody>
        @foreach ($pending as $a)
        <tr>
          <td>{{ $a->starts_at->format('d.m.Y H:i') }}</td>
          <td>
            <a class="link" href="{{ route('musteri.appointments.show', $a->id) }}">{{ $a->customer?->name ?? 'Silinmiş müşteri' }}</a>
            <span class="badge-mobil">Mobil uygulama</span>
          </td>
          <td>{{ $a->service?->name_tr ?? '—' }}</td>
          <td class="row-actions">
            <form method="post" action="{{ route('musteri.appointments.confirm', $a->id) }}">@csrf<button class="btn btn-sm btn-primary">Onayla</button></form>
            <form method="post" action="{{ route('musteri.appointments.cancel', $a->id) }}">@csrf<button class="btn btn-sm btn-danger">İptal</button></form>
          </td>
        </tr>
        @endforeach
      </tbody>
    </table>
  </div>
</div>
@endif

<div class="card pad">
  <h2 class="card-title">Bugün ({{ $today->format('d.m.Y') }})</h2>
  @if ($todays->isEmpty())
    <p class="muted">Bugün için randevu yok.</p>
  @else
    @include('musteri.partials.agenda-table', ['list' => $todays])
  @endif
</div>

<div class="card pad">
  <h2 class="card-title">Önümüzdeki 7 gün</h2>
  @php $todayKey = $today->format('Y-m-d'); $future = collect($agenda)->reject(fn ($l, $day) => $day === $todayKey); @endphp
  @if ($future->isEmpty())
    <p class="muted">Önümüzdeki 7 günde başka randevu yok.</p>
  @else
    @foreach ($future as $day => $list)
      <h3 class="muted" style="margin:14px 0 8px">{{ \Carbon\Carbon::parse($day)->locale('tr')->translatedFormat('d.m.Y, l') }}</h3>
      @include('musteri.partials.agenda-table', ['list' => $list])
    @endforeach
  @endif
</div>
@endsection
