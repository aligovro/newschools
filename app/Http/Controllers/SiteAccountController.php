<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Concerns\GetsSiteWidgetsData;
use App\Models\Site;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Личный кабинет на сайтах организаций (/my-account/*).
 * Требует авторизации и контекста организации (кастомный домен).
 */
class SiteAccountController extends Controller
{
    use GetsSiteWidgetsData;

    public function __construct()
    {
        $this->middleware('auth');
    }

    private function getOrganizationId(): ?int
    {
        if (app()->bound('current_organization_site')) {
            $site = app('current_organization_site');
            return $site?->organization_id;
        }
        return null;
    }

    /**
     * Редирект /my-account → /my-account/personal
     */
    public function index(Request $request)
    {
        $orgId = $this->getOrganizationId();
        if (!$orgId) {
            return redirect('/')->with('error', 'Личный кабинет доступен только на сайте организации.');
        }

        return redirect('/my-account/personal');
    }

    /**
     * Личные данные, платежи, автоплатежи и т.д.
     */
    public function show(Request $request, string $section): Response
    {
        $orgId = $this->getOrganizationId();
        if (!$orgId) {
            abort(404, 'Сайт организации не найден');
        }

        $site = app('current_organization_site');
        $data = $this->getSiteWidgetsAndPositionsFor($site);

        return Inertia::render('site-account/AccountPage', array_merge($data, [
            'section' => $section,
            'organizationId' => $orgId,
        ]));
    }
}
