<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegionStatResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    // Works with aggregate rows (stdClass/array)
    $row = is_array($this->resource) ? (object) $this->resource : $this->resource;
    return [
      'name' => $row->region_name ?? $row->name ?? '',
      'total_amount' => (float) ($row->total_amount ?? 0),
      'organizations_count' => (int) ($row->organizations_count ?? 0),
    ];
  }
}
