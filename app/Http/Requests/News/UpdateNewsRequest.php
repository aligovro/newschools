<?php

namespace App\Http\Requests\News;

use App\Enums\NewsStatus;
use App\Enums\NewsVisibility;
use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organization_id' => 'sometimes|integer|exists:organizations,id',
            'title' => 'sometimes|required|string|max:255',
            'subtitle' => 'sometimes|nullable|string|max:255',
            'slug' => 'sometimes|nullable|string|max:255',
            'excerpt' => 'sometimes|nullable|string|max:500',
            'content' => 'sometimes|nullable|string',
            'image' => 'sometimes|nullable|string|max:500',
            'gallery' => 'sometimes|nullable|array|max:20',
            'gallery.*' => 'string|max:500',
            'status' => ['sometimes', 'string', Rule::in(NewsStatus::values())],
            'type' => 'sometimes|nullable|string|max:32',
            'visibility' => ['sometimes', 'string', Rule::in(NewsVisibility::values())],
            'is_featured' => 'sometimes|boolean',
            'tags' => 'sometimes|nullable|array|max:25',
            'tags.*' => 'string|max:50',
            'starts_at' => 'sometimes|nullable|date',
            'ends_at' => 'sometimes|nullable|date|after_or_equal:starts_at',
            'timezone' => 'sometimes|nullable|string|max:64',
            'location' => 'sometimes|nullable|array',
            'location.name' => 'sometimes|nullable|string|max:255',
            'location.address' => 'sometimes|nullable|string|max:500',
            'location.latitude' => 'sometimes|nullable|numeric|between:-90,90',
            'location.longitude' => 'sometimes|nullable|numeric|between:-180,180',
            'registration' => 'sometimes|nullable|array',
            'registration.url' => 'sometimes|nullable|url|max:500',
            'registration.required' => 'sometimes|nullable|boolean',
            'seo_settings' => 'sometimes|nullable|array',
            'metadata' => 'sometimes|nullable|array',
            'target' => 'sometimes|nullable|array',
            'target.type' => 'required_with:target|string|in:organization,project,site',
            'target.id' => 'required_with:target|integer|min:1',
            'is_main_site' => 'sometimes|boolean',
        ];
    }

    public function validatedPayload(): array
    {
        $data = $this->validated();

        if (array_key_exists('location', $data)) {
            $data['location_name'] = data_get($data, 'location.name');
            $data['location_address'] = data_get($data, 'location.address');
            $data['location_latitude'] = data_get($data, 'location.latitude');
            $data['location_longitude'] = data_get($data, 'location.longitude');
            unset($data['location']);
        }

        if (array_key_exists('registration', $data)) {
            $data['registration_url'] = data_get($data, 'registration.url');
            $data['registration_required'] = data_get($data, 'registration.required', false);
            unset($data['registration']);
        }

        if (array_key_exists('gallery', $data) && is_array($data['gallery'])) {
            $data['gallery'] = array_values(array_filter($data['gallery'], fn ($item) => filled($item)));
        }

        if (array_key_exists('is_main_site', $data)) {
            $data['is_main_site'] = (bool) $data['is_main_site'];
            if ($data['is_main_site']) {
                $data['organization_id'] = null;
            }
        }

        return $data;
    }

    public function newsable(): ?array
    {
        $target = $this->input('target');
        if (!$target || !is_array($target)) {
            return null;
        }

        $type = $target['type'] ?? null;
        $id = $target['id'] ?? null;

        if (!$type || !$id) {
            return null;
        }

        $map = [
            'organization' => Organization::class,
            'project' => Project::class,
            'site' => Site::class,
        ];

        if (!array_key_exists($type, $map)) {
            return null;
        }

        return [
            'type' => $map[$type],
            'id' => (int) $id,
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $isMainSite = $this->boolean('is_main_site');
            $target = $this->input('target');

            if ($isMainSite) {
                if (!$target || !is_array($target)) {
                    $validator->errors()->add('target', 'Укажите главный сайт для привязки.');
                    return;
                }

                if (($target['type'] ?? null) !== 'site') {
                    $validator->errors()->add('target.type', 'Главный сайт доступен только для привязки к сайту.');
                    return;
                }
            }

            if (!$target) {
                return;
            }

            $type = $target['type'] ?? null;
            $id = $target['id'] ?? null;

            if (!$type || !$id) {
                $validator->errors()->add('target', 'Необходимо выбрать сущность для привязки.');
                return;
            }

            $exists = match ($type) {
                'organization' => Organization::whereKey($id)->exists(),
                'project' => Project::whereKey($id)->exists(),
                'site' => Site::whereKey($id)->exists(),
                default => false,
            };

            if (!$exists) {
                $validator->errors()->add('target.id', 'Выбранная сущность не найдена или недоступна.');
            }
        });
    }
}

