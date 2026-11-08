@extends('musteri.layout')
@section('title', $appointment ? 'Randevu düzenle' : 'Yeni randevu')
@php
  use App\Support\MusteriPanel as MP;
  use App\Support\BodyRegions;
  $isEdit = $appointment !== null;
  $isChild = $isEdit && $appointment->isSessionChild();
  $curSubservices = old('subservices', $appointment?->subservices ?? []);
  $curRegions = old('body_regions', $appointment?->body_regions ?? []);
  $curService = (string) old('service_id', $appointment?->service_id);
@endphp

@section('content')
<a class="back-link" href="{{ $isEdit ? route('musteri.appointments.show', $appointment->id) : route('musteri.appointments.index') }}">← Geri</a>

@if ($errors->any())
  <div class="flash flash--error">{{ $errors->first() }}</div>
@endif

<form method="post" action="{{ $isEdit ? route('musteri.appointments.update', $appointment->id) : route('musteri.appointments.store') }}" class="card pad">
  @csrf
  @if ($isEdit)@method('PUT')@endif

  <div class="form">
    @unless ($isChild)
    <div class="field full">
      <span>Mevcut müşteri</span>
      <select name="customer_id" id="customer_id">
        <option value="">— Yeni müşteri oluştur —</option>
        @foreach ($customers as $c)
          <option value="{{ $c->id }}" @selected((string) old('customer_id', $presetCustomerId) === (string) $c->id)>{{ $c->name }}@if ($c->phone) ({{ $c->phone }})@endif</option>
        @endforeach
      </select>
    </div>
    <div class="form-grid" id="new-customer">
      <label class="field"><span>Yeni müşteri adı</span><input type="text" name="new_customer_name" value="{{ old('new_customer_name') }}"></label>
      <label class="field"><span>Telefon</span><input type="tel" name="new_customer_phone" value="{{ old('new_customer_phone') }}"></label>
    </div>
    @else
      <p class="muted small">Bu bir paket seansıdır. Müşteri, hizmet, alt uygulama, bölge ve fiyat yalnızca 1. seansta düzenlenir.</p>
    @endunless

    <div class="form-grid">
      @unless ($isChild)
      <label class="field"><span>Hizmet</span>
        <select name="service_id" id="service_id">
          <option value="">Hizmet seçilmedi</option>
          @foreach ($services as $s)
            <option value="{{ $s->id }}" @selected($curService === (string) $s->id)>{{ $s->name_tr }}</option>
          @endforeach
        </select>
      </label>
      @endunless
      <label class="field"><span>Başlangıç</span><input type="datetime-local" name="starts_at" value="{{ old('starts_at', $appointment?->starts_at?->format('Y-m-d\TH:i')) }}" required></label>
      <label class="field"><span>Süre (dk)</span><input type="number" name="duration_min" id="duration_min" min="5" max="1440" value="{{ old('duration_min', $appointment?->duration_min ?? 60) }}" required></label>
      <label class="field"><span>Durum</span>
        <select name="status">
          @foreach (MP::STATUS_LABELS as $k => $v)
            <option value="{{ $k }}" @selected(old('status', $appointment?->status ?? 'confirmed') === $k)>{{ $v }}</option>
          @endforeach
        </select>
      </label>
    </div>

    @unless ($isChild)
    <div class="field full">
      <span>Alt uygulamalar</span>
      <div class="checks" id="subservices-box">
        @php $svc = $services->firstWhere('id', (int) $curService); @endphp
        @if ($svc && filled($svc->subserviceNames()))
          @foreach ($svc->subserviceNames() as $name)
            <label><input type="checkbox" name="subservices[]" value="{{ $name }}" @checked(in_array($name, (array) $curSubservices, true))>{{ $name }}</label>
          @endforeach
        @else
          <p class="muted small">Önce hizmet seçin.</p>
        @endif
      </div>
    </div>

    <div class="field full">
      <span>Bölgeler (kamuflaj)</span>
      <div class="checks" style="max-height:180px;overflow:auto">
        @foreach (BodyRegions::LABELS as $key => $label)
          <label><input type="checkbox" name="body_regions[]" value="{{ $key }}" @checked(in_array($key, (array) $curRegions, true))>{{ $label }}</label>
        @endforeach
      </div>
    </div>

    <div class="form-grid">
      <label class="field"><span>Tutar (₺)</span><input type="number" step="0.01" min="0" name="price" value="{{ old('price', $appointment?->price) }}"></label>
      <label class="field"><span>Ödeme yöntemi</span>
        <select name="payment_method">
          <option value="">—</option>
          @foreach (MP::PAYMENT_LABELS as $k => $v)
            <option value="{{ $k }}" @selected(old('payment_method', $appointment?->payment_method) === $k)>{{ $v }}</option>
          @endforeach
        </select>
      </label>
      <label class="check"><input type="checkbox" name="is_paid" value="1" @checked(old('is_paid', $appointment?->is_paid))> Ödendi</label>
    </div>
    @endunless

    @unless ($isEdit)
    <div class="form-grid">
      <label class="field"><span>Seans sayısı (paket)</span><input type="number" name="session_total" min="1" max="12" value="{{ old('session_total', 1) }}"></label>
      <label class="field"><span>Seans aralığı (gün)</span><input type="number" name="interval_days" min="1" max="365" value="{{ old('interval_days', 28) }}"></label>
    </div>
    @endunless

    <label class="field full"><span>Not</span><textarea name="note" rows="3">{{ old('note', $appointment?->note) }}</textarea></label>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">{{ $isEdit ? 'Kaydet' : 'Oluştur' }}</button>
      <a class="btn btn-ghost" href="{{ $isEdit ? route('musteri.appointments.show', $appointment->id) : route('musteri.appointments.index') }}">Vazgeç</a>
    </div>
  </div>
</form>

@push('scripts')
<script>
window.__serviceMeta = {
  @foreach ($services as $s)
  "{{ $s->id }}": {duration_min: {{ (int) $s->duration_min }}, subservices: @json($s->subserviceNames())},
  @endforeach
};
</script>
@endpush
@endsection
