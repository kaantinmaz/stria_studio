<?php

namespace App\Filament\Widgets\Concerns;

use Filament\Widgets\Concerns\InteractsWithPageFilters;
use Illuminate\Database\Eloquent\Builder;

// Lets a dashboard widget honour the dashboard-level site filter.
// Filter values: null/'' = all sites, 'main' = main site (site IS NULL),
// otherwise a microsite slug. Applies to any model with a `site` column.
trait ScopesBySite
{
    use InteractsWithPageFilters;

    protected function scopeSite(Builder $query): Builder
    {
        $site = $this->pageFilters['site'] ?? null;

        if ($site === null || $site === '') {
            return $query;
        }

        return $site === 'main'
            ? $query->whereNull('site')
            : $query->where('site', $site);
    }
}
