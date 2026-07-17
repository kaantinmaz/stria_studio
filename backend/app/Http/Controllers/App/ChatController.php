<?php

namespace App\Http\Controllers\App;

use App\Http\Controllers\Controller;
use App\Support\AnthropicChat;
use App\Support\AppChatContext;
use App\Support\ChatPrompt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator as ValidationValidator;

class ChatController extends Controller
{
    public function store(
        Request $request,
        ChatPrompt $prompt,
        AppChatContext $context,
        AnthropicChat $anthropic,
    ): JsonResponse {
        $validator = Validator::make($request->all(), [
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

        $system = $prompt->build(null)."\n\n".$context->build($request->user());

        $reply = $anthropic->reply($system, $validated['messages']);

        if ($reply === null) {
            return response()->json(['message' => 'assistant_unavailable'], 502);
        }

        return response()->json([
            'data' => ['reply' => $reply],
        ]);
    }
}
