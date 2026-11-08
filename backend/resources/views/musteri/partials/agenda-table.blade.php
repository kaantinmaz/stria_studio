@php use App\Support\MusteriPanel as MP; @endphp
<div class="table-wrap">
  <table class="table">
    <thead><tr><th>Saat</th><th>Müşteri</th><th>Hizmet</th><th>Seans</th><th>Durum</th><th>Ödeme</th></tr></thead>
    <tbody>
      @foreach ($list as $a)
      <tr data-href="{{ route('musteri.appointments.show', $a->id) }}">
        <td class="num">{{ $a->starts_at->format('H:i') }}</td>
        <td>
          {{ $a->customer?->name ?? 'Silinmiş müşteri' }}
          @if ($a->app_user_id)<span class="badge-mobil">Mobil</span>@endif
        </td>
        <td>{{ $a->service?->name_tr ?? '—' }}</td>
        <td>@if ($a->isSessionPackage())<span class="chip">{{ $a->session_no }}/{{ $a->session_total }}</span>@else—@endif</td>
        <td><span class="chip {{ MP::statusClass($a->status) }}">{{ MP::statusLabel($a->status) }}</span></td>
        <td>@if ($a->is_paid)<span class="chip chip-ok">Ödendi</span>@elseif ($a->price !== null)<span class="chip chip-warn">Bekliyor</span>@else—@endif</td>
      </tr>
      @endforeach
    </tbody>
  </table>
</div>
