<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Site;
use App\Services\Beget\BegetApiException;
use Illuminate\Support\Str;
use App\Services\Beget\BegetDomainService;
use App\Services\SiteDomainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class BegetDomainController extends Controller
{
    /**
     * Единый ответ для блока «Домен»: текущий домен + доступность Beget и список доменов.
     * Один запрос вместо двух, без лишних обращений к API при не настроенном Beget.
     */
    public function status(Organization $organization, Site $site): JsonResponse
    {
        if ($site->organization_id !== $organization->id) {
            abort(404);
        }

        $site->load('domain');
        $domain = $site->domain;

        $current = null;
        if ($domain) {
            $current = [
                'id' => $domain->id,
                'domain' => $domain->domain,
                'custom_domain' => $domain->custom_domain,
                'beget_domain_id' => $domain->beget_domain_id,
            ];
        }

        $messages = config('beget.messages', []);
        $begetService = BegetDomainService::make();

        if (! $begetService) {
            return response()->json([
                'current_domain' => $current,
                'beget' => [
                    'available' => false,
                    'message' => $messages['not_configured'] ?? 'Beget API не настроен',
                    'domains' => [],
                ],
            ]);
        }

        if (! $begetService->isAvailable()) {
            return response()->json([
                'current_domain' => $current,
                'beget' => [
                    'available' => false,
                    'message' => $messages['unavailable'] ?? 'Beget API недоступен',
                    'domains' => [],
                ],
            ]);
        }

        try {
            $domains = $begetService->getAvailableDomains();
            $hostingMode = $begetService->isHostingMode();
            $filtered = $this->filterAndEnrichBegetDomains($domains, $site);
            return response()->json([
                'current_domain' => $current,
                'beget' => [
                    'available' => true,
                    'message' => null,
                    'hosting_mode' => $hostingMode,
                    'domains' => $filtered,
                ],
            ]);
        } catch (BegetApiException $e) {
            return response()->json([
                'current_domain' => $current,
                'beget' => [
                    'available' => false,
                    'message' => $e->getMessage(),
                    'domains' => [],
                ],
            ]);
        }
    }

    /**
     * Установить кастомный домен (поддомен и т.п.) без Beget.
     */
    public function setCustomDomain(Request $request, Organization $organization, Site $site): JsonResponse
    {
        if ($site->organization_id !== $organization->id) {
            abort(404);
        }

        $request->validate([
            'custom_domain' => 'required|string|max:253',
        ]);

        try {
            $domain = app(SiteDomainService::class)->setCustomDomain(
                $site,
                $request->input('custom_domain')
            );
            return response()->json([
                'message' => 'Дополнительный домен сохранён',
                'domain' => [
                    'id' => $domain->id,
                    'domain' => $domain->domain,
                    'custom_domain' => $domain->custom_domain,
                    'beget_domain_id' => $domain->beget_domain_id,
                ],
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }
    }

    /**
     * Список доменов Beget для выбора при привязке (обратная совместимость).
     */
    public function domains(Organization $organization, Site $site): JsonResponse
    {
        $response = $this->status($organization, $site);
        $data = $response->getData(true);
        return response()->json([
            'available' => $data['beget']['available'],
            'message' => $data['beget']['message'],
            'domains' => $data['beget']['domains'],
        ]);
    }

    /**
     * Привязать домен Beget к сайту.
     */
    public function bind(Request $request, Organization $organization, Site $site): JsonResponse
    {
        if ($site->organization_id !== $organization->id) {
            abort(404);
        }

        $request->validate([
            'beget_domain_id' => 'required|integer|min:1',
            'fqdn' => 'required|string|max:255',
        ]);

        $fqdn = Str::lower(trim($request->input('fqdn')));
        $excluded = $this->getExcludedDomainsForChoice();
        if (in_array($fqdn, $excluded, true)) {
            return response()->json(['message' => 'Этот домен нельзя привязать к сайту организации (главный домен системы).'], 422);
        }

        $otherSite = Site::whereHas('domain', function ($q) use ($fqdn) {
            $q->where('domain', $fqdn)->orWhere('custom_domain', $fqdn);
        })->where('id', '!=', $site->id)->first(['id', 'name']);
        if ($otherSite) {
            return response()->json([
                'message' => 'Домен уже привязан к сайту «' . $otherSite->name . '». Выберите другой домен.',
            ], 422);
        }

        $service = BegetDomainService::make();
        if (! $service) {
            return response()->json(['message' => 'Beget API не настроен'], 503);
        }

        try {
            $domain = $service->bindDomainToSite(
                $site,
                (int) $request->beget_domain_id,
                $request->fqdn
            );

            return response()->json([
                'message' => 'Домен успешно привязан',
                'domain' => [
                    'id' => $domain->id,
                    'domain' => $domain->domain,
                    'custom_domain' => $domain->custom_domain,
                    'beget_domain_id' => $domain->beget_domain_id,
                ],
            ]);
        } catch (BegetApiException $e) {
            return response()->json([
                'message' => 'Ошибка Beget: ' . $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Отвязать домен от сайта (только в БД).
     */
    public function unbind(Organization $organization, Site $site): JsonResponse
    {
        if ($site->organization_id !== $organization->id) {
            abort(404);
        }

        $service = BegetDomainService::make();
        if ($service) {
            $service->unbindDomainFromSite($site);
        } else {
            $site->update(['domain_id' => null]);
        }

        return response()->json(['message' => 'Домен отвязан']);
    }

    /**
     * Исключает главный домен системы и помечает домены, уже привязанные к другим сайтам.
     *
     * @param  array<int, array{id: int, fqdn: string}>  $domains
     * @return array<int, array{id: int, fqdn: string, already_bound_to?: array{site_id: int, site_name: string}}>
     */
    private function filterAndEnrichBegetDomains(array $domains, Site $currentSite): array
    {
        $excluded = $this->getExcludedDomainsForChoice();
        $result = [];

        foreach ($domains as $d) {
            $fqdn = Str::lower(trim((string) ($d['fqdn'] ?? '')));
            if ($fqdn === '') {
                continue;
            }
            if (in_array($fqdn, $excluded, true)) {
                continue;
            }

            $item = [
                'id' => $d['id'] ?? null,
                'fqdn' => $fqdn,
            ];

            $otherSite = Site::whereHas('domain', function ($q) use ($fqdn) {
                $q->where('domain', $fqdn)->orWhere('custom_domain', $fqdn);
            })->where('id', '!=', $currentSite->id)->first(['id', 'name']);

            if ($otherSite) {
                $item['already_bound_to'] = [
                    'site_id' => $otherSite->id,
                    'site_name' => $otherSite->name,
                ];
            }

            $result[] = $item;
        }

        return $result;
    }

    /**
     * Список доменов, которые не показывать в выборе (главный домен системы и из конфига).
     *
     * @return array<int, string>
     */
    private function getExcludedDomainsForChoice(): array
    {
        $excluded = collect(config('beget.exclude_domains', []))->map(fn ($h) => Str::lower(trim($h)))->filter()->values()->all();

        if (config('beget.exclude_main_domain_from_app_url', true)) {
            $host = parse_url(config('app.url'), PHP_URL_HOST);
            if (is_string($host) && $host !== '') {
                $host = Str::lower($host);
                $excluded[] = $host;
                if (! str_starts_with($host, 'www.')) {
                    $excluded[] = 'www.' . $host;
                }
            }
        }

        return array_values(array_unique($excluded));
    }
}
