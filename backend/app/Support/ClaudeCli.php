<?php

namespace App\Support;

use Illuminate\Support\Facades\Log;
use Symfony\Component\Process\Exception\ProcessTimedOutException;
use Symfony\Component\Process\Process;
use Throwable;

/**
 * Abonelik/OAuth ile giriş yapılmış `claude` CLI'sini headless (`-p`) modda
 * çağırıp şemaya uyan yapılandırılmış JSON çıktısı döndürür. Anthropic HTTP
 * API'si ve ANTHROPIC_API_KEY bilinçli olarak KULLANILMAZ; `--bare` ve
 * `--dangerously-skip-permissions` asla geçilmez.
 */
final class ClaudeCli
{
    /**
     * @param  array<string, mixed>  $schema  Beklenen nesnenin JSON Schema'sı
     * @return array<string, mixed>  Çözümlenmiş yapılandırılmış çıktı
     *
     * @throws ClaudeCliException
     */
    public function json(string $prompt, array $schema, ?string $system = null): array
    {
        $binary = (string) config('content.claude.binary');
        $model = (string) config('content.claude.model');

        $command = [
            $binary,
            '-p',
            '--model', $model,
            '--output-format', 'json',
            // Tüm araçları kapat (saf metin üretimi).
            '--tools', '',
            '--strict-mcp-config',
            '--no-session-persistence',
            '--json-schema', json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
        ];

        if ($system !== null) {
            $command[] = '--append-system-prompt';
            $command[] = $system;
        }

        // Abonelik oturumunu zorla: ANTHROPIC_API_KEY (Laravel .env'inde chatbot
        // için tanımlı) alt sürece sızarsa claude CLI API anahtarı yoluna geçer
        // ve claude.ai oturumunu reddeder. Bu değişkenler alt süreçte silinir.
        $env = [
            'ANTHROPIC_API_KEY' => false,
            'ANTHROPIC_AUTH_TOKEN' => false,
            'ANTHROPIC_BASE_URL' => false,
            'ANTHROPIC_MODEL' => false,
            'CLAUDE_CODE_USE_BEDROCK' => false,
            'CLAUDE_CODE_USE_VERTEX' => false,
        ];

        // Ortamın kalanı miras alınır; yalnızca yapılandırılmışsa HOME geçersiz
        // kılınır (Plesk abonelik kullanıcısının ~/.claude oturumu farklı bir
        // HOME'da durabilir).
        $home = config('content.claude.home');
        if (! empty($home)) {
            $env['HOME'] = (string) $home;
        }

        // Sunucuda interaktif oturum tutulamaz; `claude setup-token` ile
        // üretilen uzun ömürlü abonelik token'ı bu değişkenle geçirilir.
        $token = config('content.claude.oauth_token');
        if (! empty($token)) {
            $env['CLAUDE_CODE_OAUTH_TOKEN'] = (string) $token;
        }

        $process = new Process(
            $command,
            (string) config('content.claude.cwd'),
            $env,
            $prompt,
            (float) config('content.claude.timeout'),
        );

        $startedAt = microtime(true);

        try {
            $process->run();
        } catch (ProcessTimedOutException $exception) {
            throw new ClaudeCliException(
                'claude CLI zaman aşımına uğradı ('.(int) config('content.claude.timeout').' sn).',
                0,
                $exception,
            );
        } catch (Throwable $exception) {
            throw new ClaudeCliException(
                'claude CLI başlatılamadı: '.$exception->getMessage(),
                0,
                $exception,
            );
        }

        $durationMs = (int) round((microtime(true) - $startedAt) * 1000);

        if (! $process->isSuccessful()) {
            $stderr = trim($process->getErrorOutput());

            throw new ClaudeCliException(sprintf(
                "claude CLI %d çıkış kodu ile başarısız oldu: %s\nİpucu: sunucuda `claude auth login` veya `claude setup-token` ile oturum açılmış olmalı.",
                (int) $process->getExitCode(),
                mb_substr($stderr, 0, 500),
            ));
        }

        $stdout = $process->getOutput();
        $envelope = json_decode($stdout, true);

        if (! is_array($envelope)) {
            throw new ClaudeCliException(
                'claude CLI çıktısı JSON olarak çözümlenemedi: '.mb_substr(trim($stdout), 0, 500),
            );
        }

        if (($envelope['is_error'] ?? false) === true || ($envelope['subtype'] ?? null) !== 'success') {
            $result = $envelope['result'] ?? $envelope['subtype'] ?? 'bilinmeyen hata';

            throw new ClaudeCliException(
                'claude CLI hata döndürdü: '.(is_string($result) ? mb_substr($result, 0, 500) : json_encode($result, JSON_UNESCAPED_UNICODE)),
            );
        }

        Log::info('claude cli', [
            'model' => $model,
            'duration_ms' => $durationMs,
            'total_cost_usd' => $envelope['total_cost_usd'] ?? null,
            'num_turns' => $envelope['num_turns'] ?? null,
        ]);

        // Yapılandırılmış çıktı öncelikli; yoksa .result stringini çöz.
        $structured = $envelope['structured_output'] ?? null;
        if (is_array($structured)) {
            return $structured;
        }

        $raw = $envelope['result'] ?? null;
        if (! is_string($raw)) {
            throw new ClaudeCliException('claude CLI yapılandırılmış çıktı üretmedi.');
        }

        $decoded = $this->decodeResult($raw);
        if (! is_array($decoded)) {
            throw new ClaudeCliException(
                'claude CLI çıktısı bir JSON nesnesi değil: '.mb_substr(trim($raw), 0, 500),
            );
        }

        return $decoded;
    }

    /**
     * `.result` düz JSON ya da ```json çitli blok içinde gelebilir; ikisini de tolere et.
     */
    private function decodeResult(string $raw): mixed
    {
        $text = trim($raw);

        if (str_starts_with($text, '```')) {
            $text = preg_replace('/^```[a-zA-Z]*\s*|\s*```$/', '', $text) ?? $text;
            $text = trim($text);
        }

        return json_decode($text, true);
    }
}
