<?php

namespace App\Http\Requests\SitePage;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSitePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $siteId = $this->route('site')->id ?? null;

        return [
            'title' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9\-]+$/',
                Rule::unique('site_pages')->where(function ($query) use ($siteId) {
                    return $query->where('site_id', $siteId);
                })
            ],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'template' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in(['draft', 'published', 'private'])],
            'is_homepage' => ['nullable', 'boolean'],
            'is_public' => ['nullable', 'boolean'],
            'show_in_navigation' => ['nullable', 'boolean'],
            'parent_id' => ['nullable', 'exists:site_pages,id'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'published_at' => ['nullable', 'date'],
            'image' => ['nullable', 'string', 'max:500'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string', 'max:500'],
            'layout_config' => ['nullable', 'array'],
            'content_blocks' => ['nullable', 'array'],
            'seo_config' => ['nullable', 'array'],
        ];
    }
}

