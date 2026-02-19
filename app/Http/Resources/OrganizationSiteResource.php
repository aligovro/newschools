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
      'domain' => $this->whenLoaded('domain', fn () => [
        'id' => $this->domain->id,
        'domain' => $this->domain->domain,
        'custom_domain' => $this->domain->custom_domain,
        'beget_domain_id' => $this->domain->beget_domain_id,
      ]),
      'name' => $this->name,
      'slug' => $this->slug,
      'description' => $this->description ? trim(strip_tags(html_entity_decode($this->description, ENT_QUOTES | ENT_HTML5, 'UTF-8'))) : null,
      'template' => $this->template,
      'site_type' => $this->site_type,
      'status' => $this->status->value,
      'is_public' => (bool) ($this->is_public ?? false),
      'is_maintenance_mode' => (bool) ($this->is_maintenance_mode ?? false),
      'is_main_site' => $this->isMainSite(),
      'created_at' => optional($this->created_at)->toISOString(),
      'updated_at' => optional($this->updated_at)->toISOString(),
      'pages_count' => $this->when(isset($this->pages_count), $this->pages_count),
      'widgets_count' => $this->when(isset($this->widgets_count), $this->widgets_count),

      // Minimal organization info for listings and links
      'organization' => $this->whenLoaded('organization', function () {
        return [
          'id' => $this->organization->id,
          'name' => $this->organization->name,
          'slug' => $this->organization->slug,
        ];
      }),

      'pages' => $this->whenLoaded('pages', function () {
        return SitePageResource::collection($this->pages)->toArray(request());
      }),
      'widgets' => $this->whenLoaded('widgets', function () {
        return SiteWidgetResource::collection($this->widgets)->toArray(request());
      }),
    ];
  }
}
