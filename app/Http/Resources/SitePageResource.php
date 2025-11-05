<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SitePageResource extends JsonResource
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
            'site_id' => $this->site_id,
            'parent_id' => $this->parent_id,
            'title' => $this->title ?? '',
            'slug' => $this->slug ?? '',
            'excerpt' => $this->excerpt ?? '',
            'content' => $this->content ?? '',
            'template' => $this->template ?? 'default',
            'status' => $this->status instanceof \BackedEnum ? $this->status->value : ($this->status ?? 'draft'),
            'is_homepage' => (bool) ($this->is_homepage ?? false),
            'is_public' => (bool) ($this->is_public ?? false),
            'show_in_navigation' => (bool) ($this->show_in_navigation ?? true),
            'sort_order' => $this->sort_order ?? 0,
            'image' => $this->image ?? null,
            'images' => $this->images ?? [],
            'layout_config' => $this->layout_config ?? [],
            'content_blocks' => $this->content_blocks ?? [],
            'seo_config' => $this->seo_config ?? [],
            'published_at' => $this->published_at ? $this->published_at->toISOString() : null,
            'last_updated_at' => $this->last_updated_at ? $this->last_updated_at->toISOString() : null,
            'created_at' => $this->created_at ? $this->created_at->toISOString() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toISOString() : null,

            // Relations
            'parent' => $this->whenLoaded('parent', function () {
                return [
                    'id' => $this->parent->id,
                    'title' => $this->parent->title,
                    'slug' => $this->parent->slug,
                ];
            }),
            'children' => $this->whenLoaded('children', function () {
                return $this->children->map(fn ($child) => [
                    'id' => $child->id,
                    'title' => $child->title,
                    'slug' => $child->slug,
                    'sort_order' => $child->sort_order,
                ]);
            }),
            'site' => $this->whenLoaded('site', function () {
                return [
                    'id' => $this->site->id,
                    'name' => $this->site->name,
                    'slug' => $this->site->slug,
                ];
            }),
        ];
    }
}
