<?php

namespace App\Filament\Resources\ChatConversations\Tables;

use App\Models\ChatConversation;
use App\Support\ChatSummarizer;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\ViewAction;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ChatConversationsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('last_message_at')
                    ->label('Son mesaj')
                    ->dateTime('d.m.Y H:i')
                    ->sortable(),
                TextColumn::make('source')
                    ->label('Kaynak')
                    ->badge()
                    ->formatStateUsing(fn (?string $state, ChatConversation $record): string => $record->sourceLabel()),
                TextColumn::make('site')
                    ->label('Site')
                    ->placeholder('Ana site')
                    ->toggleable(),
                TextColumn::make('summary')
                    ->label('Özet')
                    ->placeholder('Özet bekliyor')
                    ->wrap()
                    ->limit(220)
                    ->searchable(),
                TextColumn::make('first_message')
                    ->label('İlk mesaj')
                    ->state(fn (ChatConversation $record): ?string => $record->firstUserMessage())
                    ->limit(60)
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('message_count')
                    ->label('Mesaj')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('source')
                    ->label('Kaynak')
                    ->options([
                        'web' => 'Site sohbeti',
                        'engage' => 'Etkileşim paneli',
                    ]),
                SelectFilter::make('site')
                    ->label('Site')
                    ->options(fn (): array => collect(array_keys(config('microsites', [])))
                        ->mapWithKeys(fn (string $key): array => [$key => $key])
                        ->all()),
                TernaryFilter::make('summary')
                    ->label('Özet')
                    ->placeholder('Tümü')
                    ->trueLabel('Özetlenenler')
                    ->falseLabel('Özet bekleyenler')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('summary'),
                        false: fn ($query) => $query->whereNull('summary'),
                        blank: fn ($query) => $query,
                    ),
            ])
            ->defaultSort('last_message_at', 'desc')
            ->recordActions([
                ViewAction::make()
                    ->label('Döküm')
                    ->modalHeading('Sohbet dökümü'),
                // Zamanlanmış chat:summarize komutunu beklemeden özet üretir.
                Action::make('summarize')
                    ->label('Özetle')
                    ->icon(Heroicon::OutlinedSparkles)
                    ->action(function (ChatConversation $record): void {
                        if (app(ChatSummarizer::class)->summarize($record)) {
                            Notification::make()
                                ->title('Özet hazır.')
                                ->success()
                                ->send();

                            return;
                        }

                        Notification::make()
                            ->title('Özet üretilemedi.')
                            ->body('Anthropic isteği başarısız oldu; birazdan tekrar deneyin.')
                            ->danger()
                            ->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
