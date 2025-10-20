<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizationMediaResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'file_name' => $this->file_name,
      'mime_type' => $this->mime_type,
      'size' => $this->size,
      'url' => method_exists($this, 'getUrl') ? $this->getUrl() : ($this->url ?? null),
      'created_at' => optional($this->created_at)->toISOString(),
    ];
  }
}
