@extends('musteri.layout')
@section('title', 'Raporlar')
@php
  use App\Support\MusteriPanel as MP;
  $maxService = collect($serviceBreakdown)->max('count') ?: 1;
  $maxWeekday = collect($weekdayLoad)->max('count') ?: 1;
  $maxSource = collect($sourceBreakdown)->max('count') ?: 1;
@endphp

@section('content')
<form method="get" class="card pad">
  <div class="toolbar" style="margin-bottom:0;align-items:end">
    <label class="field"><span>Ay</span><input type="month" name="month" value="{{ $month }}"></label>
    <button class="btn btn-primary btn-sm" type="submit">Göster</button>
  </div>
</form>

<div class="stat-grid">
  <div class="card stat"><div class="stat-label">Ciro (ödenen)</div><div class="stat-value">{{ MP::money($summary['income']) }}</div></div>
  <div class="card stat"><div class="stat-label">Bekleyen tahsilat</div><div class="stat-value">{{ MP::money($summary['pending']) }}</div></div>
  <div class="card stat"><div class="stat-label">Randevu</div><div class="stat-value">{{ $kpis['appointments'] }}</div></div>
</div>
<div class="stat-grid">
  <div class="card stat"><div class="stat-label">Ortalama fiş</div><div class="stat-value">{{ $kpis['average_ticket'] === null ? '—' : MP::money($kpis['average_ticket']) }}</div></div>
  <div class="card stat"><div class="stat-label">Yeni müşteri</div><div class="stat-value">{{ $kpis['new_customers'] }}</div></div>
  <div class="card stat"><div class="stat-label">Tekrar oranı</div><div class="stat-value">%{{ $kpis['repeat_rate'] }}</div></div>
</div>

<div class="col-2">
  <div class="card pad">
    <h2 class="card-title">Hizmet dağılımı</h2>
    @forelse ($serviceBreakdown as $row)
      <div class="bar-row">
        <div class="bar-label">{{ $row['service'] }}</div>
        <div class="bar-track"><div class="bar-fill" style="width:{{ round($row['count'] / $maxService * 100) }}%"></div></div>
        <div class="bar-value">{{ $row['count'] }} · {{ MP::money($row['revenue']) }}</div>
      </div>
    @empty
      <p class="muted">Bu ay işlem yok.</p>
    @endforelse
  </div>
  <div class="card pad">
    <h2 class="card-title">Kaynağa göre randevu</h2>
    @forelse ($sourceBreakdown as $row)
      <div class="bar-row">
        <div class="bar-label">{{ $row['label'] }}</div>
        <div class="bar-track"><div class="bar-fill alt" style="width:{{ round($row['count'] / $maxSource * 100) }}%"></div></div>
        <div class="bar-value">{{ $row['count'] }}</div>
      </div>
    @empty
      <p class="muted">Bu ay işlem yok.</p>
    @endforelse
  </div>
</div>

<div class="col-2">
  <div class="card pad">
    <h2 class="card-title">En çok gelen müşteriler</h2>
    @if (count($topCustomers))
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Müşteri</th><th class="num">Randevu</th><th class="num">Ödenen</th></tr></thead>
      <tbody>
        @foreach ($topCustomers as $row)
          <tr><td>{{ $row['customer'] }}</td><td class="num">{{ $row['appointments'] }}</td><td class="num">{{ MP::money($row['paid_total']) }}</td></tr>
        @endforeach
      </tbody>
    </table></div>
    @else<p class="muted">Veri yok.</p>@endif
  </div>
  <div class="card pad">
    <h2 class="card-title">Gün yoğunluğu</h2>
    @foreach ($weekdayLoad as $row)
      <div class="bar-row">
        <div class="bar-label">{{ $row['name'] }}</div>
        <div class="bar-track"><div class="bar-fill" style="width:{{ round($row['count'] / $maxWeekday * 100) }}%"></div></div>
        <div class="bar-value">{{ $row['count'] }}</div>
      </div>
    @endforeach
  </div>
</div>
@endsection
