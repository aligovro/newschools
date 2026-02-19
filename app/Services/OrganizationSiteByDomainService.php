<?php

namespace App\Services;

use App\Models\Site;
use Illuminate\Support\Facades\Cache;

/**
 * Определение сайта организации по домену (Host).
 * Используется в PublicSitePageController и middleware ResolveOrganizationSiteByDomain.
 */
class OrganizationSiteByDomainService
{
    public function isMainDomain(string $host): bool
    {
        $appHost = parse_url(config('app.url'), PHP_URL_HOST);

        return $appHost && strtolower($host) === strtolower($appHost);
    }

    public function getSiteByDomain(?string $host = null): ?Site
    {
        if (empty($host)) {
            return null;
        }

        $host = strtolower(trim($host));

        return Cache::remember("site_by_domain_{$host}", 300, function () use ($host) {
            return Site::where('site_type', 'organization')
                ->published()
                ->whereHas('domain', function ($query) use ($host) {
                    $query->where('status', 'active')
                        ->where(function ($q) use ($host) {
                            $q->where('domain', $host)->orWhere('custom_domain', $host);
                        });
                })
                ->first();
        });
    }
}
