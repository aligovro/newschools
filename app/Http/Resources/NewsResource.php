<?php

namespace App\Http\Resources;

use App\Enums\NewsStatus;
use App\Enums\NewsVisibility;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
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
            'organization_id' => $this->organization_id,
            'newsable_type' => $this->newsable_type,
            'newsable_id' => $this->newsable_id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,

            'image' => $this->imageUrl,
            'gallery' => $this->gallery ?? [],

            'status' => $this->status?->value ?? NewsStatus::Draft->value,
            'status_label' => $this->status?->label(),
            'type' => $this->type,
            'visibility' => $this->visibility?->value ?? NewsVisibility::Public->value,
            'visibility_label' => $this->visibility?->label(),
            'is_featured' => (bool) $this->is_featured,
            'tags' => $this->tags ?? [],

            'starts_at' => $this->starts_at?->toISOString(),
            'ends_at' => $this->ends_at?->toISOString(),
            'timezone' => $this->timezone,

            'location' => [
                'name' => $this->location_name,
                'address' => $this->location_address,
                'latitude' => $this->location_latitude,
                'longitude' => $this->location_longitude,
            ],

            'registration_url' => $this->registration_url,
            'registration_required' => (bool) $this->registration_required,

            'seo_settings' => $this->seo_settings ?? [],
            'metadata' => $this->metadata ?? [],

            'published_at' => $this->published_at?->toISOString(),
            'views_count' => $this->views_count,

            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'deleted_at' => $this->deleted_at?->toISOString(),

            'organization' => $this->whenLoaded('organization', function () {
                return [
                    'id' => $this->organization->id,
                    'name' => $this->organization->name,
                    'slug' => $this->organization->slug,
                ];
            }),

            'target' => $this->whenLoaded('newsable', function () {
                if (!$this->newsable) {
                    return null;
                }

                return [
                    'type' => $this->newsable_type,
                    'id' => $this->newsable->id,
                    'name' => $this->newsable->name ?? $this->newsable->title ?? null,
                    'slug' => $this->newsable->slug ?? null,
                ];
            }),
        ];
    }
}

