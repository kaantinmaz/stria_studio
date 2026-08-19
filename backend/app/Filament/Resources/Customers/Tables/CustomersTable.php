<?php

namespace App\Filament\Resources\Customers\Tables;

use App\Support\CustomerPairing;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class CustomersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Ad Soyad')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('phone')
                    ->label('Telefon')
                    ->placeholder('—'),
                TextColumn::make('instagram')
                    ->label('Instagram')
                    ->placeholder('—'),
                IconColumn::make('app_user_id')
                    ->label('Uygulama')
                    ->icon(fn ($state) => $state ? Heroicon::OutlinedDevicePhoneMobile : null)
                    ->color('success'),
                TextColumn::make('appointments_count')
                    ->label('Randevu Sayısı')
                    ->counts('appointments')
                    ->sortable(),
                TextColumn::make('no_show_appointments_count')
                    ->label('Gelmedi')
                    ->counts([
                        'appointments as no_show_appointments_count' => fn (Builder $query) => $query->where('status', 'no_show'),
                    ])
                    ->badge()
                    ->color(fn (int $state): string => $state > 0 ? 'danger' : 'gray')
                    ->formatStateUsing(fn (int $state): string => $state > 0 ? (string) $state : '—')
                    ->sortable(),
                TextColumn::make('photos')
                    ->label('Fotoğraflar')
                    ->badge()
                    ->color('gray')
                    ->getStateUsing(function ($record): string {
                        $count = count($record->photos ?? []);

                        return $count > 0 ? $count.' fotoğraf' : '—';
                    }),
                TextColumn::make('created_at')
                    ->label('Kayıt Tarihi')
                    ->since()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->recordActions([
                EditAction::make(),
                Action::make('pairingQr')
                    ->label('Uygulama QR')
                    ->icon(Heroicon::OutlinedQrCode)
                    ->visible(fn ($record): bool => $record->app_user_id === null)
                    ->modalHeading('Uygulamaya bağla')
                    ->modalContent(function ($record) {
                        $pairing = app(CustomerPairing::class);
                        $token = $pairing->token($record);

                        return view('filament.customer-pairing-qr', [
                            'svg' => $pairing->qrSvg($token),
                            'customerName' => $record->name,
                            'ttlMinutes' => CustomerPairing::TTL_MINUTES,
                            'appointmentCount' => $record->appointments()->count(),
                        ]);
                    })
                    ->modalSubmitAction(false)
                    ->modalCancelActionLabel('Kapat'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
