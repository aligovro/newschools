<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GetsSiteWidgetsData;
use App\Http\Resources\OrganizationClubResource;
use App\Models\Organization;
use App\Models\Site;
use App\Services\OrganizationSiteByDomainService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicClubsAllController extends Controller
{
    use GetsSiteWidgetsData;

    private const PER_PAGE = 4;

    public function __construct(
        private readonly OrganizationSiteByDomainService $domainService,
    ) {}

    public function index(Request $request): Response
    {
        $host = $request->getHost();

        $site = $this->domainService->isMainDomain($host)
            ? Site::where('site_type', 'main')->published()->first()
            : $this->domainService->getSiteByDomain($host);

        if (!$site) {
            abort(404);
        }

        $siteData = $this->getSiteWidgetsAndPositionsFor($site);

        $clubs    = [];
        $total    = 0;
        $hasMore  = false;

        if ($site->organization_id) {
            $organization = Organization::find($site->organization_id);
            if ($organization) {
                $total   = $organization->clubs()->count();
                $items   = $organization->clubs()->take(self::PER_PAGE)->get();
                $clubs   = OrganizationClubResource::collection($items)->resolve($request);
                $hasMore = $total > self::PER_PAGE;
            }
        }

        return Inertia::render('site/ClubsAll', array_merge($siteData, [
            'clubs'    => $clubs,
            'total'    => $total,
            'has_more' => $hasMore,
            'per_page' => self::PER_PAGE,
            'seo'      => [
                'title' => 'Кружки и секции — ' . $site->name,
            ],
        ]));
    }
}
