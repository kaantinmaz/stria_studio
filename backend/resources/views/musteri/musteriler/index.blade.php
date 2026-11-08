@extends('musteri.layout')
@section('title', 'Müşteriler')
@php use App\Support\MusteriPanel as MP; @endphp

@section('content')
<div class="page-head">
  <div></div>
  <div class="head-actions">
    <a class="btn btn-primary btn-sm" href="{{ route('musteri.customers.create') }}">Yeni müşteri</a>
  </div>
</div>

<form method="get" class="card pad">
  <div class="toolbar" style="margin-bottom:0">
    <label class="field"><span>Ara (ad / telefon / e-posta)</span><input type="search" name="q" value="{{ $filters['q'] }}"></label>
    <button class="btn btn-primary btn-sm" type="submit">Ara</button>
  </div>
</form>

<div class="card pad">
  @if ($customers->isEmpty())
    <p class="empty">Müşteri bulunamadı.</p>
  @else
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Müşteri</th><th>Telefon</th><th>Son randevu</th><th>Sonraki</th><th class="num">Toplam ödenen</th></tr></thead>
        <tbody>
          @foreach ($customers as $c)
          <tr data-href="{{ route('musteri.customers.show', $c->id) }}">
            <td><div class="cust-cell"><span class="avatar">{{ MP::initials($c->name) }}</span>{{ $c->name }}</div></td>
            <td>{{ $c->phone ?? '—' }}</td>
            <td>{{ $lastAt->get($c->id) ? \Carbon\Carbon::parse($lastAt->get($c->id))->format('d.m.Y') : '—' }}</td>
            <td>{{ $nextAt->get($c->id) ? \Carbon\Carbon::parse($nextAt->get($c->id))->format('d.m.Y') : '—' }}</td>
            <td class="num">{{ MP::money($paidTotals->get($c->id, 0)) }}</td>
          </tr>
          @endforeach
        </tbody>
      </table>
    </div>
    <div class="pager">{{ $customers->links('musteri.partials.pager') }}</div>
  @endif
</div>
@endsection
