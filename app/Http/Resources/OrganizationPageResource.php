<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationPageResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'title' => $this->title,
      'slug' => $this->slug,
      'content' => $this->content,
      'is_published' => (bool) $this->is_published,
      'created_at' => optional($this->created_at)->toISOString(),
      'updated_at' => optional($this->updated_at)->toISOString(),
      'seo' => $this->whenLoaded('seo', function () {
        return [
          'title' => $this->seo->title,
          'description' => $this->seo->description,
          'keywords' => $this->seo->keywords,
        ];
      }),
    ];
  }
}
