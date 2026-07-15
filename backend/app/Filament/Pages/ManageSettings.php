<?php

namespace App\Filament\Pages;

use App\Models\Setting;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
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
        $this->loadSite(null);
    }

    /** Site slug => label for the switcher. '' (empty) = the main site. */
    private function siteOptions(): array
    {
        $options = ['' => 'Ana Site (Stria Studio)'];
        foreach (config('microsites', []) as $slug => $cfg) {
            $options[$slug] = $cfg['name'];
        }

        return $options;
    }

    /** Load a site's settings row into the form. NULL = main site. */
    private function loadSite(?string $site): void
    {
        $row = Setting::forSite($site)->attributesToArray();
        $row['editing_site'] = $site ?? '';
        $this->form->fill($row);
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('editing_site')
                    ->label('Düzenlenen site')
                    ->helperText('Her sitenin ayarları ayrıdır. Site seçin, kaydedin.')
                    ->options($this->siteOptions())
                    ->selectablePlaceholder(false)
                    ->live()
                    ->dehydrated(false)
                    ->afterStateUpdated(fn ($state) => $this->loadSite($state === '' ? null : $state)),
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
                        Tab::make('Kampanya')
                            ->schema([
                                Toggle::make('campaign_enabled')
                                    ->label('Kampanya barı göster'),
                                TextInput::make('campaign_text_tr')
                                    ->label('Kampanya metni (TR)')
                                    ->maxLength(255),
                                TextInput::make('campaign_text_en')
                                    ->label('Kampanya metni (EN)')
                                    ->maxLength(255),
                            ]),
                        Tab::make('Pop-up')
                            ->schema([
                                Toggle::make('popup_enabled')
                                    ->label('Pop-up göster'),
                                TextInput::make('popup_title_tr')
                                    ->label('Başlık (TR)'),
                                TextInput::make('popup_title_en')
                                    ->label('Başlık (EN)'),
                                Textarea::make('popup_text_tr')
                                    ->label('Metin (TR)')
                                    ->rows(3),
                                Textarea::make('popup_text_en')
                                    ->label('Metin (EN)')
                                    ->rows(3),
                                FileUpload::make('popup_image')
                                    ->label('Görsel')
                                    ->image()
                                    ->disk('public')
                                    ->directory('popups'),
                                TextInput::make('popup_cta_text_tr')
                                    ->label('Buton metni (TR)'),
                                TextInput::make('popup_cta_text_en')
                                    ->label('Buton metni (EN)'),
                                TextInput::make('popup_cta_url')
                                    ->label('Buton bağlantısı'),
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
                        Tab::make('Kod Enjeksiyonu')
                            ->schema([
                                Textarea::make('header_code')
                                    ->label('Header kodu (<body> başı)')
                                    ->helperText('Analytics, GTM, pixel, özel CSS. Ham olarak eklenir — dikkatli kullan.')
                                    ->rows(8)
                                    ->extraInputAttributes(['style' => 'font-family: monospace;']),
                                Textarea::make('footer_code')
                                    ->label('Footer kodu (</body> öncesi)')
                                    ->helperText('Sohbet widget’ı, geç yüklenen scriptler.')
                                    ->rows(8)
                                    ->extraInputAttributes(['style' => 'font-family: monospace;']),
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
        $selected = $this->data['editing_site'] ?? '';
        $site = $selected === '' ? null : $selected;

        // getState() excludes the switcher (dehydrated) — only real columns are saved.
        Setting::forSite($site)->update($this->form->getState());

        Notification::make()
            ->title('Ayarlar kaydedildi')
            ->body($site ? config("microsites.$site.name") : 'Ana Site')
            ->success()
            ->send();
    }
}
