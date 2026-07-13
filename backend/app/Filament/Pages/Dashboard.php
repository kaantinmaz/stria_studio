<?php

namespace App\Filament\Pages;

use Filament\Forms\Components\Select;
use Filament\Pages\Dashboard as BaseDashboard;
use Filament\Pages\Dashboard\Concerns\HasFiltersForm;
use Filament\Schemas\Schema;

// Custom dashboard with a site filter. The selected value flows to every widget
// as `$this->pageFilters['site']` (see the ScopesBySite trait on the widgets).
class Dashboard extends BaseDashboard
{
    use HasFiltersForm;

    public function filtersForm(Schema $schema): Schema
    {
        $options = [
            '' => 'Tüm Siteler',
            'main' => 'Ana Site (Stria Studio)',
        ];
        foreach (config('microsites', []) as $slug => $cfg) {
            $options[$slug] = $cfg['name'];
        }

        return $schema->components([
            Select::make('site')
                ->label('Site')
                ->options($options)
                ->default('')
                ->selectablePlaceholder(false),
        ]);
    }
}
