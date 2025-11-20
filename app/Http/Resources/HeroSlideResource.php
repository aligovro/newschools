<?php

namespace App\Http\Resources;

use App\Models\SiteWidget;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HeroSlideResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'title' => $this->title,
            'subtitle' => $this->subtitle,
            'description' => $this->description,
            'buttonText' => $this->button_text,
            'buttonLink' => $this->button_link,
            'buttonLinkType' => $this->button_link_type,
            'buttonOpenInNewTab' => $this->button_open_in_new_tab,
            'backgroundImage' => SiteWidget::formatImageUrl($this->background_image ?? ''),
            'overlayColor' => $this->overlay_color,
            'overlayOpacity' => $this->overlay_opacity,
            'overlayGradient' => $this->overlay_gradient,
            'overlayGradientIntensity' => $this->overlay_gradient_intensity,
            'sortOrder' => $this->sort_order,
            'isActive' => $this->is_active,
        ];
    }
}
