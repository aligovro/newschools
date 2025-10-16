<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiteWidgetResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'widget_id' => $this->widget_id,
      'name' => $this->name,
      'widget_slug' => $this->widget_slug,
      'position_name' => $this->position_name,
      'position_slug' => $this->position_slug,
      'order' => $this->order,
      'sort_order' => $this->sort_order,
      'is_active' => $this->is_active,
      'is_visible' => $this->is_visible,
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,

      // Нормализованная конфигурация
      'config' => $this->getNormalizedConfig(),
      'settings' => $this->getNormalizedSettings(),

      // Конфигурации
      'configs' => $this->configs->map(function ($config) {
        return [
          'config_key' => $config->config_key,
          'config_value' => $config->config_value,
          'config_type' => $config->config_type,
        ];
      })->toArray(),

      // Специализированные данные
      'hero_slides' => $this->when(
        $this->relationLoaded('heroSlides') && $this->heroSlides->isNotEmpty(),
        function () {
          return HeroSlideResource::collection($this->heroSlides)->toArray(request());
        },
        function () {
          // Если heroSlides не загружены, берем из config
          $config = $this->getNormalizedConfig();
          return $config['hero_slides'] ?? [];
        }
      ),
      'form_fields' => $this->whenLoaded('formFields', function () {
        return $this->formFields->map(function ($field) {
          return [
            'id' => $field->id,
            'field_name' => $field->field_name,
            'field_type' => $field->field_type,
            'field_label' => $field->field_label,
            'field_placeholder' => $field->field_placeholder,
            'field_help_text' => $field->field_help_text,
            'field_required' => $field->field_required,
            'field_options' => $field->field_options,
            'field_validation' => $field->field_validation,
            'sort_order' => $field->sort_order,
            'is_active' => $field->is_active,
          ];
        })->toArray();
      }),
      'menu_items' => $this->whenLoaded('menuItems', function () {
        return $this->menuItems->map(function ($item) {
          return [
            'id' => $item->id,
            'item_id' => $item->item_id,
            'title' => $item->title,
            'url' => $item->url,
            'type' => $item->type,
            'open_in_new_tab' => $item->open_in_new_tab,
            'sort_order' => $item->sort_order,
            'is_active' => $item->is_active,
          ];
        })->toArray();
      }),

      // Связанные модели
      'widget' => $this->whenLoaded('widget'),
      'position' => $this->whenLoaded('position'),
    ];
  }
}
