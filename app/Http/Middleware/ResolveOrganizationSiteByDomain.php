<?php

namespace App\Http\Middleware;

use App\Services\OrganizationSiteByDomainService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Для запросов с кастомного домена организации резолвит сайт
 * и кладёт в контейнер current_organization_site и current_organization_id.
 * Контроллеры /projects, /project/*, /news, /news/* используют это для скоупа по организации.
 */
class ResolveOrganizationSiteByDomain
{
    public function __construct(
        private readonly OrganizationSiteByDomainService $domainService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $host = $request->getHost();

        if ($this->domainService->isMainDomain($host)) {
            return $next($request);
        }

        $site = $this->domainService->getSiteByDomain($host);

        if ($site) {
            app()->instance('current_organization_site', $site);
            app()->instance('current_organization_id', $site->organization_id);
        }

        return $next($request);
    }
}
