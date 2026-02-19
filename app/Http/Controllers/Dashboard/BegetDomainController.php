<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Organization;
use App\Models\Site;
use App\Services\Beget\BegetApiException;
use App\Services\Beget\BegetDomainService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BegetDomainController extends Controller
{
    /**
     * Список доменов Beget для выбора при привязке.
     */
    public function domains(Organization $organization, Site $site): JsonResponse
    {
        $service = BegetDomainService::make();
        if (! $service) {
            return response()->json([
                'available' => false,
                'message' => 'Beget API не настроен',
                'domains' => [],
            ]);
        }

        if (! $service->isAvailable()) {
            return response()->json([
                'available' => false,
                'message' => 'Beget API недоступен. Проверьте BEGET_LOGIN, BEGET_PASSWORD, BEGET_SITE_ID.',
                'domains' => [],
            ]);
        }

        try {
            $domains = $service->getAvailableDomains();
            return response()->json([
                'available' => true,
                'domains' => array_map(fn ($d) => [
                    'id' => $d['id'] ?? null,
                    'fqdn' => $d['fqdn'] ?? '',
                ], $domains),
            ]);
        } catch (BegetApiException $e) {
            return response()->json([
                'available' => false,
                'message' => $e->getMessage(),
                'domains' => [],
            ], 422);
        }
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
}
