<?php

namespace App\Filament\Resources\Customers\Pages;

use App\Filament\Resources\Customers\CustomerResource;
use App\Models\Customer;
use App\Support\CustomerMerge;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Icons\Heroicon;
use InvalidArgumentException;

class EditCustomer extends EditRecord
{
    protected static string $resource = CustomerResource::class;

    protected function getHeaderActions(): array
    {
        return [
            $this->mergeAction(),
            DeleteAction::make(),
        ];
    }

    private function mergeAction(): Action
    {
        return Action::make('merge')
            ->label('Birleştir')
            ->icon(Heroicon::OutlinedArrowsRightLeft)
            ->color('warning')
            ->requiresConfirmation()
            ->schema([
                Select::make('target_id')
                    ->label('Hedef müşteri')
                    ->required()
                    ->searchable()
                    ->helperText('Bu müşterinin tüm randevuları, fotoğrafları ve uygulama bağı seçilen müşteriye taşınır; bu kayıt silinir.')
                    ->getSearchResultsUsing(fn (string $search): array => Customer::query()
                        ->whereKeyNot($this->record->getKey())
                        ->where(function ($query) use ($search): void {
                            $query->where('name', 'like', "%{$search}%")
                                ->orWhere('phone', 'like', "%{$search}%");
                        })
                        ->limit(50)
                        ->get()
                        ->mapWithKeys(fn (Customer $customer): array => [
                            $customer->id => static::customerLabel($customer),
                        ])
                        ->all())
                    ->getOptionLabelUsing(function ($value): ?string {
                        $customer = Customer::query()->find($value);

                        return $customer ? static::customerLabel($customer) : null;
                    }),
            ])
            ->action(function (array $data): void {
                $source = $this->record;
                $target = Customer::query()->findOrFail($data['target_id']);

                if ($source->is($target)) {
                    Notification::make()
                        ->title('Bir müşteriyi kendisiyle birleştiremezsiniz.')
                        ->danger()
                        ->send();

                    return;
                }

                try {
                    (new CustomerMerge)->merge($source, $target);
                } catch (InvalidArgumentException) {
                    Notification::make()
                        ->title('Her iki müşteride de uygulama üyeliği var; önce birini çözün.')
                        ->danger()
                        ->send();

                    return;
                }

                Notification::make()
                    ->title('Müşteriler birleştirildi')
                    ->success()
                    ->send();

                $this->redirect(EditCustomer::getUrl(['record' => $target]));
            });
    }

    private static function customerLabel(Customer $customer): string
    {
        return trim($customer->name.($customer->phone ? " ({$customer->phone})" : ''));
    }
}
