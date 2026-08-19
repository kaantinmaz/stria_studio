<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdsCommand;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Kademeli yetkili komut kuyruğunun Ads Script ucu. Betik saatlik çalışır:
 * önce index() ile uygulanmaya HAZIR komutları çeker, uygular, sonra results()
 * ile sonuçları geri bildirir. İkisi de :ads token kapsamı ister.
 */
class AdsCommandController extends Controller
{
    /**
     * Uygulanmaya hazır komutlar: (tier=auto AND status=pending) VEYA
     * status=approved. id sırasıyla, daily_apply_limit kadar. Kuyruk kapalıysa
     * (config ads.commands.enabled=false) boş liste döner.
     */
    public function index(): JsonResponse
    {
        if (! config('ads.commands.enabled')) {
            return response()->json(['data' => []]);
        }

        $limit = (int) config('ads.commands.daily_apply_limit');

        $commands = AdsCommand::query()
            ->where(function ($q) {
                $q->where(fn ($qq) => $qq->where('tier', 'auto')->where('status', 'pending'))
                    ->orWhere('status', 'approved');
            })
            ->orderBy('id')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $commands->map(fn (AdsCommand $c) => [
                'id' => $c->id,
                'kind' => $c->kind,
                'campaign' => $c->campaign_name,
                'ad_group' => $c->ad_group_name,
                'payload' => $c->payload,
            ])->all(),
        ]);
    }

    /**
     * Ads Script'in uygulama sonuçları. ok:true → applied (+applied_at, result),
     * ok:false → failed (+error). Zaten sonuçlanmış komut tekrar gelirse
     * çakışmadan (idempotent) kendi kovasında sayılır; bilinmeyen id skipped'a
     * yansır — sessiz atlama yok.
     */
    public function results(Request $request): JsonResponse
    {
        $data = $request->validate([
            'results' => ['present', 'array'],
            'results.*.id' => ['required', 'integer'],
            'results.*.ok' => ['required', 'boolean'],
            'results.*.result' => ['sometimes', 'nullable', 'string'],
            'results.*.error' => ['sometimes', 'nullable', 'string'],
        ]);

        $applied = 0;
        $failed = 0;
        $skipped = 0;

        foreach ($data['results'] as $result) {
            $command = AdsCommand::query()->find($result['id']);

            if ($command === null) {
                $skipped++;

                continue;
            }

            // Zaten sonuçlanmışsa (applied/failed) tekrar işleme: applied_at ve
            // sonuç alanlarını ezmeyiz, yalnızca mevcut kovasında sayarız.
            if (in_array($command->status, ['applied', 'failed'], true)) {
                $command->status === 'applied' ? $applied++ : $failed++;

                continue;
            }

            if ($result['ok']) {
                $command->update([
                    'status' => 'applied',
                    'applied_at' => CarbonImmutable::now(),
                    'result' => $result['result'] ?? null,
                ]);
                $applied++;
            } else {
                $command->update([
                    'status' => 'failed',
                    'error' => $result['error'] ?? null,
                ]);
                $failed++;
            }
        }

        return response()->json([
            'data' => [
                'applied' => $applied,
                'failed' => $failed,
                'skipped' => $skipped,
            ],
        ]);
    }
}
