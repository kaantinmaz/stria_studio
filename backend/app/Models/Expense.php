<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'amount',
        'category',
        'spent_at',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'spent_at' => 'date',
        ];
    }

    /**
     * @return array<string, string>
     */
    public static function categoryOptions(): array
    {
        return [
            'kira' => 'Kira',
            'malzeme' => 'Malzeme',
            'maas' => 'Maaş',
            'pazarlama' => 'Pazarlama',
            'fatura' => 'Fatura',
            'diger' => 'Diğer',
        ];
    }
}
