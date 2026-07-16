<?php

namespace App\Http\Controllers;

use App\Support\ChatPrompt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator as ValidationValidator;
use Throwable;

class ChatController extends Controller
{
    private const ENGAGE_SUFFIX = 'Bağlam: Bu konuşma sitedeki mini etkileşim panelinden geliyor. Kullanıcının ilk mesajı, ilgilendiği hizmetleri ve varsa endişesini özetler. Görevin: (1) Endişeyi empatiyle karşıla ve doğru bilgiyle OLUMLUYA çevir (korkutma, küçümseme yok; 2-4 cümle). (2) Cevabının sonunda kullanıcıyı tanımaya yönelik TEK kısa takip sorusu sor (örn. daha önce kalıcı makyaj deneyimi, istediği görünüm, ne zamandır düşündüğü). (3) Kullanıcı rahatladığında veya randevuya sıcak baktığında WhatsApp linkini paylaşarak nazikçe randevuya davet et. Fiyat yasağı ve diğer tüm kurallar aynen geçerli.';

    public function store(Request $request, ChatPrompt $prompt): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'site' => ['nullable', 'string'],
            'intent' => ['nullable', Rule::in(['engage'])],
            'messages' => ['required', 'array', 'min:1', 'max:12'],
            'messages.*' => ['array:role,content'],
            'messages.*.role' => ['required', Rule::in(['user', 'assistant'])],
            'messages.*.content' => ['required', 'string', 'min:1', 'max:1000'],
        ]);

        $validator->after(function (ValidationValidator $validator) use ($request): void {
            $messages = $request->input('messages');

            if (! is_array($messages) || $messages === []) {
                return;
            }

            $lastMessage = end($messages);

            if (is_array($lastMessage) && ($lastMessage['role'] ?? null) !== 'user') {
                $validator->errors()->add('messages', 'Son mesajın rolü user olmalıdır.');
            }
        });

        $validated = $validator->validate();
        $site = $validated['site'] ?? null;
        $isEngage = ($validated['intent'] ?? null) === 'engage';
        $engageSuffix = self::ENGAGE_SUFFIX;

        if ($site !== null && ! array_key_exists($site, config('microsites', []))) {
            abort(404);
        }

        try {
            $response = Http::timeout(30)
                ->withHeaders([
                    'x-api-key' => (string) config('services.anthropic.key'),
                    'anthropic-version' => '2023-06-01',
                ])
                ->post('https://api.anthropic.com/v1/messages', [
                    'model' => config('services.anthropic.model'),
                    'max_tokens' => 400,
                    'system' => $prompt->build($site) . ($isEngage ? "\n\n" . $engageSuffix : ''),
                    'messages' => $validated['messages'],
                ]);
        } catch (Throwable) {
            return $this->unavailable();
        }

        if (! $response->successful()) {
            return $this->unavailable();
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
            return $this->unavailable();
        }

        return response()->json([
            'data' => ['reply' => $this->stripMarkdown(trim($reply))],
        ]);
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

    private function unavailable(): JsonResponse
    {
        return response()->json(['message' => 'assistant_unavailable'], 502);
    }
}
