<?php

namespace App\Support;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class InertiaResource
{
    /**
     * Convert a single JsonResource to a plain array for Inertia props.
     */
    public static function item(JsonResource $resource, ?Request $request = null): array
    {
        $req = $request ?? request();
        return $resource->toArray($req);
    }

    /**
     * Convert a collection (array|Collection) of models to a plain array using given Resource class.
     *
     * @param iterable $items
     * @param class-string<JsonResource> $resourceClass
     */
    public static function list(iterable $items, string $resourceClass, ?Request $request = null): array
    {
        $req = $request ?? request();
        $collection = $items instanceof Collection ? $items : collect($items);
        return $collection->map(fn($item) => (new $resourceClass($item))->toArray($req))->all();
    }

    /**
     * Convert a paginator to array while preserving meta/links using given Resource class.
     *
     * @param class-string<JsonResource> $resourceClass
     */
    public static function paginate(LengthAwarePaginator $paginator, string $resourceClass): array
    {
        /** @var AnonymousResourceCollection $resourceCollection */
        $resourceCollection = $resourceClass::collection($paginator);
        // Use the underlying JSON response builder to include data + meta + links
        return $resourceCollection->response()->getData(true);
    }
}
