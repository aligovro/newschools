<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationSiteResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'domain_id' => $this->domain_id ?? null,
      'name' => $this->name,
      'slug' => $this->slug,
      'description' => $this->description,
      'template' => $this->template,
      'status' => $this->status,
      'is_public' => (bool) ($this->is_public ?? false),
      'is_maintenance_mode' => (bool) ($this->is_maintenance_mode ?? false),
      'created_at' => optional($this->created_at)->toISOString(),
      'updated_at' => optional($this->updated_at)->toISOString(),
      'pages_count' => $this->when(isset($this->pages_count), $this->pages_count),

      'pages' => $this->whenLoaded('pages', function () {
        return OrganizationPageResource::collection($this->pages)->toArray(request());
      }),
      'widgets' => $this->whenLoaded('widgets', function () {
        return SiteWidgetResource::collection($this->widgets)->toArray(request());
      }),
    ];
  }
}
