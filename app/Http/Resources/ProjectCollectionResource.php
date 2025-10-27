<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ProjectCollectionResource extends ResourceCollection
{
  /**
   * Преобразовать коллекцию ресурсов в массив.
   *
   * @return array<int|string, mixed>
   */
  public function toArray(Request $request): array
  {
    return [
      'data' => ProjectResource::collection($this->collection),
    ];
  }
}
