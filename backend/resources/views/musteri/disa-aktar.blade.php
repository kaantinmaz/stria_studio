@extends('musteri.layout')
@section('title', 'Dışa Aktar')

@section('content')
<div class="card pad">
  <h2 class="card-title">KVKK / yedek dışa aktarımı</h2>
  <p class="muted">CSV dosyaları UTF-8 (BOM) ve noktalı virgül (;) ayracıyla hazırlanır; Excel (TR) doğrudan açar.</p>
  <div class="form-actions" style="margin-top:16px">
    <a class="btn btn-primary" href="{{ route('musteri.export.customers') }}">Müşteriler ({{ $customerCount }})</a>
    <a class="btn btn-primary" href="{{ route('musteri.export.appointments') }}">Randevular ({{ $appointmentCount }})</a>
  </div>
</div>
@endsection
