<?php

namespace App\Console\Commands;

use App\Models\Domain;
use App\Models\Organization;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

/**
 * Привязка кастомного домена (например поддомена на сервере) к сайту организации.
 * После привязки запросы на этот домен будут отдавать сайт данной организации.
 *
 * Пример: после миграции po500.ru привязать тестовый поддомен на сервере:
 *   php artisan site:bind-custom-domain --organization-id=29 --custom-domain=po500.shkolaplat.ru
 */
class BindCustomDomainToSite extends Command
{
    protected $signature = 'site:bind-custom-domain
                            {--organization-id= : ID организации}
                            {--site-id= : ID сайта (если не указан — берётся первый опубликованный сайт организации с доменом)}
                            {--custom-domain= : Домен для привязки (например po500.shkolaplat.ru)}';

    protected $description = 'Привязать кастомный домен к сайту организации (для поддомена на сервере и т.п.)';

    public function handle(): int
    {
        $organizationId = $this->option('organization-id');
        $siteId = $this->option('site-id');
        $customDomain = $this->option('custom-domain');

        if (! $customDomain) {
            $this->error('Укажите --custom-domain=po500.shkolaplat.ru');

            return Command::FAILURE;
        }

        $customDomain = strtolower(trim($customDomain));

        $organization = Organization::find($organizationId);
        if (! $organization) {
            $this->error("Организация с ID {$organizationId} не найдена.");

            return Command::FAILURE;
        }

        $site = $siteId
            ? $organization->sites()->find($siteId)
            : $organization->sites()
                ->where('site_type', 'organization')
                ->whereNotNull('domain_id')
                ->where('status', 'published')
                ->first();

        if (! $site) {
            $this->error('Сайт не найден. Укажите --site-id= или убедитесь, что у организации есть опубликованный сайт с привязанным доменом.');

            return Command::FAILURE;
        }

        $domain = $site->domain;
        if (! $domain) {
            $this->error('У сайта нет привязанного домена. Сначала привяжите основной домен к сайту.');

            return Command::FAILURE;
        }

        $previousCustom = $domain->custom_domain;
        $domain->custom_domain = $customDomain;
        $domain->status = 'active';
        $domain->save();

        Cache::forget("site_by_domain_{$customDomain}");
        if ($previousCustom) {
            Cache::forget("site_by_domain_{$previousCustom}");
        }

        $this->info("Кастомный домен привязан: {$customDomain} → сайт #{$site->id} ({$site->name}), организация #{$organization->id}.");
        $this->info('Кеш разрешения по домену очищен. Откройте https://' . $customDomain . '/ в браузере.');

        return Command::SUCCESS;
    }
}
