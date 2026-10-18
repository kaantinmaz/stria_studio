<?php

namespace App\Console\Commands;

use App\Models\ContentRevision;
use Illuminate\Console\Command;

/**
 * seo:weekly'nin otomatik değişikliklerini geri alır: revizyonun `before`
 * alanları içeriğe aynen geri yazılır. Bir revizyon yalnızca bir kez geri
 * alınabilir; --list son 20 revizyonu gösterir.
 */
class RevertContent extends Command
{
    protected $signature = 'seo:revert {id? : content_revisions kaydının id\'si}
        {--list : Son 20 revizyonu listele}';

    protected $description = 'seo:weekly otomatik değişikliğini önceki hâline döndürür';

    public function handle(): int
    {
        if ($this->option('list')) {
            $this->table(
                ['id', 'tarih', 'neden', 'içerik', 'geri alındı'],
                ContentRevision::latest('id')->take(20)->get()->map(fn (ContentRevision $r): array => [
                    $r->id,
                    (string) $r->created_at,
                    $r->reason,
                    class_basename($r->revisable_type).'#'.$r->revisable_id,
                    $r->reverted_at !== null ? (string) $r->reverted_at : '—',
                ])->all(),
            );

            return self::SUCCESS;
        }

        $revision = ContentRevision::find($this->argument('id'));
        if ($revision === null) {
            $this->error('Revizyon bulunamadı. Liste için: php artisan seo:revert --list');

            return self::FAILURE;
        }

        if ($revision->reverted_at !== null) {
            $this->error("Revizyon #{$revision->id} zaten {$revision->reverted_at} tarihinde geri alındı.");

            return self::FAILURE;
        }

        $model = $revision->revisable;
        if ($model === null) {
            $this->error("Revizyonun içeriği ({$revision->revisable_type}#{$revision->revisable_id}) artık yok.");

            return self::FAILURE;
        }

        foreach ($revision->before as $field => $value) {
            $model->{$field} = $value;
        }
        $model->save();

        $revision->reverted_at = now();
        $revision->save();

        $this->info("Revizyon #{$revision->id} geri alındı: ".implode(', ', array_keys($revision->before)));

        return self::SUCCESS;
    }
}
