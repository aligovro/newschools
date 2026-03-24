<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GetsSiteWidgetsData;
use App\Http\Resources\OrganizationVideoLessonResource;
use App\Models\Organization;
use App\Models\Site;
use App\Services\OrganizationSiteByDomainService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicVideoLessonsAllController extends Controller
{
    use GetsSiteWidgetsData;

    private const PER_PAGE = 6;

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

        $lessons = [];
        $total   = 0;
        $hasMore = false;

        if ($site->organization_id) {
            $organization = Organization::find($site->organization_id);
            if ($organization) {
                $total   = $organization->videoLessons()->count();
                $items   = $organization->videoLessons()->take(self::PER_PAGE)->get();
                $lessons = OrganizationVideoLessonResource::collection($items)->resolve($request);
                $hasMore = $total > self::PER_PAGE;
            }
        }

        return Inertia::render('site/VideoLessonsAll', array_merge($siteData, [
            'lessons'  => $lessons,
            'total'    => $total,
            'has_more' => $hasMore,
            'per_page' => self::PER_PAGE,
            'seo'      => [
                'title' => 'Видео уроки — ' . $site->name,
            ],
        ]));
    }
}
