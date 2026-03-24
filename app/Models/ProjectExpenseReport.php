<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class ProjectExpenseReport extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'project_id',
        'title',
        'amount_kopecks',
        'status',
        'report_date',
        'pdf_file',
        'pdf_file_size',
    ];

    protected $casts = [
        'amount_kopecks' => 'integer',
        'report_date'    => 'date',
        'pdf_file_size'  => 'integer',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function getAmountRublesAttribute(): float
    {
        return $this->amount_kopecks / 100;
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount_rubles, 0, '.', ' ') . ' ₽';
    }

    public function getPdfUrlAttribute(): ?string
    {
        if (empty($this->pdf_file)) {
            return null;
        }

        if (str_starts_with($this->pdf_file, 'http://') || str_starts_with($this->pdf_file, 'https://')) {
            return $this->pdf_file;
        }

        return '/storage/' . ltrim($this->pdf_file, '/');
    }

    public function getFormattedFileSizeAttribute(): ?string
    {
        if (!$this->pdf_file_size) {
            return null;
        }

        $kb = round($this->pdf_file_size / 1024, 1);

        return $kb . ' kb';
    }

    public function getFormattedDateAttribute(): string
    {
        static $months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];

        return $this->report_date->day . ' ' . $months[$this->report_date->month - 1] . ' ' . $this->report_date->year;
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'paid'    => 'Оплачено',
            'pending' => 'В обработке',
            default   => $this->status,
        };
    }
}
