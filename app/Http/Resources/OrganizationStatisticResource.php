<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationStatisticResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id ?? null,
      'unique_visitors' => (int) ($this->unique_visitors ?? 0),
      'views' => (int) ($this->views ?? 0),
      'donations_total' => (float) ($this->donations_total ?? 0),
      'created_at' => optional($this->created_at)->toISOString(),
    ];
  }
}
