<?php

namespace App\Http\Requests\Site;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\SiteStatus;

class UpdateSiteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $siteId = $this->route('site')?->id ?? null;
        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('sites', 'slug')->ignore($siteId)],
            'description' => ['nullable', 'string', 'max:1000'],
            'template' => ['required', 'string', 'exists:site_templates,slug'],
            'status' => ['required', 'string', Rule::in(array_column(SiteStatus::cases(), 'value'))],
            'is_public' => ['boolean'],
            'is_maintenance_mode' => ['boolean'],
        ];
    }
}
