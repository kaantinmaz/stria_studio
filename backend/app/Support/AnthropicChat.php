<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Throwable;

class AnthropicChat
{
    /**
     * Send a chat completion request to the Anthropic Messages API.
     *
     * @param  array<int, array{role: string, content: string}>  $messages
     * @return string|null  Plain-text reply, or null when the upstream call fails.
     */
    public function reply(string $system, array $messages): ?string
    {
        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-api-key' => (string) config('services.anthropic.key'),
                    'anthropic-version' => '2023-06-01',
                ])
                ->post('https://api.anthropic.com/v1/messages', [
                    'model' => config('services.anthropic.model'),
                    'max_tokens' => 400,
                    'system' => $system,
                    'messages' => $messages,
                ]);
        } catch (Throwable) {
            return null;
        }

        if (! $response->successful()) {
            return null;
        }

        $content = $response->json('content');
        $reply = is_array($content)
            ? collect($content)
                ->filter(fn ($block): bool => is_array($block) && ($block['type'] ?? null) === 'text')
                ->pluck('text')
                ->filter(fn ($text): bool => is_string($text))
                ->implode("\n")
            : '';

        if (blank($reply)) {
            return null;
        }

        return $this->stripMarkdown(trim($reply));
    }

    // The prompt forbids markdown, but the model occasionally slips bold/headings
    // into long answers; the widgets render plain text, so strip deterministically.
    private function stripMarkdown(string $text): string
    {
        $text = preg_replace('/\*\*(.+?)\*\*/s', '$1', $text);
        $text = preg_replace('/(?<!\w)\*(?!\s)(.+?)(?<!\s)\*(?!\w)/s', '$1', $text);
        $text = preg_replace('/^#{1,6}\s+/m', '', $text);

        return $text;
    }
}
