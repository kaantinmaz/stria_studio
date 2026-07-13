<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

class IndexNow
{
    public static function submit(array $urls): void
    {
        $key = config('services.indexnow.key');
        if (empty($key)) {
            return;
        }

        $host = config('services.indexnow.host');

        try {
            Http::timeout(5)->post('https://api.indexnow.org/indexnow', [
                'host' => $host,
                'key' => $key,
                'keyLocation' => 'https://'.$host.'/'.$key.'.txt',
                'urlList' => $urls,
            ])->throw();
        } catch (Throwable $exception) {
            Log::warning('IndexNow submission failed.', [
                'exception' => $exception->getMessage(),
            ]);
        }
    }
}
