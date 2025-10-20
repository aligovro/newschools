<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationMenuItemResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'title' => $this->title,
      'url' => $this->url,
      'type' => $this->type,
      'open_in_new_tab' => (bool) $this->open_in_new_tab,
      'sort_order' => $this->sort_order,
      'children' => $this->whenLoaded('children', function () {
        return OrganizationMenuItemResource::collection($this->children)->toArray(request());
      }),
    ];
  }
}
