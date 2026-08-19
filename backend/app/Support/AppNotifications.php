<?php

namespace App\Support;

use App\Models\Announcement;
use App\Models\AppUser;
use App\Models\Campaign;
use Illuminate\Support\Str;

/**
 * Uygulamanın bildirim akışı: yürürlükteki duyurular + kampanyalar tek listede,
 * yeniden eskiye. Ayrı bir bildirim tablosu yok — panelde duyuru/kampanya
 * yayınlamak bildirim göndermekle aynı şey.
 */
class AppNotifications
{
    private const LIMIT = 50;

    /**
     * @return array<int, array<string, mixed>>
     */
    public function forUser(AppUser $user): array
    {
        $seenAt = $user->notifications_seen_at;
        $today = now()->toDateString();

        return $this->announcements($today)
            ->merge($this->campaigns($today))
            ->sortByDesc('created_at')
            ->take(self::LIMIT)
            ->map(function (array $item) use ($seenAt): array {
                $item['is_new'] = $seenAt === null
                    || ($item['created_at'] !== null && $item['created_at'] > $seenAt->toIso8601String());

                return $item;
            })
            ->values()
            ->all();
    }

    public function unreadCount(AppUser $user): int
    {
        return collect($this->forUser($user))->where('is_new', true)->count();
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function announcements(string $today)
    {
        return Announcement::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today))
            ->orderByDesc('id')
            ->get()
            ->map(fn (Announcement $announcement): array => [
                'id' => 'announcement-'.$announcement->id,
                'kind' => 'announcement',
                'title' => $announcement->title,
                'body' => $announcement->body,
                'image' => null,
                'created_at' => $announcement->created_at?->toIso8601String(),
            ])
            // Eloquent koleksiyonunda merge() model bekliyor; diziler için taban koleksiyon şart.
            ->toBase();
    }

    /**
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function campaigns(string $today)
    {
        return Campaign::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('starts_at')->orWhereDate('starts_at', '<=', $today))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhereDate('ends_at', '>=', $today))
            ->orderByDesc('id')
            ->get()
            ->map(fn (Campaign $campaign): array => [
                'id' => 'campaign-'.$campaign->id,
                'kind' => 'campaign',
                'title' => $campaign->title,
                'body' => $campaign->description,
                'image' => $this->imageUrl($campaign->image),
                'created_at' => $campaign->created_at?->toIso8601String(),
            ])
            ->toBase();
    }

    private function imageUrl(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        return Str::startsWith($path, ['http://', 'https://', '/'])
            ? $path
            : asset('storage/'.$path);
    }
}
