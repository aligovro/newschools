<?php

namespace App\Services\BankRequisites;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;

/**
 * Сервис для разрешения банковских реквизитов с учетом иерархии
 * Приоритет: проект > сайт > организация
 */
class BankRequisitesResolver
{
    public function __construct(
        protected BankRequisitesFormatter $formatter
    ) {
    }

    /**
     * Собрать данные банковских реквизитов из проекта, сайта или организации.
     * Приоритет: проект > сайт > организация
     */
    public function resolve(Organization $organization, ?int $projectId = null, ?int $siteId = null): ?array
    {
        $requisites = null;
        $structuredRequisites = null;
        $sberCard = null;
        $tinkoffCard = null;
        $cardRecipient = null;

        // 1. Проверяем реквизиты проекта (если указан projectId)
        if ($projectId) {
            $project = Project::where('organization_id', $organization->id)->find($projectId);
            if ($project && is_array($project->payment_settings)) {
                $ps = $project->payment_settings;
                $structuredRequisites = $structuredRequisites ?: ($ps['bank_requisites_structured'] ?? null);
                $requisites = $requisites ?: ($ps['bank_requisites'] ?? null);
                $sberCard = $sberCard ?: ($ps['sber_card'] ?? null);
                $tinkoffCard = $tinkoffCard ?: ($ps['tinkoff_card'] ?? null);
                $cardRecipient = $cardRecipient ?: ($ps['card_recipient'] ?? null);
            }
        }

        // 2. Проверяем реквизиты сайта организации (если указан siteId или берем первый)
        if ($siteId) {
            $site = Site::where('organization_id', $organization->id)->find($siteId);
        } else {
            $site = Site::where('organization_id', $organization->id)->first();
        }
        
        if ($site && is_array($site->custom_settings)) {
            $cs = $site->custom_settings;
            $structuredRequisites = $structuredRequisites ?: ($cs['bank_requisites_structured'] ?? null);
            $requisites = $requisites ?: ($cs['bank_requisites'] ?? null);
            $sberCard = $sberCard ?: ($cs['sber_card'] ?? null);
            $tinkoffCard = $tinkoffCard ?: ($cs['tinkoff_card'] ?? null);
            $cardRecipient = $cardRecipient ?: ($cs['card_recipient'] ?? null);
        }

        // 3. Проверяем реквизиты организации (fallback)
        $orgSettings = $organization->settings;
        if ($orgSettings && is_array($orgSettings->payment_settings)) {
            $ops = $orgSettings->payment_settings;
            $structuredRequisites = $structuredRequisites ?: ($ops['bank_requisites_structured'] ?? null);
            $requisites = $requisites ?: ($ops['bank_requisites'] ?? null);
            $sberCard = $sberCard ?: ($ops['sber_card'] ?? null);
            $tinkoffCard = $tinkoffCard ?: ($ops['tinkoff_card'] ?? null);
            $cardRecipient = $cardRecipient ?: ($ops['card_recipient'] ?? null);
        }

        // Если есть структурированные данные, формируем текст из них
        if ($structuredRequisites && is_array($structuredRequisites)) {
            $requisites = $this->formatter->formatFromStructured($structuredRequisites);
        }

        $hasRequisites = ! empty($requisites);
        $hasCards = ! empty($sberCard) || ! empty($tinkoffCard);

        if (! $hasRequisites && ! $hasCards) {
            return null;
        }

        $result = [];

        if ($hasRequisites) {
            $result['text'] = is_array($requisites)
                ? ($requisites['text_reqs'] ?? implode("\n", array_filter($requisites)))
                : (string) $requisites;
        }

        if (! empty($sberCard)) {
            $result['sber_card'] = $sberCard;
        }
        if (! empty($tinkoffCard)) {
            $result['tinkoff_card'] = $tinkoffCard;
        }
        if (! empty($cardRecipient)) {
            $result['card_recipient'] = $cardRecipient;
        }

        return $result;
    }
}
