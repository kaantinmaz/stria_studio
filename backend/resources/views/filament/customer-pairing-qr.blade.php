{{-- Tüm stiller inline ve tema bağımsız. İki sebep var:
     1) Bu partial hem Filament modalında hem de Takvim sayfasının kendi
        CSS'inde kullanılıyor; Filament'in hazır derlenmiş stylesheet'i
        w-64 / bg-[#fdf6f5] gibi utility'leri içermiyor.
     2) Tailwind renk sınıfları burada beyaza çözülüyordu (beyaz zeminde
        görünmez metin). Blok kendi açık zeminini taşıdığı için koyu tema
        açıldığında da okunur kalıyor. --}}
<div style="display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 18px; border-radius: 16px; background: #ffffff; color: #1d1d1f; text-align: center;">
    <h3 style="margin: 0; font-size: 16px; font-weight: 600; color: #1d1d1f;">
        {{ $customerName }}
    </h3>

    <div style="padding: 14px; border: 1px solid rgba(0, 0, 0, .08); border-radius: 16px; background: #fdf6f5;">
        <div style="width: 232px; max-width: 100%;">
            {!! $svg !!}
        </div>
    </div>

    <p style="max-width: 24rem; margin: 0; font-size: 13px; line-height: 1.5; color: #6e6e73;">
        Müşteri uygulamada <strong style="font-weight: 600; color: #1d1d1f;">Kayıt Ol → QR ile kayıt ol</strong> adımına gelip bu kodu okutsun. Okuttuğu anda hesabı açılır ve randevuları hesabına bağlanır.
    </p>

    @if ($appointmentCount > 0)
        <p style="max-width: 24rem; margin: 0; font-size: 13px; line-height: 1.5; color: #6e6e73;">
            Bu müşteriye tanımlı {{ $appointmentCount }} randevu otomatik olarak hesabında görünecek.
        </p>
    @endif

    <p style="margin: 0; font-size: 12px; font-weight: 500; color: #92400e;">
        Kod {{ $ttlMinutes }} dakika geçerli.
    </p>
</div>
