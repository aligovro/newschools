<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationMenuResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'location' => $this->location ?? null,
      'items' => $this->whenLoaded('items', function () {
        return $this->items->map(function ($item) {
          return [
            'id' => $item->id,
            'title' => $item->title,
            'url' => $item->url,
            'type' => $item->type,
            'open_in_new_tab' => (bool) $item->open_in_new_tab,
            'sort_order' => $item->sort_order,
            'children' => $item->relationLoaded('children') ? $item->children->map(function ($child) {
              return [
                'id' => $child->id,
                'title' => $child->title,
                'url' => $child->url,
                'type' => $child->type,
                'open_in_new_tab' => (bool) $child->open_in_new_tab,
                'sort_order' => $child->sort_order,
              ];
            }) : [],
          ];
        });
      }),
    ];
  }
}
