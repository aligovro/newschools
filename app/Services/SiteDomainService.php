<?php

namespace App\Services;

use App\Models\Domain;
use App\Models\Site;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

/**
 * Управление доменом сайта: кастомный домен (поддомен и т.п.) без Beget API.
 * Используется в дашборде и в команде site:bind-custom-domain.
 */
class SiteDomainService
{
    /**
     * Установить или обновить кастомный домен для сайта.
     * Сайт должен принадлежать организации; при отсутствии домена создаётся запись.
     *
     * @throws ValidationException
     */
    public function setCustomDomain(Site $site, string $fqdn): Domain
    {
        $fqdn = strtolower(trim($fqdn));
        $this->validateFqdn($fqdn);

        $domain = $site->domain;

        if ($domain) {
            $previous = $domain->custom_domain ?: $domain->domain;
            $domain->update([
                'custom_domain' => $fqdn,
                'status' => 'active',
            ]);
            if ($previous) {
                Cache::forget('site_by_domain_' . $previous);
            }
        } else {
            $domain = Domain::create([
                'organization_id' => $site->organization_id,
                'domain' => $fqdn,
                'custom_domain' => $fqdn,
                'is_primary' => false,
                'is_ssl_enabled' => true,
                'status' => 'active',
            ]);
            $site->update(['domain_id' => $domain->id]);
        }

        Cache::forget('site_by_domain_' . $fqdn);

        return $domain->fresh();
    }

    /**
     * Очистить кастомный домен (оставить только основной domain, если есть).
     */
    public function clearCustomDomain(Site $site): void
    {
        $domain = $site->domain;
        if (! $domain) {
            return;
        }
        $previous = $domain->custom_domain;
        if ($previous) {
            Cache::forget('site_by_domain_' . $previous);
        }
        $domain->update(['custom_domain' => null]);
    }

    private function validateFqdn(string $fqdn): void
    {
        $maxLength = 253;
        if (strlen($fqdn) > $maxLength) {
            throw ValidationException::withMessages([
                'custom_domain' => [__('validation.max.string', ['attribute' => 'домен', 'max' => $maxLength])],
            ]);
        }
        $pattern = '/^([a-z0-9]([a-z0-9\-]*[a-z0-9])?\.)*[a-z0-9]([a-z0-9\-]*[a-z0-9])?$/i';
        if (! preg_match($pattern, $fqdn)) {
            throw ValidationException::withMessages([
                'custom_domain' => ['Укажите корректный домен (например example.com или sub.example.com).'],
            ]);
        }
    }
}
