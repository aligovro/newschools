<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\OrganizationSlider;
use App\Models\OrganizationNews;
use App\Models\OrganizationProject;
use App\Models\Member;
use App\Models\Donation;

class SliderService
{
    /**
     * Получить слайдеры организации для публичного отображения
     */
    public function getPublicSliders(Organization $organization, ?string $position = null): array
    {
        $query = $organization->activeSliders()
            ->with(['activeSlides' => function ($query) {
                $query->visible()->orderBy('sort_order');
            }]);

        if ($position) {
            $query->byPosition($position);
        }

        $sliders = $query->orderBy('sort_order')->get();

        return $sliders->map(function ($slider) {
            return $this->processSlider($slider);
        })->toArray();
    }

    /**
     * Обработать слайдер и его слайды
     */
    protected function processSlider(OrganizationSlider $slider): array
    {
        $processedSlides = $slider->activeSlides->map(function ($slide) use ($slider) {
            return $this->processSlide($slide, $slider);
        });

        return [
            'id' => $slider->id,
            'name' => $slider->name,
            'type' => $slider->type,
            'position' => $slider->position,
            'settings' => $slider->merged_settings,
            'slides' => $processedSlides->toArray(),
        ];
    }

    /**
     * Обработать слайд
     */
    protected function processSlide($slide, OrganizationSlider $slider): array
    {
        $processedSlide = [
            'id' => $slide->id,
            'title' => $slide->title,
            'subtitle' => $slide->subtitle,
            'description' => $slide->description,
            'image_url' => $slide->image_url,
            'background_image_url' => $slide->background_image_url,
            'button_text' => $slide->button_text,
            'button_url' => $slide->button_url,
            'button_style' => $slide->button_style,
            'is_visible' => $slide->is_visible,
        ];

        // Если это контентный слайдер, загружаем данные из БД
        if ($slider->type === 'content' && $slide->content_type) {
            $processedSlide['content_data'] = $this->loadContentData($slide->content_type, $slide->content_data);
        }

        return $processedSlide;
    }

    /**
     * Загрузить данные контента для контентного слайдера
     */
    protected function loadContentData(string $contentType, ?array $contentData = null): array
    {
        $limit = $contentData['limit'] ?? 10;
        $orderBy = $contentData['order_by'] ?? 'created_at';
        $orderDirection = $contentData['order_direction'] ?? 'desc';

        switch ($contentType) {
            case 'news':
                return OrganizationNews::published()
                    ->orderBy($orderBy, $orderDirection)
                    ->limit($limit)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'description' => $item->excerpt,
                            'image_url' => $item->featured_image ? asset('storage/' . $item->featured_image) : null,
                            'url' => route('organization.news.show', $item->id),
                            'date' => $item->published_at?->format('d.m.Y'),
                        ];
                    })->toArray();

            case 'projects':
                return OrganizationProject::where('status', 'active')
                    ->orderBy($orderBy, $orderDirection)
                    ->limit($limit)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->title,
                            'description' => $item->description,
                            'image_url' => $item->image ? asset('storage/' . $item->image) : null,
                            'url' => route('organization.projects.show', $item->id),
                            'amount' => $item->target_amount,
                            'raised' => $item->raised_amount,
                        ];
                    })->toArray();

            case 'members':
                return Member::where('is_public', true)
                    ->orderBy($orderBy, $orderDirection)
                    ->limit($limit)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->name,
                            'description' => $item->position,
                            'image_url' => $item->avatar ? asset('storage/' . $item->avatar) : null,
                            'url' => route('organization.members.show', $item->id),
                        ];
                    })->toArray();

            case 'donations':
                return Donation::where('status', 'completed')
                    ->orderBy($orderBy, $orderDirection)
                    ->limit($limit)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'id' => $item->id,
                            'title' => $item->member?->name ?? 'Анонимное пожертвование',
                            'description' => 'Пожертвование',
                            'amount' => $item->amount / 100,
                            'date' => $item->created_at->format('d.m.Y'),
                        ];
                    })->toArray();

            default:
                return [];
        }
    }

    /**
     * Получить слайдеры для конкретной позиции
     */
    public function getSlidersByPosition(Organization $organization, string $position): array
    {
        return $this->getPublicSliders($organization, $position);
    }

    /**
     * Получить все активные слайдеры организации
     */
    public function getAllSliders(Organization $organization): array
    {
        return $this->getPublicSliders($organization);
    }
}
