<?php

namespace App\Http\Controllers;

use App\Support\Netgsm;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

/**
 * Netsantral "santral dinleme" webhook'u. Tüm senaryolar (Inbound_call, DTMF,
 * Queue…) buraya POST edilir; yalnız çağrı bitince gelen `cdr` saklanır.
 */
class NetgsmWebhookController extends Controller
{
    public function __invoke(Request $request, string $token): Response
    {
        $expected = (string) config('services.netgsm.webhook_token');
        abort_if($expected === '' || ! hash_equals($expected, $token), 404);

        // Gövde JSON başlığı olmadan da gelebilir.
        $data = $request->all() ?: (json_decode($request->getContent(), true) ?: []);
        if (strtolower((string) ($data['scenario'] ?? '')) === 'cdr') {
            Netgsm::storeWebhookCdr($data);
        }

        return response()->noContent();
    }
}
