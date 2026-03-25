<?php

namespace App\Http\Requests\SitePage;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSitePageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $siteId = $this->route('site')->id ?? null;
        $pageId = $this->route('page')->id ?? null;

        return [
            'title' => ['required', 'string', 'max:255'],
            'show_title' => ['nullable', 'boolean'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9\-]+$/',
                Rule::unique('site_pages')->where(function ($query) use ($siteId) {
                    return $query->where('site_id', $siteId);
                })->ignore($pageId)->withoutTrashed()
            ],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['nullable', 'string'],
            'template' => ['nullable', 'string', 'max:255'],
            'status' => ['required', 'string', Rule::in(['draft', 'published', 'private'])],
            'is_homepage' => ['nullable', 'boolean'],
            'is_public' => ['nullable', 'boolean'],
            'show_in_navigation' => ['nullable', 'boolean'],
            'parent_id' => [
                'nullable',
                'exists:site_pages,id',
                function ($attribute, $value, $fail) use ($pageId) {
                    if ($value && $value == $pageId) {
                        $fail('Страница не может быть родителем для самой себя.');
                    }
                }
            ],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'published_at' => ['nullable', 'date'],
            'image' => ['nullable', 'string', 'max:500'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string', 'max:500'],
            'layout_config' => ['nullable', 'array'],

            // About template
            'layout_config.about' => ['nullable', 'array'],
            'layout_config.about.mission' => ['nullable', 'array'],
            'layout_config.about.mission.title' => ['nullable', 'string', 'max:500'],
            'layout_config.about.mission.body' => ['nullable', 'string'],
            'layout_config.about.mission.image' => ['nullable', 'string', 'max:500'],
            'layout_config.about.mission.imagePosition' => ['nullable', 'in:left,right'],
            'layout_config.about.values' => ['nullable', 'array', 'max:24'],
            'layout_config.about.values.*.title' => ['nullable', 'string', 'max:255'],
            'layout_config.about.values.*.body' => ['nullable', 'string'],
            'layout_config.about.anchorNav' => ['nullable', 'array', 'max:16'],
            'layout_config.about.anchorNav.*.id' => ['nullable', 'string', 'max:64', 'regex:/^[a-z0-9\-]+$/'],
            'layout_config.about.anchorNav.*.label' => ['nullable', 'string', 'max:255'],

            // Thanks template
            'layout_config.thanks' => ['nullable', 'array'],
            'layout_config.thanks.collected_amount' => ['nullable', 'string', 'max:255'],
            'layout_config.thanks.profile_link_text' => ['nullable', 'string', 'max:500'],
            'layout_config.thanks.profile_url' => ['nullable', 'string', 'max:500'],
            'layout_config.thanks.cta_text' => ['nullable', 'string', 'max:255'],
            'layout_config.thanks.cta_url' => ['nullable', 'string', 'max:500'],
            'layout_config.thanks.requisites_url' => ['nullable', 'string', 'max:500'],

            // Contacts template
            'layout_config.contacts' => ['nullable', 'array'],
            'layout_config.contacts.docs_title' => ['nullable', 'string', 'max:255'],
            'layout_config.contacts.cards' => ['nullable', 'array', 'max:4'],
            'layout_config.contacts.cards.*.label' => ['nullable', 'string', 'max:255'],
            'layout_config.contacts.cards.*.value' => ['nullable', 'string', 'max:500'],
            'layout_config.contacts.cards.*.hours' => ['nullable', 'string', 'max:255'],
            'layout_config.contacts.cards.*.email' => ['nullable', 'string', 'max:255'],
            'layout_config.contacts.cards.*.action_text' => ['nullable', 'string', 'max:255'],
            'layout_config.contacts.cards.*.action_url' => ['nullable', 'string', 'max:500'],
            'layout_config.contacts.cards.*.action_variant' => ['nullable', 'in:primary,outline'],
            'layout_config.contacts.cards.*.map_enabled' => ['nullable', 'boolean'],
            'layout_config.contacts.cards.*.socials' => ['nullable', 'array'],
            'layout_config.contacts.documents' => ['nullable', 'array'],
            'layout_config.contacts.documents.*.name' => ['nullable', 'string', 'max:255'],
            'layout_config.contacts.documents.*.url' => ['nullable', 'string', 'max:500'],
            'layout_config.contacts.documents.*.meta' => ['nullable', 'string', 'max:255'],
            'content_blocks' => ['nullable', 'array'],
            'seo_config' => ['nullable', 'array'],
        ];
    }
}

