<?php

namespace App\Console\Commands;

use App\Support\Netgsm;
use Illuminate\Console\Command;

/** Netsantral rapor servisinden son çağrıları çeker; webhook'un kaçırdıklarını tamamlar. */
class SyncNetgsmCalls extends Command
{
    protected $signature = 'netgsm:sync-calls {--hours=3 : Geriye bakılacak saat}';

    protected $description = 'Netgsm Netsantral çağrı kayıtlarını (CDR) phone_calls tablosuna senkronlar';

    public function handle(): int
    {
        if (blank(config('services.netgsm.usercode'))) {
            $this->warn('NETGSM_USERCODE tanımlı değil; atlandı.');

            return Command::SUCCESS;
        }

        try {
            $rows = Netgsm::fetchReport(now()->subHours((int) $this->option('hours')), now());
        } catch (\Throwable $e) {
            $this->error($e->getMessage());

            return Command::FAILURE;
        }

        $stored = collect($rows)->filter(fn ($row) => is_array($row) && Netgsm::storeReportRow($row))->count();
        $this->info("{$stored} çağrı kaydı işlendi.");

        return Command::SUCCESS;
    }
}
