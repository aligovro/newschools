<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
      'created_at' => optional($this->created_at)->toISOString(),
      'updated_at' => optional($this->updated_at)->toISOString(),
      'roles' => $this->whenLoaded('roles', function () {
        return $this->roles->map(fn($r) => ['id' => $r->id, 'name' => $r->name]);
      }),
      'permissions' => $this->whenLoaded('permissions', function () {
        return $this->permissions->map(fn($p) => ['id' => $p->id, 'name' => $p->name]);
      }),
    ];
  }
}
