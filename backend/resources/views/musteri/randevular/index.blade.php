@extends('musteri.layout')
@section('title', 'Randevular')
@php use App\Support\MusteriPanel as MP; @endphp

@section('content')
<div class="page-head">
  <div></div>
  <div class="head-actions">
    <a class="btn btn-outline btn-sm" href="{{ route('musteri.appointments.export', request()->query()) }}">CSV indir</a>
    <a class="btn btn-primary btn-sm" href="{{ route('musteri.appointments.create') }}">Yeni randevu</a>
  </div>
</div>

<form method="get" class="card pad">
  <div class="toolbar" style="margin-bottom:0">
    <label class="field"><span>Başlangıç</span><input type="date" name="from" value="{{ $filters['from'] }}"></label>
    <label class="field"><span>Bitiş</span><input type="date" name="to" value="{{ $filters['to'] }}"></label>
    <label class="field"><span>Durum</span>
      <select name="status">
        <option value="">Tümü</option>
        @foreach (MP::STATUS_LABELS as $k => $v)
          <option value="{{ $k }}" @selected($filters['status'] === $k)>{{ $v }}</option>
        @endforeach
      </select>
    </label>
    <label class="field"><span>Hizmet</span>
      <select name="service_id">
        <option value="">Tümü</option>
        @foreach ($services as $s)
          <option value="{{ $s->id }}" @selected((string) $filters['service_id'] === (string) $s->id)>{{ $s->name_tr }}</option>
        @endforeach
      </select>
    </label>
    <label class="field"><span>Kaynak</span>
      <select name="source">
        <option value="">Tümü</option>
        <option value="mobil" @selected($filters['source'] === 'mobil')>Mobil uygulama</option>
        <option value="panel" @selected($filters['source'] === 'panel')>Panel / iOS</option>
      </select>
    </label>
    <label class="field"><span>Ara (ad / telefon)</span><input type="search" name="q" value="{{ $filters['q'] }}"></label>
    <button class="btn btn-primary btn-sm" type="submit">Filtrele</button>
  </div>
</form>

<div class="card pad">
  @if ($appointments->isEmpty())
    <p class="empty">Randevu bulunamadı.</p>
  @else
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Tarih / Saat</th><th>Müşteri</th><th>Hizmet</th><th>Seans</th><th>Durum</th><th>Kaynak</th><th class="num">Tutar</th></tr></thead>
        <tbody>
          @foreach ($appointments as $a)
          <tr data-href="{{ route('musteri.appointments.show', $a->id) }}">
            <td>{{ $a->starts_at->format('d.m.Y H:i') }}</td>
            <td>{{ $a->customer?->name ?? 'Silinmiş müşteri' }}@if ($a->app_user_id)<span class="badge-mobil">Mobil</span>@endif</td>
            <td>{{ $a->service?->name_tr ?? '—' }}</td>
            <td>@if ($a->isSessionPackage())<span class="chip">{{ $a->session_no }}/{{ $a->session_total }}</span>@else—@endif</td>
            <td><span class="chip {{ MP::statusClass($a->status) }}">{{ MP::statusLabel($a->status) }}</span></td>
            <td class="small muted">{{ MP::sourceLabel($a) }}</td>
            <td class="num">@if ($a->price !== null){{ MP::money($a->price) }}@else—@endif</td>
          </tr>
          @endforeach
        </tbody>
      </table>
    </div>
    <div class="pager">{{ $appointments->links('musteri.partials.pager') }}</div>
  @endif
</div>
@endsection
