<?php

namespace App\Support;

use App\Models\Appointment;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CustomerMerge
{
    /**
     * Kaynak müşteriyi hedef müşteriyle birleştirir: randevular, fotoğraflar,
     * uygulama bağı ve boş alanlar hedefe taşınır, kaynak silinir.
     *
     * @throws InvalidArgumentException Her iki müşteride de uygulama üyeliği varsa.
     */
    public function merge(Customer $source, Customer $target): void
    {
        if ($source->app_user_id && $target->app_user_id) {
            throw new InvalidArgumentException('Her iki müşteride de uygulama üyeliği var; önce birini çözün.');
        }

        DB::transaction(function () use ($source, $target): void {
            Appointment::query()
                ->where('customer_id', $source->id)
                ->update(['customer_id' => $target->id]);

            $target->photos = array_values(array_merge($target->photos ?? [], $source->photos ?? []));

            // app_user_id UNIQUE FK: önce kaynaktan boşalt, sonra hedefe yaz.
            if ($source->app_user_id) {
                $appUserId = $source->app_user_id;
                $source->app_user_id = null;
                $source->save();
                $target->app_user_id = $appUserId;
            }

            foreach (['phone', 'email', 'instagram'] as $field) {
                if (blank($target->{$field}) && filled($source->{$field})) {
                    $target->{$field} = $source->{$field};
                }
            }

            if (filled($source->notes)) {
                $target->notes = filled($target->notes)
                    ? $target->notes."\n".$source->notes
                    : $source->notes;
            }

            $target->save();

            $source->delete();
        });
    }
}
