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
            'logo' => $this->normalizeLogoPath($this->logo),
            'images' => $this->images ?? [],
            'address' => $this->address,
            'phone' => $this->phone,
            'email' => $this->email,
            'website' => $this->website,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'needs' => $this->needs,
            'created_at' => optional($this->created_at)->toISOString(),
            'updated_at' => optional($this->updated_at)->toISOString(),

            // Aggregates when available
            'members_count' => $this->when(isset($this->members_count), $this->members_count ?? 0),
            'donations_count' => $this->when(isset($this->donations_count), $this->donations_count ?? 0),
            'donations_sum' => $this->when(isset($this->donations_sum_amount), is_numeric($this->donations_sum_amount) ? (float) $this->donations_sum_amount : null),

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
                $total = (float) $this->projects->sum('target_amount');
                return $total > 0 ? $total : null;
            }),
            'donations_collected' => $this->whenLoaded('projects', function () {
                $collected = (float) $this->projects->sum('collected_amount');
                return $collected > 0 ? $collected : null;
            }),

            // Staff relations
            'director' => $this->when(
                $this->relationLoaded('director') && !is_null($this->director),
                function () {
                    return (new OrganizationStaffResource($this->director))->toArray(request());
                }
            ),
            'staff' => $this->whenLoaded('staff', function () {
                return $this->staff && $this->staff->isNotEmpty()
                    ? OrganizationStaffResource::collection($this->staff)->resolve()
                    : [];
            }),

            // Users relation with pivot data
            'users' => $this->whenLoaded('users', function () {
                return $this->users->map(fn($user) => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'pivot' => [
                        'role' => $user->pivot->role ?? null,
                        'status' => $user->pivot->status ?? null,
                    ],
                ]);
            }),

            // Admin user (first user with organization_admin role)
            'admin_user' => $this->whenLoaded('users', function () {
                if (!$this->users || $this->users->isEmpty()) {
                    return null;
                }
                $adminUser = $this->users->first(function ($user) {
                    return isset($user->pivot) && $user->pivot->role === 'organization_admin';
                });
                if (!$adminUser) {
                    return null;
                }
                return [
                    'id' => $adminUser->id,
                    'name' => $adminUser->name,
                    'email' => $adminUser->email,
                ];
            }, null),

            'admin_user_id' => $this->whenLoaded('users', function () {
                if (!$this->users || $this->users->isEmpty()) {
                    return null;
                }
                $adminUser = $this->users->first(function ($user) {
                    return isset($user->pivot) && $user->pivot->role === 'organization_admin';
                });
                return $adminUser ? $adminUser->id : null;
            }, null),

            // Site relations
            'primary_site' => $this->whenLoaded('primarySite', function () {
                return $this->primarySite ? [
                    'id' => $this->primarySite->id,
                ] : null;
            }, function () {
                // Если primarySite не загружен, но sites загружены, берем первый
                if ($this->relationLoaded('sites') && $this->sites && $this->sites->isNotEmpty()) {
                    return [
                        'id' => $this->sites->first()->id,
                    ];
                }
                return null;
            }),
            'sites' => $this->whenLoaded('sites', function () {
                return $this->sites ? $this->sites->map(fn($site) => [
                    'id' => $site->id,
                ])->toArray() : [];
            }, []),
        ];
    }

    /**
     * Нормализует путь к логотипу: всегда возвращает /storage/... или null
     * Если логотип - внешний URL (http/https), возвращает как есть
     */
    private function normalizeLogoPath(?string $logo): ?string
    {
        if (empty($logo)) {
            return null;
        }

        // Если это внешний URL - возвращаем как есть
        if (str_starts_with($logo, 'http://') || str_starts_with($logo, 'https://')) {
            return $logo;
        }

        // Если уже начинается с /storage/ - возвращаем как есть
        if (str_starts_with($logo, '/storage/')) {
            return $logo;
        }

        // Убираем ведущие слеши и storage/ если есть
        $logo = ltrim($logo, '/');
        if (str_starts_with($logo, 'storage/')) {
            $logo = substr($logo, 8); // убираем 'storage/'
        }

        // Возвращаем нормализованный путь
        return '/storage/' . ltrim($logo, '/');
    }
}
