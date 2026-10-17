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
        'thigh_back_r' => 'Sağ uyluk arka',
        'thigh_back_l' => 'Sol uyluk arka',
        'shin_r' => 'Sağ bacak ön (kaval)',
        'shin_l' => 'Sol bacak ön (kaval)',
        'calf_r' => 'Sağ baldır',
        'calf_l' => 'Sol baldır',
        'foot_r' => 'Sağ ayak',
        'foot_l' => 'Sol ayak',
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
