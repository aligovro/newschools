<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class OrganizationStaff extends Model
{
  use HasFactory, SoftDeletes;

  protected $table = 'organization_staff';

  protected $fillable = [
    'organization_id',
    'last_name',
    'first_name',
    'middle_name',
    'position',
    'photo',
    'address',
    'email',
  ];

  protected $casts = [
    //
  ];

  // Константа для должности директора
  public const POSITION_DIRECTOR = 'Директор';

  // Связи
  public function organization(): BelongsTo
  {
    return $this->belongsTo(Organization::class);
  }

  // Скоупы
  public function scopeDirector($query)
  {
    return $query->where('position', self::POSITION_DIRECTOR);
  }

  public function scopeByPosition($query, $position)
  {
    return $query->where('position', $position);
  }

  // Методы
  public function getFullNameAttribute(): string
  {
    $name = $this->last_name;
    if ($this->first_name) {
      $name .= ' ' . $this->first_name;
    }
    if ($this->middle_name) {
      $name .= ' ' . $this->middle_name;
    }
    return $name;
  }

  public function getIsDirectorAttribute(): bool
  {
    return $this->position === self::POSITION_DIRECTOR;
  }

  public function getPhotoUrlAttribute(): ?string
  {
    if (empty($this->photo)) {
      return null;
    }

    // Если это внешний URL - возвращаем как есть
    if (str_starts_with($this->photo, 'http://') || str_starts_with($this->photo, 'https://')) {
      return $this->photo;
    }

    // Если уже начинается с /storage/ - возвращаем как есть
    if (str_starts_with($this->photo, '/storage/')) {
      return $this->photo;
    }

    // Убираем ведущие слеши и storage/ если есть
    $photo = ltrim($this->photo, '/');
    if (str_starts_with($photo, 'storage/')) {
      $photo = substr($photo, 8); // убираем 'storage/'
    }

    // Возвращаем нормализованный путь
    return '/storage/' . ltrim($photo, '/');
  }
}
