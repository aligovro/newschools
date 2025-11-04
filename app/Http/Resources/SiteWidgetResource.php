<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Log;

class SiteWidgetResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    $normalizedConfig = $this->getNormalizedConfig();

    // Build configs array from DB
    $configsArray = $this->configs->map(function ($config) {
      return [
        'config_key' => $config->config_key,
        'config_value' => $config->config_value,
        'config_type' => $config->config_type,
      ];
    })->toArray();

    // If menu items are available, inject them into config and configs for builder compatibility
    if ($this->relationLoaded('menuItems') && $this->menuItems->isNotEmpty()) {
      $menuItems = $this->menuItems->map(function ($item) {
        return [
          'id' => (string) ($item->item_id ?? $item->id),
          'title' => $item->title,
          'url' => $item->url,
          'type' => $item->type,
          'newTab' => (bool) $item->open_in_new_tab,
        ];
      })->toArray();

      $normalizedConfig['items'] = $menuItems;
      $configsArray[] = [
        'config_key' => 'items',
        'config_value' => json_encode($menuItems),
        'config_type' => 'json',
      ];
    }

    // Inject hero slides if present
    if ($this->relationLoaded('heroSlides') && $this->heroSlides->isNotEmpty()) {
      $slides = $this->heroSlides->map(function ($slide) {
        $backgroundImage = '';
        if ($slide->background_image) {
          if (str_starts_with($slide->background_image, 'http')) {
            $backgroundImage = $slide->background_image;
          } elseif (str_starts_with($slide->background_image, '/storage/')) {
            $backgroundImage = $slide->background_image;
          } else {
            $backgroundImage = '/storage/' . $slide->background_image;
          }
        }

        return [
          'id' => (string) $slide->id,
          'title' => $slide->title,
          'subtitle' => $slide->subtitle,
          'description' => $slide->description,
          'buttonText' => $slide->button_text,
          'buttonLink' => $slide->button_link,
          'buttonLinkType' => $slide->button_link_type,
          'buttonOpenInNewTab' => (bool) $slide->button_open_in_new_tab,
          'backgroundImage' => $backgroundImage,
          'overlayColor' => $slide->overlay_color,
          'overlayOpacity' => $slide->overlay_opacity,
          'overlayGradient' => $slide->overlay_gradient,
          'overlayGradientIntensity' => $slide->overlay_gradient_intensity,
          'sortOrder' => $slide->sort_order,
          'isActive' => true,
        ];
      })->toArray();
      $normalizedConfig['hero_slides'] = $slides;
      $configsArray[] = [
        'config_key' => 'hero_slides',
        'config_value' => json_encode($slides),
        'config_type' => 'json',
      ];
    }

    // Inject slider slides if present
    if ($this->relationLoaded('sliderSlides') && $this->sliderSlides->isNotEmpty()) {
      $slides = $this->sliderSlides->map(function ($slide) {
        $backgroundImage = '';
        if ($slide->background_image) {
          if (str_starts_with($slide->background_image, 'http')) {
            $backgroundImage = $slide->background_image;
          } elseif (str_starts_with($slide->background_image, '/storage/')) {
            $backgroundImage = $slide->background_image;
          } else {
            $backgroundImage = '/storage/' . $slide->background_image;
          }
        }

        return [
          'id' => (string) $slide->id,
          'title' => $slide->title,
          'subtitle' => $slide->subtitle,
          'description' => $slide->description,
          'buttonText' => $slide->button_text,
          'buttonLink' => $slide->button_link,
          'buttonLinkType' => $slide->button_link_type,
          'buttonOpenInNewTab' => (bool) $slide->button_open_in_new_tab,
          'backgroundImage' => $backgroundImage,
          'overlayColor' => $slide->overlay_color,
          'overlayOpacity' => $slide->overlay_opacity,
          'overlayGradient' => $slide->overlay_gradient,
          'overlayGradientIntensity' => $slide->overlay_gradient_intensity,
          'sortOrder' => $slide->sort_order,
          'isActive' => true,
        ];
      })->toArray();
      $normalizedConfig['slider_slides'] = $slides;
      $configsArray[] = [
        'config_key' => 'slider_slides',
        'config_value' => json_encode($slides),
        'config_type' => 'json',
      ];
    }

    // Inject form fields if present
    if ($this->relationLoaded('formFields') && $this->formFields->isNotEmpty()) {
      $fields = $this->formFields->where('is_active', true)->map(function ($field) {
        return [
          'id' => $field->id,
          'name' => $field->field_name,
          'type' => $field->field_type,
          'label' => $field->field_label,
          'placeholder' => $field->field_placeholder,
          'help_text' => $field->field_help_text,
          'is_required' => (bool) $field->field_required,
          'validation' => $field->field_validation,
          'options' => $field->field_options,
          'styling' => $field->field_styling,
          'sort_order' => $field->sort_order,
          'is_active' => $field->is_active,
        ];
      })->toArray();
      $normalizedConfig['fields'] = $fields;
      $configsArray[] = [
        'config_key' => 'fields',
        'config_value' => json_encode($fields),
        'config_type' => 'json',
      ];
    }

    // Inject gallery images if present
    if ($this->relationLoaded('galleryImages') && $this->galleryImages->isNotEmpty()) {
      $images = $this->galleryImages->map(function ($image) {
        return [
          'id' => $image->id,
          'url' => $image->image_url,
          'alt' => $image->alt_text,
          'caption' => $image->caption,
          'order' => $image->sort_order,
        ];
      })->toArray();
      $normalizedConfig['images'] = $images;
      $configsArray[] = [
        'config_key' => 'images',
        'config_value' => json_encode($images),
        'config_type' => 'json',
      ];
    }

    // Inject image settings if present
    if ($this->relationLoaded('imageSettings') && $this->imageSettings) {
      $imageSettings = $this->imageSettings;
      $imageData = [
        'image' => $imageSettings->image_url,
        'altText' => $imageSettings->alt_text,
        'caption' => $imageSettings->description,
        'alignment' => $imageSettings->alignment,
        'size' => $imageSettings->width ? 'custom' : 'medium',
        'linkUrl' => $imageSettings->link_url,
        'linkType' => $imageSettings->link_type,
        'openInNewTab' => $imageSettings->open_in_new_tab,
      ];

      // Добавляем в нормализованную конфигурацию
      $normalizedConfig = array_merge($normalizedConfig, $imageData);

      // Добавляем в configs для совместимости
      foreach ($imageData as $key => $value) {
        $configsArray[] = [
          'config_key' => $key,
          'config_value' => is_bool($value) ? ($value ? '1' : '0') : (string) $value,
          'config_type' => is_bool($value) ? 'boolean' : 'string',
        ];
      }
    }

    return [
      'id' => (string) $this->id,
      'widget_id' => $this->widget_id,
      'name' => $this->name,
      'widget_slug' => $this->widget_slug,
      'position_name' => $this->position_name,
      'position_slug' => $this->position_slug,
      'order' => $this->order,
      'sort_order' => $this->sort_order,
      'is_active' => $this->is_active,
      'is_visible' => $this->is_visible,
      'wrapper_class' => $this->wrapper_class,
      'created_at' => $this->created_at,
      'updated_at' => $this->updated_at,

      // Нормализованная конфигурация
      'config' => $normalizedConfig,
      'settings' => $this->getNormalizedSettings(),

      // Конфигурации (синтетически добавляем items для меню)
      'configs' => $configsArray,

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
      'slider_slides' => $this->when(
        $this->relationLoaded('sliderSlides') && $this->sliderSlides->isNotEmpty(),
        function () {
          return SliderSlideResource::collection($this->sliderSlides)->toArray(request());
        },
        function () {
          // Если sliderSlides не загружены, берем из config
          $config = $this->getNormalizedConfig();
          return $config['slider_slides'] ?? [];
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
