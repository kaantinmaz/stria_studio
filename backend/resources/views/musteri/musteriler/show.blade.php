@extends('musteri.layout')
@section('title', 'Müşteri')
@php
  use App\Support\MusteriPanel as MP;
  use App\Models\Customer;
@endphp

@section('content')
<a class="back-link" href="{{ route('musteri.customers.index') }}">← Müşteriler</a>

<div class="page-head">
  <div style="display:flex;align-items:center;gap:14px">
    <span class="avatar avatar--lg">{{ MP::initials($customer->name) }}</span>
    <div>
      <h1>{{ $customer->name }}</h1>
      <div class="greeting">{{ $customer->phone ?? 'Telefon yok' }}</div>
    </div>
  </div>
  <div class="head-actions">
    <a class="btn btn-outline btn-sm" href="{{ route('musteri.appointments.create', ['customer_id' => $customer->id]) }}">Randevu ekle</a>
    <a class="btn btn-outline btn-sm" href="{{ route('musteri.customers.edit', $customer->id) }}">Düzenle</a>
    <form method="post" action="{{ route('musteri.customers.destroy', $customer->id) }}" data-confirm="Müşteri silinsin mi? Randevu kayıtları korunur, yalnızca müşteri bağı kaldırılır.">
      @csrf @method('DELETE')
      <button class="btn btn-sm btn-danger">Sil</button>
    </form>
  </div>
</div>

<div class="col-2">
  <div class="card pad">
    <h2 class="card-title">Bilgiler</h2>
    <dl class="dl">
      <dt>E-posta</dt><dd>{{ $customer->email ?? '—' }}</dd>
      <dt>Instagram</dt><dd>{{ $customer->instagram ?? '—' }}</dd>
      <dt>Kaynak</dt><dd>{{ Customer::HEARD_FROM[$customer->heard_from] ?? '—' }}</dd>
      <dt>Not</dt><dd>{{ $customer->notes ?? '—' }}</dd>
      <dt>Kayıt</dt><dd>{{ $customer->created_at?->format('d.m.Y') ?? '—' }}</dd>
    </dl>
  </div>
  <div class="card pad">
    <h2 class="card-title">Özet</h2>
    <dl class="dl">
      <dt>Randevu sayısı</dt><dd>{{ $appointmentCount }} <span class="muted small">(paket bir kez)</span></dd>
      <dt>Toplam ödenen</dt><dd>{{ MP::money($paidTotal) }}</dd>
    </dl>
  </div>
</div>

<div class="card pad">
  <h2 class="card-title">Randevu geçmişi</h2>
  @if ($appointments->isEmpty())
    <p class="muted">Henüz randevu yok.</p>
  @else
    <div class="table-wrap">
      <table class="table">
        <thead><tr><th>Tarih</th><th>Hizmet</th><th>Seans</th><th>Durum</th><th class="num">Tutar</th></tr></thead>
        <tbody>
          @foreach ($appointments as $a)
          <tr data-href="{{ route('musteri.appointments.show', $a->id) }}">
            <td>{{ $a->starts_at->format('d.m.Y H:i') }}</td>
            <td>{{ $a->service?->name_tr ?? '—' }}</td>
            <td>@if ($a->isSessionPackage())<span class="chip">{{ $a->session_no }}/{{ $a->session_total }}</span>@else—@endif</td>
            <td><span class="chip {{ MP::statusClass($a->status) }}">{{ MP::statusLabel($a->status) }}</span></td>
            <td class="num">@if ($a->parent_id === null && $a->price !== null){{ MP::money($a->price) }}@else—@endif</td>
          </tr>
          @endforeach
        </tbody>
      </table>
    </div>
  @endif
</div>
@endsection
