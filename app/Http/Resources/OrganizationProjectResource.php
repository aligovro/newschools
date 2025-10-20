<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationProjectResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    $target = (float) ($this->target_amount ?? 0);
    $collected = (float) ($this->collected_amount ?? 0);
    $progress = $target > 0 ? round(($collected / $target) * 100, 1) : 0;

    return [
      'id' => $this->id,
      'title' => $this->title,
      'description' => $this->description,
      'target_amount' => $target,
      'collected_amount' => $collected,
      'progress_percentage' => $progress,
      'image' => $this->image_url,
      'organization' => $this->whenLoaded('organization', function () {
        return [
          'id' => $this->organization->id,
          'name' => $this->organization->name,
          'address' => $this->organization->address,
        ];
      }),
    ];
  }
}
