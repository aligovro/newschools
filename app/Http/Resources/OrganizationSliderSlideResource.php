<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationSliderSlideResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'title' => $this->title,
      'subtitle' => $this->subtitle,
      'description' => $this->description,
      'image' => $this->image ? '/storage/' . ltrim($this->image, '/') : null,
      'background_image' => $this->background_image ? '/storage/' . ltrim($this->background_image, '/') : null,
      'button_text' => $this->button_text,
      'button_url' => $this->button_url,
      'button_style' => $this->button_style,
      'content_type' => $this->content_type,
      'content_data' => $this->content_data ?? [],
      'is_active' => (bool) $this->is_active,
      'sort_order' => $this->sort_order,
      'display_from' => optional($this->display_from)->toISOString(),
      'display_until' => optional($this->display_until)->toISOString(),
    ];
  }
}
