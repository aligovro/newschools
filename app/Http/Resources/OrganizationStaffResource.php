<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationStaffResource extends JsonResource
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
      'last_name' => $this->last_name,
      'first_name' => $this->first_name,
      'middle_name' => $this->middle_name,
      'full_name' => $this->full_name,
      'position' => $this->position,
      'is_director' => $this->is_director,
      'photo' => $this->photo_url,
      'address' => $this->address,
      'email' => $this->email,
      'created_at' => optional($this->created_at)->toISOString(),
      'updated_at' => optional($this->updated_at)->toISOString(),
    ];
  }
}
