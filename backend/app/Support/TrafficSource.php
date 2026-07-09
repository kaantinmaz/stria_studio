<?php

namespace App\Support;

use Illuminate\Support\Str;

class TrafficSource
{
    private const AI = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'bard.google.com', 'claude.ai', 'copilot.microsoft.com', 'you.com', 'poe.com'];
    private const AI_UTM = ['chatgpt', 'openai', 'perplexity', 'gemini', 'claude', 'copilot'];
    private const SEARCH = ['google.', 'bing.', 'yandex.', 'duckduckgo.', 'search.brave.', 'ecosia.'];
    private const SOCIAL = ['instagram.', 'facebook.', 'fb.', 't.co', 'x.com', 'twitter.', 'tiktok.', 'youtube.', 'youtu.be', 'linkedin.', 'pinterest.'];

    public static function classify(?string $referrer, ?string $utmSource): string
    {
        $utm = Str::lower((string) $utmSource);
        foreach (self::AI_UTM as $k) {
            if ($utm !== '' && str_contains($utm, $k)) {
                return 'ai';
            }
        }

        $host = $referrer ? Str::lower((string) parse_url($referrer, PHP_URL_HOST)) : '';
        if ($host === '') {
            return 'direct';
        }
        foreach (self::AI as $h) {
            if (str_contains($host, $h)) {
                return 'ai';
            }
        }
        foreach (self::SEARCH as $h) {
            if (str_contains($host, $h)) {
                return 'search';
            }
        }
        foreach (self::SOCIAL as $h) {
            if (str_contains($host, $h)) {
                return 'social';
            }
        }
        return 'referral';
    }
}
