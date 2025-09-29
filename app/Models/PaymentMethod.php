<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
  use HasFactory;

  protected $fillable = [
    'name',
    'slug',
    'gateway',
    'icon',
    'description',
    'settings',
    'fee_percentage',
    'fee_fixed',
    'min_amount',
    'max_amount',
    'is_active',
    'is_test_mode',
    'sort_order',
  ];

  protected $casts = [
    'settings' => 'array',
    'fee_percentage' => 'decimal:2',
    'fee_fixed' => 'integer',
    'min_amount' => 'integer',
    'max_amount' => 'integer',
    'is_active' => 'boolean',
    'is_test_mode' => 'boolean',
    'sort_order' => 'integer',
  ];

  /**
   * Связь с транзакциями
   */
  public function transactions()
  {
    return $this->hasMany(PaymentTransaction::class);
  }

  /**
   * Связь с донатами
   */
  public function donations()
  {
    return $this->hasManyThrough(Donation::class, PaymentTransaction::class);
  }

  /**
   * Scope для активных методов
   */
  public function scopeActive($query)
  {
    return $query->where('is_active', true);
  }

  /**
   * Scope для сортировки
   */
  public function scopeOrdered($query)
  {
    return $query->orderBy('sort_order')->orderBy('name');
  }

  /**
   * Проверка минимальной суммы
   */
  public function isValidAmount(int $amount): bool
  {
    if ($amount < $this->min_amount) {
      return false;
    }

    if ($this->max_amount > 0 && $amount > $this->max_amount) {
      return false;
    }

    return true;
  }

  /**
   * Расчет комиссии
   */
  public function calculateFee(int $amount): int
  {
    $percentageFee = (int) round($amount * $this->fee_percentage / 100);
    return $percentageFee + $this->fee_fixed;
  }

  /**
   * Получение настроек шлюза
   */
  public function getGatewaySettings(): array
  {
    return $this->settings ?? [];
  }

  /**
   * Получение названия для отображения
   */
  public function getDisplayNameAttribute(): string
  {
    return $this->name;
  }

  /**
   * Получение иконки
   */
  public function getIconUrlAttribute(): ?string
  {
    if (!$this->icon) {
      return null;
    }

    return asset('images/payment-methods/' . $this->icon);
  }
}
