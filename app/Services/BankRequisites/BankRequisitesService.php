<?php

namespace App\Services\BankRequisites;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;
use App\Models\OrganizationSetting;
use Illuminate\Support\Facades\Cache;

/**
 * Основной сервис для работы с банковскими реквизитами
 */
class BankRequisitesService
{
    public function __construct(
        protected BankRequisitesFormatter $formatter,
        protected BankRequisitesResolver $resolver
    ) {
    }

    /**
     * Сохранить реквизиты для организации
     */
    public function saveForOrganization(Organization $organization, array $data): void
    {
        $paymentSettings = $organization->settings?->payment_settings ?? [];
        
        if ($this->hasStructuredFields($data)) {
            $paymentSettings['bank_requisites_structured'] = $this->extractStructuredFields($data);
            $paymentSettings['bank_requisites'] = $this->formatter->formatFromStructured($paymentSettings['bank_requisites_structured']);
        } else {
            $paymentSettings['bank_requisites'] = $data['bank_requisites'] ?? null;
            if (array_key_exists('logo', $data)) {
                $structured = $paymentSettings['bank_requisites_structured'] ?? [];
                $structured['logo'] = $data['logo'] ?? null;
                $paymentSettings['bank_requisites_structured'] = $structured;
            }
        }
        
        $paymentSettings['sber_card'] = $data['sber_card'] ?? null;
        $paymentSettings['tinkoff_card'] = $data['tinkoff_card'] ?? null;
        $paymentSettings['card_recipient'] = $data['card_recipient'] ?? null;

        $settingsService = app(\App\Services\Organizations\OrganizationSettingsService::class);
        $settingsService->updateSettings($organization, [
            'payment_settings' => $paymentSettings,
        ]);
    }

    /**
     * Сохранить реквизиты для проекта
     */
    public function saveForProject(Project $project, array $data): void
    {
        $paymentSettings = $project->payment_settings ?? [];
        
        // Сохраняем структурированные поля
        if ($this->hasStructuredFields($data)) {
            $paymentSettings['bank_requisites_structured'] = $this->extractStructuredFields($data);
            $paymentSettings['bank_requisites'] = $this->formatter->formatFromStructured($paymentSettings['bank_requisites_structured']);
        } else {
            $paymentSettings['bank_requisites'] = $data['bank_requisites'] ?? null;
            if (array_key_exists('logo', $data)) {
                $structured = $paymentSettings['bank_requisites_structured'] ?? [];
                $structured['logo'] = $data['logo'] ?? null;
                $paymentSettings['bank_requisites_structured'] = $structured;
            }
        }
        
        $paymentSettings['sber_card'] = $data['sber_card'] ?? null;
        $paymentSettings['tinkoff_card'] = $data['tinkoff_card'] ?? null;
        $paymentSettings['card_recipient'] = $data['card_recipient'] ?? null;

        $project->update(['payment_settings' => $paymentSettings]);
        $project->refresh();
    }

    /**
     * Сохранить реквизиты для сайта
     */
    public function saveForSite(Site $site, array $data): void
    {
        $customSettings = $site->custom_settings ?? [];
        
        // Сохраняем структурированные поля
        if ($this->hasStructuredFields($data)) {
            $customSettings['bank_requisites_structured'] = $this->extractStructuredFields($data);
            $customSettings['bank_requisites'] = $this->formatter->formatFromStructured($customSettings['bank_requisites_structured']);
        } else {
            $customSettings['bank_requisites'] = $data['bank_requisites'] ?? null;
            if (array_key_exists('logo', $data)) {
                $structured = $customSettings['bank_requisites_structured'] ?? [];
                $structured['logo'] = $data['logo'] ?? null;
                $customSettings['bank_requisites_structured'] = $structured;
            }
        }
        
        $customSettings['sber_card'] = $data['sber_card'] ?? null;
        $customSettings['tinkoff_card'] = $data['tinkoff_card'] ?? null;
        $customSettings['card_recipient'] = $data['card_recipient'] ?? null;

        $site->update(['custom_settings' => $customSettings]);
        
        Cache::forget("site_widgets_config_{$site->id}");
    }

    /**
     * Получить реквизиты с учетом иерархии
     */
    public function getRequisites(Organization $organization, ?int $projectId = null, ?int $siteId = null): ?array
    {
        return $this->resolver->resolve($organization, $projectId, $siteId);
    }

    /**
     * Проверка наличия структурированных полей в данных
     */
    protected function hasStructuredFields(array $data): bool
    {
        return !empty($data['recipient_name']) || !empty($data['account']) || !empty($data['bik']);
    }

    /**
     * Извлечь структурированные поля из данных запроса
     */
    protected function extractStructuredFields(array $data): array
    {
        return [
            'recipient_name' => $data['recipient_name'] ?? null,
            'organization_form' => $data['organization_form'] ?? null,
            'logo' => $data['logo'] ?? null,
            'bank_name' => $data['bank_name'] ?? null,
            'inn' => $data['inn'] ?? null,
            'kpp' => $data['kpp'] ?? null,
            'bik' => $data['bik'] ?? null,
            'account' => $data['account'] ?? null,
            'corr_account' => $data['corr_account'] ?? null,
            'beneficiary_name' => $data['beneficiary_name'] ?? null,
            'ogrn' => $data['ogrn'] ?? null,
            'address' => $data['address'] ?? null,
        ];
    }
}
