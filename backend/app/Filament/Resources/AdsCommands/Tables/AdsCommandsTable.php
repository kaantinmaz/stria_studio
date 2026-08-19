<?php

namespace App\Filament\Resources\AdsCommands\Tables;

use App\Models\AdsCommand;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Collection;

class AdsCommandsTable
{
    /** Komut türlerinin okunur adları. */
    private const KIND_LABELS = [
        'add_negative_keyword' => 'Negatif kelime ekle',
        'pause_keyword' => 'Anahtar kelimeyi duraklat',
        'set_budget' => 'Bütçe değiştir',
        'pause_campaign' => 'Kampanyayı duraklat',
        'enable_campaign' => 'Kampanyayı aç',
        'create_keyword' => 'Anahtar kelime ekle',
        'create_ad' => 'Reklam oluştur',
    ];

    private const STATUS_LABELS = [
        'pending' => 'Bekliyor',
        'approved' => 'Onaylandı',
        'rejected' => 'Reddedildi',
        'applied' => 'Uygulandı',
        'failed' => 'Başarısız',
    ];

    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('status')
                    ->label('Durum')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => self::STATUS_LABELS[$state] ?? $state)
                    ->color(fn (string $state): string => match ($state) {
                        'applied' => 'success',
                        'failed' => 'danger',
                        'rejected' => 'gray',
                        'approved' => 'info',
                        default => 'warning',
                    }),
                TextColumn::make('tier')
                    ->label('Yetki')
                    ->badge()
                    // Otomatik olan zaten uygulanıyor; onaylı olan seni bekliyor.
                    ->formatStateUsing(fn (string $state): string => $state === 'auto' ? 'Otomatik' : 'Onay gerekli')
                    ->color(fn (string $state): string => $state === 'auto' ? 'gray' : 'warning'),
                TextColumn::make('kind')
                    ->label('İşlem')
                    ->formatStateUsing(fn (string $state): string => self::KIND_LABELS[$state] ?? $state),
                TextColumn::make('campaign_name')
                    ->label('Kampanya')
                    ->placeholder('—')
                    ->wrap()
                    ->searchable(),
                TextColumn::make('payload')
                    ->label('Ne yapılacak')
                    ->getStateUsing(fn (AdsCommand $record): string => self::payloadSummary($record))
                    ->wrap(),
                TextColumn::make('reason')
                    ->label('Gerekçe')
                    ->wrap()
                    ->tooltip(fn (AdsCommand $record): ?string => $record->reason),
                TextColumn::make('applied_at')
                    ->label('Uygulandı')
                    ->dateTime('d.m.Y H:i')
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('error')
                    ->label('Hata')
                    ->placeholder('—')
                    ->color('danger')
                    ->wrap(),
            ])
            ->defaultSort('id', 'desc')
            ->filters([
                SelectFilter::make('status')
                    ->label('Durum')
                    ->options(self::STATUS_LABELS),
                SelectFilter::make('tier')
                    ->label('Yetki')
                    ->options(['auto' => 'Otomatik', 'approval' => 'Onay gerekli']),
            ])
            ->recordActions([
                Action::make('approve')
                    ->label('Onayla')
                    ->icon(Heroicon::OutlinedCheck)
                    ->color('success')
                    ->requiresConfirmation()
                    ->modalHeading('Komutu onayla')
                    ->modalDescription('Onaylanan komut, Ads betiğinin bir sonraki turunda (saat başı) hesaba uygulanır.')
                    ->visible(fn (AdsCommand $record): bool => self::awaitingApproval($record))
                    ->action(function (AdsCommand $record): void {
                        $record->update(['status' => 'approved']);

                        Notification::make()->title('Komut onaylandı')->success()->send();
                    }),
                Action::make('reject')
                    ->label('Reddet')
                    ->icon(Heroicon::OutlinedXMark)
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Komutu reddet')
                    ->modalDescription('Reddedilen komut uygulanmaz ve kural motoru aynı komutu bir daha üretmez.')
                    ->visible(fn (AdsCommand $record): bool => self::awaitingApproval($record))
                    ->action(function (AdsCommand $record): void {
                        $record->update(['status' => 'rejected']);

                        Notification::make()->title('Komut reddedildi')->success()->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('approveSelected')
                        ->label('Seçilenleri onayla')
                        ->icon(Heroicon::OutlinedCheck)
                        ->color('success')
                        ->requiresConfirmation()
                        ->action(function (Collection $records): void {
                            // Yalnızca gerçekten onay bekleyenler; uygulanmış
                            // veya reddedilmiş kayıt sessizce diriltilmez.
                            $approved = $records->filter(fn (AdsCommand $r) => self::awaitingApproval($r));

                            AdsCommand::query()->whereKey($approved->modelKeys())->update(['status' => 'approved']);

                            Notification::make()
                                ->title($approved->count().' komut onaylandı')
                                ->body($approved->count() === $records->count()
                                    ? null
                                    : ($records->count() - $approved->count()).' kayıt onay beklemediği için atlandı.')
                                ->success()
                                ->send();
                        }),
                ]),
            ]);
    }

    private static function awaitingApproval(AdsCommand $record): bool
    {
        return $record->tier === 'approval' && $record->status === 'pending';
    }

    /** Payload'ı kind'e göre tek satırda okunur hale getirir. */
    private static function payloadSummary(AdsCommand $record): string
    {
        $p = $record->payload ?? [];

        return match ($record->kind) {
            'add_negative_keyword', 'pause_keyword', 'create_keyword' => self::keywordLabel($p),
            'set_budget' => number_format((float) ($p['previous'] ?? 0), 2, ',', '.').' ₺ → '
                .number_format((float) ($p['amount'] ?? 0), 2, ',', '.').' ₺',
            'create_ad' => count($p['headlines'] ?? []).' başlık, '.count($p['descriptions'] ?? []).' açıklama'
                .(isset($p['headlines'][0]) ? ' — "'.$p['headlines'][0].'"' : ''),
            'pause_campaign', 'enable_campaign' => $record->campaign_name ?? '—',
            default => json_encode($p, JSON_UNESCAPED_UNICODE) ?: '—',
        };
    }

    private static function keywordLabel(array $payload): string
    {
        $match = match ($payload['match'] ?? 'phrase') {
            'exact' => 'tam',
            'broad' => 'geniş',
            default => 'sıralı',
        };

        return '"'.($payload['text'] ?? '—').'" ('.$match.' eşleşme)';
    }
}
