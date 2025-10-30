<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'slug' => $this->slug,
      'description' => $this->description,
      'type' => $this->type,
      'status' => $this->status,
      'is_public' => (bool) $this->is_public,
      'logo' => $this->logo,
      'images' => $this->images ?? [],
      'address' => $this->address,
      'phone' => $this->phone,
      'email' => $this->email,
      'website' => $this->website,
      'admin_user_id' => $this->admin_user_id,
      'latitude' => $this->latitude,
      'longitude' => $this->longitude,
      'created_at' => optional($this->created_at)->toISOString(),
      'updated_at' => optional($this->updated_at)->toISOString(),

      // Aggregates when available
      'members_count' => $this->when(isset($this->members_count), $this->members_count),
      'donations_count' => $this->when(isset($this->donations_count), $this->donations_count),
      'donations_sum' => $this->when(isset($this->donations_sum_amount), $this->donations_sum_amount),

      // Relations (minified)
      'region' => $this->whenLoaded('region', function () {
        return [
          'id' => $this->region->id,
          'name' => $this->region->name,
          'latitude' => $this->region->latitude,
          'longitude' => $this->region->longitude,
        ];
      }),
      'city' => $this->whenLoaded('city', function () {
        return [
          'id' => $this->city->id,
          'name' => $this->city->name,
          'latitude' => $this->city->latitude,
          'longitude' => $this->city->longitude,
        ];
      }),
      'settlement' => $this->whenLoaded('settlement', function () {
        return [
          'id' => $this->settlement->id,
          'name' => $this->settlement->name,
        ];
      }),

      // Project-related aggregates for Home page cards
      'projects_count' => $this->whenLoaded('projects', function () {
        return $this->projects->count();
      }),
      'donations_total' => $this->whenLoaded('projects', function () {
        return (float) $this->projects->sum('target_amount');
      }),
      'donations_collected' => $this->whenLoaded('projects', function () {
        return (float) $this->projects->sum('collected_amount');
      }),
    ];
  }
}
