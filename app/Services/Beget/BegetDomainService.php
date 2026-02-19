<?php

namespace App\Services\Beget;

use App\Models\Domain;
use App\Models\Site;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class BegetDomainService
{
    public function __construct(
        private readonly BegetClient $client,
        private readonly ?int $siteId
    ) {}

    public static function make(): ?self
    {
        $config = config('beget');
        if (empty($config['login']) || empty($config['password'])) {
            return null;
        }

        return new self(
            new BegetClient(
                $config['base_url'],
                $config['login'],
                $config['password'],
                $config['timeout'] ?? 30
            ),
            $config['site_id'] ? (int) $config['site_id'] : null
        );
    }

    /**
     * Проверка доступности Beget API.
     */
    public function isAvailable(): bool
    {
        if (empty($this->siteId) || ! config('beget.login') || ! config('beget.password')) {
            return false;
        }

        try {
            $this->client->getSiteList();
            return true;
        } catch (BegetApiException $e) {
            Log::warning('Beget API unavailable', ['message' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Список доменов из Beget для выбора при привязке.
     *
     * @return array<int, array{id: int, fqdn: string}>
     */
    public function getAvailableDomains(): array
    {
        return $this->client->getDomainList();
    }

    /**
     * Список сайтов Beget (для настроек).
     *
     * @return array<int, array{id: int, site_name: string, domains: array}>
     */
    public function getSites(): array
    {
        return $this->client->getSiteList();
    }

    /**
     * Привязать домен Beget к сайту Laravel.
     *
     * 1. Вызывает site/linkDomain в Beget
     * 2. Обновляет/создаёт запись Domain в БД
     */
    public function bindDomainToSite(Site $site, int $begetDomainId, string $fqdn): Domain
    {
        if ($this->siteId === null) {
            throw new BegetApiException('BEGET_SITE_ID не настроен');
        }

        $this->client->linkDomainToSite($this->siteId, $begetDomainId);

        $domain = $site->domain;

        if ($domain) {
            $oldFqdn = $domain->domain ?: $domain->custom_domain;
            $domain->update([
                'domain' => $fqdn,
                'custom_domain' => $fqdn,
                'beget_domain_id' => $begetDomainId,
                'status' => 'active',
            ]);
            if ($oldFqdn) {
                Cache::forget('site_by_domain_' . strtolower($oldFqdn));
            }
        } else {
            $domain = Domain::create([
                'organization_id' => $site->organization_id,
                'domain' => $fqdn,
                'custom_domain' => $fqdn,
                'beget_domain_id' => $begetDomainId,
                'is_primary' => false,
                'is_ssl_enabled' => true,
                'status' => 'active',
            ]);

            $site->update(['domain_id' => $domain->id]);
        }

        Cache::forget('site_by_domain_' . strtolower($fqdn));

        return $domain->fresh();
    }

    /**
     * Отвязать домен от сайта (только в БД, без вызова Beget).
     * site/unlinkDomain в Beget вызывается отдельно при необходимости.
     */
    public function unbindDomainFromSite(Site $site): void
    {
        $domain = $site->domain;
        if ($domain) {
            $fqdn = $domain->custom_domain ?: $domain->domain;
            if ($fqdn) {
                Cache::forget('site_by_domain_' . strtolower($fqdn));
            }
        }
        $site->update(['domain_id' => null]);
    }
}
