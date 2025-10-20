<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationSliderResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'type' => $this->type,
      'position' => $this->position,
      'settings' => $this->settings ?? [],
      'is_active' => (bool) $this->is_active,
      'sort_order' => $this->sort_order,
      'display_conditions' => $this->display_conditions ?? [],
      'slides' => $this->whenLoaded('slides', function () {
        return OrganizationSliderSlideResource::collection($this->slides)->toArray(request());
      }),
    ];
  }
}
