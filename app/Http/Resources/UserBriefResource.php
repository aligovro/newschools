<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserBriefResource extends JsonResource
{
  /**
   * @return array<string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'email' => $this->email,
      'role' => $this->whenLoaded('roles', function () {
        return optional($this->roles->first())->name ?? 'user';
      }),
      'created_at' => optional($this->created_at)->toISOString(),
    ];
  }
}
