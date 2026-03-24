<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectBudgetItem extends Model
{
    protected $fillable = [
        'project_id',
        'title',
        'amount_kopecks',
        'sort_order',
    ];

    protected $casts = [
        'amount_kopecks' => 'integer',
        'sort_order'     => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /** Сумма в рублях (для фронта) */
    public function getAmountRublesAttribute(): float
    {
        return $this->amount_kopecks / 100;
    }

    /** Форматированная сумма: «12 500 ₽» */
    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount_kopecks / 100, 0, '.', ' ') . ' ₽';
    }
}
