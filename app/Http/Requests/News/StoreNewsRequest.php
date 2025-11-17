<?php

namespace App\Http\Requests\News;

use App\Enums\NewsStatus;
use App\Enums\NewsVisibility;
use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;
use App\Models\SiteWidget;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreNewsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organization_id' => 'nullable|integer|exists:organizations,id',
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'slug' => 'nullable|string|max:255',
            'excerpt' => 'nullable|string|max:500',
            'content' => 'nullable|string',
            'image' => 'nullable|string|max:500',
            'gallery' => 'nullable|array|max:20',
            'gallery.*' => 'string|max:500',
            'status' => ['nullable', 'string', Rule::in(NewsStatus::values())],
            'type' => 'nullable|string|max:32',
            'visibility' => ['nullable', 'string', Rule::in(NewsVisibility::values())],
            'is_featured' => 'nullable|boolean',
            'tags' => 'nullable|array|max:25',
            'tags.*' => 'string|max:50',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'timezone' => 'nullable|string|max:64',
            'location' => 'nullable|array',
            'location.name' => 'nullable|string|max:255',
            'location.address' => 'nullable|string|max:500',
            'location.latitude' => 'nullable|numeric|between:-90,90',
            'location.longitude' => 'nullable|numeric|between:-180,180',
            'registration' => 'nullable|array',
            'registration.url' => 'nullable|url|max:500',
            'registration.required' => 'nullable|boolean',
            'seo_settings' => 'nullable|array',
            'metadata' => 'nullable|array',
            'target' => 'nullable|array',
            'target.type' => 'required_with:target|string|in:organization,project,site',
            'target.id' => 'required_with:target|integer|min:1',
            'is_main_site' => 'nullable|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => 'Введите заголовок материала',
            'ends_at.after_or_equal' => 'Дата окончания должна быть позже даты начала',
            'target.type.in' => 'Неверный тип привязки',
        ];
    }

    public function validatedPayload(): array
    {
        $data = $this->validated();

        $data['location_name'] = data_get($data, 'location.name');
        $data['location_address'] = data_get($data, 'location.address');
        $data['location_latitude'] = data_get($data, 'location.latitude');
        $data['location_longitude'] = data_get($data, 'location.longitude');

        unset($data['location']);

        $data['registration_url'] = data_get($data, 'registration.url');
        $data['registration_required'] = data_get($data, 'registration.required', false);
        unset($data['registration']);

        $data['is_main_site'] = (bool) ($data['is_main_site'] ?? false);

        if ($data['is_main_site']) {
            $data['organization_id'] = null;
        }

        if (!empty($data['image'])) {
            $data['image'] = SiteWidget::extractImagePathFromUrl($data['image']);
        }

        if (!empty($data['gallery'])) {
            $data['gallery'] = array_values(
                array_filter(
                    array_map(
                        static fn($item) => SiteWidget::extractImagePathFromUrl((string) $item),
                        $data['gallery']
                    ),
                    fn($item) => filled($item)
                )
            );
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
