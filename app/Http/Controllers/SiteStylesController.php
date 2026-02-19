<?php

namespace App\Http\Controllers;

use App\Services\SiteStylesService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SiteStylesController extends Controller
{
    public function __construct(
        private readonly SiteStylesService $siteStylesService,
    ) {}

    /**
     * Вернуть скомпилированные CSS для сайта (для подключения через <link>).
     */
    public function show(Request $request, int $id): Response
    {
        $css = $this->siteStylesService->getCompiledCss($id);

        if ($css === null) {
            abort(404);
        }

        return response($css, 200, [
            'Content-Type' => 'text/css; charset=utf-8',
            'Cache-Control' => 'public, max-age=3600',
        ]);
    }
}
