<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GetsSiteWidgetsData;
use App\Models\OrganizationClub;
use App\Models\Site;
use App\Services\OrganizationSiteByDomainService;
use App\Services\Seo\SeoPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicClubController extends Controller
{
    use GetsSiteWidgetsData;

    public function __construct(
        private readonly OrganizationSiteByDomainService $domainService,
        private readonly SeoPresenter $seoPresenter,
    ) {}

    public function show(Request $request, int $club): Response
    {
        // Резолвим сайт: кастомный домен → сайт организации, иначе → главный сайт
        $host = $request->getHost();

        $site = $this->domainService->isMainDomain($host)
            ? Site::where('site_type', 'main')->published()->first()
            : $this->domainService->getSiteByDomain($host);

        if (!$site) {
            abort(404);
        }

        // Загружаем кружок с организацией
        $orgId = app()->bound('current_organization_id')
            ? app('current_organization_id')
            : null;

        $query = OrganizationClub::with('organization:id,name,email,phone,address')
            ->where('id', $club);

        // На домене организации ограничиваем кружки своей организацией
        if ($orgId) {
            $query->where('organization_id', $orgId);
        }

        $clubModel = $query->first();

        if (!$clubModel) {
            abort(404, 'Секция не найдена');
        }

        $clubData = [
            'id'          => $clubModel->id,
            'name'        => $clubModel->name,
            'description' => $clubModel->description,
            'image'       => $clubModel->image_url,
            'schedule'    => $clubModel->schedule,
            'organization' => $clubModel->organization ? [
                'id'    => $clubModel->organization->id,
                'name'  => $clubModel->organization->name,
                'phone' => $clubModel->organization->phone,
            ] : null,
        ];

        $siteData = $this->getSiteWidgetsAndPositionsFor($site);

        $seo = [
            'title'       => $clubModel->name . ' — ' . ($clubModel->organization?->name ?? $site->name),
            'description' => $clubModel->description
                ? mb_substr(strip_tags($clubModel->description), 0, 160)
                : null,
            'og_image'    => $clubModel->image_url,
        ];

        return Inertia::render('site/ClubShow', array_merge($siteData, [
            'club' => $clubData,
            'seo'  => $seo,
        ]));
    }
}
