<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Claude Code CLI
    |--------------------------------------------------------------------------
    |
    | İçerik üretimi Anthropic HTTP API'sini DEĞİL, abonelik/OAuth ile giriş
    | yapılmış `claude` CLI'sini kullanır. Sunucuda `claude auth login` veya
    | `claude setup-token` ile oturum açılmış olmalıdır. ANTHROPIC_API_KEY bu
    | akışta kullanılmaz.
    |
    */

    'claude' => [
        'binary' => env('CLAUDE_BINARY', 'claude'),
        'model' => env('CLAUDE_MODEL', 'sonnet'),
        // Uzun blog üretimi için geniş zaman aşımı (saniye).
        'timeout' => (int) env('CLAUDE_TIMEOUT', 600),
        // Plesk abonelik kullanıcısının HOME'u farklı olabilir; CLI oturumu
        // (~/.claude) orada durur. null → süreç HOME'unu miras alır.
        'home' => env('CLAUDE_HOME'),
        // CLI'nin çalışacağı dizin; proje ağacına bulaşmasın diye geçici dizin.
        'cwd' => env('CLAUDE_CWD', sys_get_temp_dir()),
        // `claude setup-token` ile üretilen uzun ömürlü (1 yıl) abonelik OAuth
        // token'ı. Sunucuda interaktif oturum tutulamadığı için üretim bunu
        // kullanır; API anahtarı DEĞİLDİR. null → CLI kendi ~/.claude
        // oturumunu kullanır (yerel geliştirme).
        'oauth_token' => env('CLAUDE_CODE_OAUTH_TOKEN'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Blog yazısı üretim/doğrulama kuralları
    |--------------------------------------------------------------------------
    */

    'post' => [
        'min_words' => 700,
        'max_words' => 1800,
        // Yazı başına en az bu kadar ayrı iç link (self-link sayılmaz).
        'min_service_links' => 2,
        'min_post_links' => 2,
        // Gövdede izin verilen HTML etiketleri; dışındaki her etiket ihlaldir.
        'allowed_tags' => [
            'p', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'a',
            'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
        ],
        // Yazıların linkleyebileceği gerçek statik sayfalar (frontend/app/**).
        // Sadece diskte page.tsx'i olan yollar; uydurma/olmayan yol yok.
        'static_links' => [
            '/',                                    // frontend/app/page.tsx
            '/blog',                                // frontend/app/blog/page.tsx
            '/hizmetler',                           // frontend/app/hizmetler/page.tsx
            '/iletisim',                            // frontend/app/iletisim/page.tsx
            '/hakkimizda',                          // frontend/app/hakkimizda/page.tsx
            '/sss',                                 // frontend/app/sss/page.tsx
            '/galeri',                              // frontend/app/galeri/page.tsx
            '/linkler',                             // frontend/app/linkler/page.tsx
            '/ankara-kalici-makyaj-yapan-yerler',   // frontend/app/ankara-kalici-makyaj-yapan-yerler/page.tsx
            '/gizlilik-politikasi',                 // frontend/app/gizlilik-politikasi/page.tsx
            '/kvkk',                                // frontend/app/kvkk/page.tsx
            '/cerez-politikasi',                    // frontend/app/cerez-politikasi/page.tsx
        ],
        'meta_title_max' => 65,
        'meta_desc_min' => 120,
        'meta_desc_max' => 170,
        'excerpt_max' => 200,
        'min_h2' => 4,
    ],

    /*
    |--------------------------------------------------------------------------
    | Marka yasaklı ifadeler
    |--------------------------------------------------------------------------
    |
    | Üretilen metinde geçmesi yasak, küçük harfe indirgenmiş aramalar. Sağlayıcı
    | iddiaları (burası güzellik stüdyosu, klinik değil), iyileştirme/garanti
    | iddiaları ve fiyat yayını marka kurallarınca yasaktır.
    |
    | NOT: Çıplak "medikal" kelimesi YASAK DEĞİL — kamuflaj metinlerindeki
    | koruyucu ibare ("kamuflaj uygulamasıdır, medikal işlem değil") o kelimeye
    | ihtiyaç duyar; topluca yasaklamak en güvenli cümleyi silerdi.
    |
    */

    'forbidden' => [
        // Sağlayıcı/klinik iddiaları — burası güzellik stüdyosu, klinik değil.
        'dermatolog',
        'klinik',
        'doktor',
        'hekim',
        'hastane',
        'medikal pigment',
        'medikal uygulama',
        // İyileştirme/tedavi iddiaları.
        'tedavi eder',
        'tedavi edilir',
        'iyileştirir',
        // Garanti/kesinlik iddiaları.
        'garanti',
        '%100',
        'kesin sonuç',
        // Fiyat yayını (sitede fiyat yayınlanmıyor).
        '₺',
        ' tl',            // "1000 tl" gibi; baştaki boşluk "html"/"det.tl" gibi kelimeleri elemek için
        'fiyat listesi',
    ],

];
