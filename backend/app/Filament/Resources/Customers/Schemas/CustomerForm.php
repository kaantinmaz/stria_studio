<?php

namespace App\Filament\Resources\Customers\Schemas;

use App\Models\AppUser;
use App\Models\Touchpoint;
use App\Support\Attribution;
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
                Select::make('touchpoint_id')
                    ->label('Geliş kaynağı (Ref kodu)')
                    ->helperText('WhatsApp mesajındaki "(Ref: K7F3)" kodunu yazın. Formdan gelenler telefonla otomatik bağlanır.')
                    ->searchable()
                    ->nullable()
                    ->getSearchResultsUsing(fn (string $search): array => Touchpoint::query()
                        ->where('created_at', '>=', now()->subDays(Attribution::WINDOW_DAYS))
                        ->where(fn ($q) => $q
                            ->where('ref_code', Attribution::parseRef($search) ?? strtoupper(trim($search)))
                            ->orWhere('phone', Touchpoint::normalizePhone($search) ?? '__none__'))
                        ->latest('id')
                        ->limit(20)
                        ->get()
                        ->mapWithKeys(fn (Touchpoint $tp): array => [$tp->id => $tp->label()])
                        ->all())
                    ->getOptionLabelUsing(fn ($value): ?string => Touchpoint::query()->find($value)?->label()),
                Select::make('heard_from')
                    ->label('Bizi nereden buldunuz?')
                    ->options(\App\Models\Customer::HEARD_FROM)
                    ->nullable(),
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
