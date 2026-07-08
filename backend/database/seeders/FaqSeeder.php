<?php

namespace Database\Seeders;

use App\Models\Faq;
use Illuminate\Database\Seeder;

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $items = [
            ['q_tr' => 'Stria Studio nerede?', 'a_tr' => 'Ankara Çankaya\'dayız. Randevular WhatsApp veya telefon ile alınır.'],
            ['q_tr' => 'Kalıcı makyaj ne kadar kalıcıdır?', 'a_tr' => 'İşleme ve cilt tipine göre değişir: microblading 12–18 ay, kalıcı eyeliner ve dudak renklendirme 1–3 yıl kalıcıdır.'],
            ['q_tr' => 'İşlemler acıtır mı?', 'a_tr' => 'Uygulama öncesi anestezik krem kullanılır; çoğu kişi yalnızca hafif bir his duyar.'],
            ['q_tr' => 'Randevu ve fiyat bilgisini nasıl alırım?', 'a_tr' => 'WhatsApp\'tan yazabilir ya da arayabilirsiniz. Fiyat, hizmete ve kişiye göre ön görüşmede netleşir.'],
        ];
        Faq::query()->delete();
        foreach ($items as $i => $it) {
            Faq::create($it + ['sort_order' => $i, 'is_active' => true, 'q_en' => null, 'a_en' => null]);
        }
    }
}
