<?php

namespace App\Http\Middleware;

use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\GlobalSettingsService;
use Illuminate\Support\Facades\Route;

class HandleInertiaRequests extends Middleware
{
  /**
   * The root template that's loaded on the first page visit.
   *
   * @see https://inertiajs.com/server-side-setup#root-template
   *
   * @var string
   */
  protected $rootView = 'app';

  /**
   * Determines the current asset version.
   *
   * @see https://inertiajs.com/asset-versioning
   */
  public function version(Request $request): ?string
  {
    return parent::version($request);
  }

  /**
   * Define the props that are shared by default.
   *
   * @see https://inertiajs.com/shared-data
   *
   * @return array<string, mixed>
   */
  public function share(Request $request): array
  {
    [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

    // Определяем organizationId из URL /dashboard/organization/{id}/...
    $organizationId = null;
    if (preg_match('#/organization/(\d+)#', $request->path(), $m)) {
      $organizationId = (int) $m[1];
    }

    /** @var GlobalSettingsService $settings */
    $settings = app(GlobalSettingsService::class);
    $terminology = $organizationId
      ? $settings->getTerminologyForOrganization($organizationId)
      : $settings->getTerminology();

    return [
      ...parent::share($request),
      'name' => config('app.name'),
      'quote' => ['message' => trim($message), 'author' => trim($author)],
      'auth' => [
        'user' => $request->user(),
      ],
      'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
      'terminology' => $terminology,
    ];
  }
}
