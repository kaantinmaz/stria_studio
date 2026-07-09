<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Pages\Page;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;

class ManageSettings extends Page
{
    protected static string|\BackedEnum|null $navigationIcon = Heroicon::OutlinedCog6Tooth;

    protected static string|\UnitEnum|null $navigationGroup = 'Ayarlar';

    protected static ?string $navigationLabel = 'Site Ayarları';

    protected static ?int $navigationSort = 1;

    protected string $view = 'filament.pages.manage-settings';

    /**
     * @var array<string, mixed>
     */
    public ?array $data = [];

    public function mount(): void
    {
        $this->form->fill(Setting::current()->attributesToArray());
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make()
                    ->tabs([
                        Tab::make('İletişim')
                            ->schema([
                                TextInput::make('phone'),
                                TextInput::make('phone_local'),
                                TextInput::make('whatsapp'),
                                TextInput::make('instagram'),
                                TextInput::make('instagram_handle'),
                                TextInput::make('address'),
                            ]),
                        Tab::make('Adres/NAP')
                            ->schema([
                                TextInput::make('street_address'),
                                TextInput::make('locality'),
                                TextInput::make('region'),
                                TextInput::make('postal_code'),
                                TextInput::make('country'),
                            ]),
                        Tab::make('Konum')
                            ->schema([
                                TextInput::make('lat')
                                    ->numeric(),
                                TextInput::make('lng')
                                    ->numeric(),
                            ]),
                        Tab::make('Çalışma Saatleri')
                            ->schema([
                                Repeater::make('hours')
                                    ->schema([
                                        Select::make('days')
                                            ->multiple()
                                            ->options([
                                                'Monday' => 'Monday',
                                                'Tuesday' => 'Tuesday',
                                                'Wednesday' => 'Wednesday',
                                                'Thursday' => 'Thursday',
                                                'Friday' => 'Friday',
                                                'Saturday' => 'Saturday',
                                                'Sunday' => 'Sunday',
                                            ]),
                                        TextInput::make('open'),
                                        TextInput::make('close'),
                                    ])
                                    ->addActionLabel('Çalışma saati ekle')
                                    ->columnSpanFull(),
                            ]),
                    ])
                    ->columnSpanFull(),
            ])
            ->statePath('data');
    }

    public function save(): void
    {
        Setting::current()->update($this->form->getState());

        Notification::make()
            ->title('Ayarlar kaydedildi')
            ->success()
            ->send();
    }
}
