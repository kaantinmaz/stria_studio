<?php

namespace App\Support;

/**
 * Kamuflaj makyajı için vücut bölgeleri (iOS 3D model ile aynı anahtarlar).
 * "_r"/"_l" müşterinin kendi sağı/solu. Sıra kanoniktir: API çıktısı bu sırayla.
 */
final class BodyRegions
{
    public const LABELS = [
        'forehead' => 'Alın',
        'nose' => 'Burun',
        'cheek_r' => 'Sağ yanak',
        'cheek_l' => 'Sol yanak',
        'lips_chin' => 'Dudak ve çene',
        'scalp' => 'Saçlı deri / baş arkası',
        'neck_front' => 'Boyun ön',
        'neck_back' => 'Ense',
        'shoulder_r' => 'Sağ omuz',
        'shoulder_l' => 'Sol omuz',
        'chest_r' => 'Sağ göğüs',
        'chest_l' => 'Sol göğüs',
        'abdomen_r' => 'Karın sağ',
        'abdomen_l' => 'Karın sol',
        'upper_back_r' => 'Sırt üst sağ',
        'upper_back_l' => 'Sırt üst sol',
        'lower_back_r' => 'Bel sağ',
        'lower_back_l' => 'Bel sol',
        'buttock_r' => 'Sağ kalça',
        'buttock_l' => 'Sol kalça',
        'upper_arm_r' => 'Sağ üst kol',
        'upper_arm_l' => 'Sol üst kol',
        'forearm_r' => 'Sağ ön kol',
        'forearm_l' => 'Sol ön kol',
        'hand_r' => 'Sağ el',
        'hand_l' => 'Sol el',
        'thigh_front_r' => 'Sağ uyluk ön',
        'thigh_front_l' => 'Sol uyluk ön',
        'thigh_inner_r' => 'Sağ uyluk iç',
        'thigh_inner_l' => 'Sol uyluk iç',
        'thigh_back_r' => 'Sağ uyluk arka',
        'thigh_back_l' => 'Sol uyluk arka',
        'shin_r' => 'Sağ bacak ön (kaval)',
        'shin_l' => 'Sol bacak ön (kaval)',
        'leg_inner_r' => 'Sağ bacak iç (alt)',
        'leg_inner_l' => 'Sol bacak iç (alt)',
        'calf_r' => 'Sağ baldır',
        'calf_l' => 'Sol baldır',
        'foot_r' => 'Sağ ayak',
        'foot_l' => 'Sol ayak',
    ];

    /**
     * Seans fiyatı kategorileri (masaüstü Ayarlar). Her bölge tam bir kategoride;
     * sıra kanoniktir: API çıktısı bu sırayla.
     */
    public const CATEGORIES = [
        'face' => ['label' => 'Yüz', 'regions' => ['forehead', 'nose', 'cheek_r', 'cheek_l', 'lips_chin']],
        'scalp' => ['label' => 'Saçlı deri / baş arkası', 'regions' => ['scalp']],
        'neck' => ['label' => 'Boyun', 'regions' => ['neck_front', 'neck_back']],
        'shoulder' => ['label' => 'Omuz', 'regions' => ['shoulder_r', 'shoulder_l']],
        'chest' => ['label' => 'Göğüs', 'regions' => ['chest_r', 'chest_l']],
        'abdomen' => ['label' => 'Karın', 'regions' => ['abdomen_r', 'abdomen_l']],
        'upper_back' => ['label' => 'Sırt', 'regions' => ['upper_back_r', 'upper_back_l']],
        'lower_back' => ['label' => 'Bel', 'regions' => ['lower_back_r', 'lower_back_l']],
        'buttock' => ['label' => 'Kalça', 'regions' => ['buttock_r', 'buttock_l']],
        'upper_arm' => ['label' => 'Üst kol', 'regions' => ['upper_arm_r', 'upper_arm_l']],
        'forearm' => ['label' => 'Ön kol', 'regions' => ['forearm_r', 'forearm_l']],
        'hand' => ['label' => 'El', 'regions' => ['hand_r', 'hand_l']],
        'thigh' => ['label' => 'Uyluk (ön/arka)', 'regions' => ['thigh_front_r', 'thigh_front_l', 'thigh_back_r', 'thigh_back_l']],
        'thigh_inner' => ['label' => 'İç uyluk', 'regions' => ['thigh_inner_r', 'thigh_inner_l']],
        'lower_leg' => ['label' => 'Alt bacak (ön/baldır)', 'regions' => ['shin_r', 'shin_l', 'calf_r', 'calf_l']],
        'leg_inner' => ['label' => 'İç bacak (alt)', 'regions' => ['leg_inner_r', 'leg_inner_l']],
        'foot' => ['label' => 'Ayak', 'regions' => ['foot_r', 'foot_l']],
    ];

    /**
     * Kanonik sırada, tekrarsız anahtarlar; boş liste null.
     *
     * @param  array<int, string>|null  $keys
     * @return array<int, string>|null
     */
    public static function normalize(?array $keys): ?array
    {
        $ordered = array_values(array_intersect(array_keys(self::LABELS), $keys ?? []));

        return $ordered === [] ? null : $ordered;
    }

    /** @param array<int, string>|null $keys */
    public static function labels(?array $keys): string
    {
        return implode(', ', array_map(fn (string $key): string => self::LABELS[$key] ?? $key, $keys ?? []));
    }
}
