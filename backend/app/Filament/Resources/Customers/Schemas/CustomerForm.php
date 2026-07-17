<?php

namespace App\Filament\Resources\Customers\Schemas;

use App\Models\AppUser;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class CustomerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->label('Ad Soyad')
                    ->required()
                    ->maxLength(255),
                Select::make('app_user_id')
                    ->label('Uygulama kullanıcısı')
                    ->searchable()
                    ->nullable()
                    ->unique(ignoreRecord: true)
                    ->getSearchResultsUsing(fn (string $search): array => AppUser::query()
                        ->where(function ($query) use ($search): void {
                            $query->where('code', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%")
                                ->orWhere('name', 'like', "%{$search}%");
                        })
                        ->limit(50)
                        ->get()
                        ->mapWithKeys(fn (AppUser $user): array => [
                            $user->id => "{$user->code} — {$user->name} ({$user->email})",
                        ])
                        ->all())
                    ->getOptionLabelUsing(function ($value): ?string {
                        $user = AppUser::query()->find($value);

                        return $user ? "{$user->code} — {$user->name} ({$user->email})" : null;
                    }),
                TextInput::make('phone')
                    ->label('Telefon')
                    ->tel()
                    ->maxLength(255),
                TextInput::make('email')
                    ->label('E-posta')
                    ->email()
                    ->maxLength(255),
                Placeholder::make('completed_appointments')
                    ->label('Tamamlanan İşlem')
                    ->content(fn ($record): string => $record
                        ? $record->appointments()
                            ->where('status', 'confirmed')
                            ->where('starts_at', '<', now())
                            ->count().' işlem'
                        : '—')
                    ->hiddenOn('create'),
                TextInput::make('instagram')
                    ->label('Instagram')
                    ->maxLength(255),
                Textarea::make('notes')
                    ->label('Notlar')
                    ->rows(5)
                    ->columnSpanFull(),
                FileUpload::make('photos')
                    ->image()
                    ->multiple()
                    ->reorderable()
                    ->disk('public')
                    ->directory('customers')
                    ->label('Öncesi / Sonrası Fotoğrafları')
                    ->helperText('Sınırsız fotoğraf ekleyebilirsiniz.')
                    ->panelLayout('grid')
                    ->imagePreviewHeight('120')
                    ->columnSpanFull(),
            ]);
    }
}
