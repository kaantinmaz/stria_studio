<?php

namespace App\Http\Controllers;

use App\Support\AnthropicChat;
use App\Support\ChatPrompt;
use App\Support\ChatTranscript;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator as ValidationValidator;

class ChatController extends Controller
{
    private const ENGAGE_SUFFIX = 'Bağlam: Bu konuşma sitedeki mini etkileşim panelinden geliyor. Kullanıcının ilk mesajı, ilgilendiği hizmetleri ve varsa endişesini özetler. Görevin: (1) Endişeyi empatiyle karşıla ve doğru bilgiyle OLUMLUYA çevir (korkutma, küçümseme yok; 2-4 cümle). (2) Cevabının sonunda kullanıcıyı tanımaya yönelik TEK kısa takip sorusu sor (örn. daha önce kalıcı makyaj deneyimi, istediği görünüm, ne zamandır düşündüğü). (3) Kullanıcı rahatladığında veya randevuya sıcak baktığında WhatsApp linkini paylaşarak nazikçe randevuya davet et. Fiyat yasağı ve diğer tüm kurallar aynen geçerli.';

    public function store(Request $request, ChatPrompt $prompt, AnthropicChat $anthropic, ChatTranscript $transcript): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'site' => ['nullable', 'string'],
            'session_id' => ['nullable', 'string', 'min:8', 'max:64', 'regex:/^[A-Za-z0-9-]+$/'],
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

        $reply = $anthropic->reply(
            $prompt->build($site) . ($isEngage ? "\n\n" . $engageSuffix : ''),
            $validated['messages'],
        );

        if ($reply === null) {
            return $this->unavailable();
        }

        $transcript->record(
            $validated['session_id'] ?? null,
            $isEngage ? 'engage' : 'web',
            $site,
            $validated['messages'],
            $reply,
        );

        return response()->json([
            'data' => ['reply' => $reply],
        ]);
    }

    private function unavailable(): JsonResponse
    {
        return response()->json(['message' => 'assistant_unavailable'], 502);
    }
}
