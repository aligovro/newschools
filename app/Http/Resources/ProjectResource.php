<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
  /**
   * Преобразовать ресурс в массив для API ответа.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      // Основные поля
      'id' => $this->id,
      'organization_id' => $this->organization_id,
      'title' => $this->title,
      'slug' => $this->slug,
      'short_description' => $this->short_description,
      'description' => $this->description,

      // Медиа
      'image' => $this->image ? asset('storage/' . $this->image) : null,
      'gallery' => $this->when(
        $this->gallery,
        fn() => collect($this->gallery)->map(
          fn($item) => asset('storage/' . $item)
        )->toArray()
      ),

      // Финансы (в рублях для удобства)
      'funding' => $this->funding,
      'target_amount' => $this->funding['target']['minor'],
      'target_amount_rubles' => $this->funding['target']['value'],
      'collected_amount' => $this->funding['collected']['minor'],
      'collected_amount_rubles' => $this->funding['collected']['value'],
      'formatted_target_amount' => $this->funding['target']['formatted'],
      'formatted_collected_amount' => $this->funding['collected']['formatted'],

      // Прогресс
      'progress_percentage' => $this->progress_percentage,
      'is_completed' => $this->is_completed,
      'is_active' => $this->is_active,
      'days_left' => $this->days_left,

      // Категория и статус
      'category' => $this->category,
      'category_name' => $this->category_name,
      'status' => $this->status,
      'featured' => (bool) $this->featured,

      // Категории проекта (many-to-many)
      'categories' => $this->whenLoaded('categories', function () {
        return $this->categories->map(function ($category) {
          return [
            'id' => $category->id,
            'name' => $category->name,
            'slug' => $category->slug,
            'description' => $category->description,
          ];
        });
      }),

      // Даты
      'start_date' => $this->when($this->start_date, fn() => $this->start_date?->format('Y-m-d')),
      'end_date' => $this->when($this->end_date, fn() => $this->end_date?->format('Y-m-d')),

      // Метаданные
      'tags' => $this->tags ?? [],
      'beneficiaries' => $this->beneficiaries ?? [],
      'progress_updates' => $this->progress_updates ?? [],
      'seo_settings' => $this->seo_settings ?? [],

      // Статистика
      'views_count' => $this->views_count,
      'donations_count' => $this->donations_count,

      // URL проекта
      'url' => $this->url,

      // Связанные данные (загружаются по требованию)
      'organization' => $this->whenLoaded('organization', function () {
        return [
          'id' => $this->organization->id,
          'name' => $this->organization->name,
          'slug' => $this->organization->slug,
          'domain_url' => $this->organization->domain_url,
        ];
      }),

      'donations' => $this->whenLoaded('donations', function () {
        return $this->donations->map(function ($donation) {
          return [
            'id' => $donation->id,
            'amount' => $donation->amount,
            'formatted_amount' => number_format($donation->amount / 100, 0, '.', ' ') . ' ₽',
            'status' => $donation->status,
            'created_at' => $donation->created_at?->toISOString(),
          ];
        });
      }),

      'media' => $this->whenLoaded('media', function () {
        return OrganizationMediaResource::collection($this->media);
      }),

      // Этапы проекта
      'has_stages' => $this->has_stages ?? false,
      'stages' => $this->whenLoaded('stages', function () {
        return $this->stages->map(function ($stage) {
          $funding = $stage->funding;

          return [
            'id' => $stage->id,
            'title' => $stage->title,
            'description' => $stage->description,
            'image' => $stage->image ? asset('storage/' . $stage->image) : null,
            'gallery' => $stage->gallery ? collect($stage->gallery)->map(fn($item) => asset('storage/' . $item))->toArray() : [],
            'funding' => $funding,
            'target_amount' => $funding['target']['minor'],
            'target_amount_rubles' => $funding['target']['value'],
            'collected_amount' => $funding['collected']['minor'],
            'collected_amount_rubles' => $funding['collected']['value'],
            'progress_percentage' => $funding['progress_percentage'],
            'formatted_target_amount' => $funding['target']['formatted'],
            'formatted_collected_amount' => $funding['collected']['formatted'],
            'status' => $stage->status ?? 'pending',
            'is_completed' => $stage->is_completed,
            'is_active' => $stage->is_active,
            'is_pending' => $stage->is_pending,
            'start_date' => $stage->start_date?->format('Y-m-d'),
            'end_date' => $stage->end_date?->format('Y-m-d'),
            'order' => $stage->order,
          ];
        });
      }),

      // Timestamps
      'created_at' => $this->created_at?->toISOString(),
      'updated_at' => $this->updated_at?->toISOString(),
      'deleted_at' => $this->deleted_at?->toISOString(),
    ];
  }
}
