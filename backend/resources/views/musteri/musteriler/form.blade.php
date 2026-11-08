@extends('musteri.layout')
@section('title', $customer ? 'Müşteri düzenle' : 'Yeni müşteri')
@php use App\Models\Customer; $isEdit = $customer !== null; @endphp

@section('content')
<a class="back-link" href="{{ $isEdit ? route('musteri.customers.show', $customer->id) : route('musteri.customers.index') }}">← Geri</a>

@if ($errors->any())
  <div class="flash flash--error">{{ $errors->first() }}</div>
@endif

@if ($duplicate ?? null)
  <div class="flash flash--warn">Dikkat: bu telefon numarası <a class="link" href="{{ route('musteri.customers.show', $duplicate->id) }}">{{ $duplicate->name }}</a> müşterisinde de kayıtlı.</div>
@endif

<form method="post" action="{{ $isEdit ? route('musteri.customers.update', $customer->id) : route('musteri.customers.store') }}" class="card pad">
  @csrf
  @if ($isEdit)@method('PUT')@endif

  <div class="form">
    <div class="form-grid">
      <label class="field"><span>Ad Soyad *</span><input type="text" name="name" value="{{ old('name', $customer?->name) }}" required></label>
      <label class="field"><span>Telefon</span><input type="tel" name="phone" value="{{ old('phone', $customer?->phone) }}"></label>
      <label class="field"><span>E-posta</span><input type="email" name="email" value="{{ old('email', $customer?->email) }}"></label>
      <label class="field"><span>Instagram</span><input type="text" name="instagram" value="{{ old('instagram', $customer?->instagram) }}"></label>
      <label class="field"><span>Bizi nereden buldu?</span>
        <select name="heard_from">
          <option value="">—</option>
          @foreach (Customer::HEARD_FROM as $k => $v)
            <option value="{{ $k }}" @selected(old('heard_from', $customer?->heard_from) === $k)>{{ $v }}</option>
          @endforeach
        </select>
      </label>
    </div>
    <label class="field full"><span>Not</span><textarea name="notes" rows="3">{{ old('notes', $customer?->notes) }}</textarea></label>

    <div class="form-actions">
      <button type="submit" class="btn btn-primary">{{ $isEdit ? 'Kaydet' : 'Oluştur' }}</button>
      <a class="btn btn-ghost" href="{{ $isEdit ? route('musteri.customers.show', $customer->id) : route('musteri.customers.index') }}">Vazgeç</a>
    </div>
  </div>
</form>
@endsection
