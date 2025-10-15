<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\GlobalSettings;
use App\Services\GlobalSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TerminologyController extends Controller
{
  public function edit(GlobalSettingsService $service)
  {
    $this->authorize('admin');

    $settings = $service->getSettings();
    $terminology = $service->getTerminology();

    return Inertia::render('settings/TerminologySettings', [
      'terminology' => $terminology,
      'raw' => [
        'organization' => [
          'singular_nominative' => $settings->org_singular_nominative,
          'singular_genitive' => $settings->org_singular_genitive,
          'singular_dative' => $settings->org_singular_dative,
          'singular_accusative' => $settings->org_singular_accusative,
          'singular_instrumental' => $settings->org_singular_instrumental,
          'singular_prepositional' => $settings->org_singular_prepositional,
          'plural_nominative' => $settings->org_plural_nominative,
          'plural_genitive' => $settings->org_plural_genitive,
          'plural_dative' => $settings->org_plural_dative,
          'plural_accusative' => $settings->org_plural_accusative,
          'plural_instrumental' => $settings->org_plural_instrumental,
          'plural_prepositional' => $settings->org_plural_prepositional,
        ],
        'member' => [
          'singular_nominative' => $settings->member_singular_nominative,
          'singular_genitive' => $settings->member_singular_genitive,
          'singular_dative' => $settings->member_singular_dative,
          'singular_accusative' => $settings->member_singular_accusative,
          'singular_instrumental' => $settings->member_singular_instrumental,
          'singular_prepositional' => $settings->member_singular_prepositional,
          'plural_nominative' => $settings->member_plural_nominative,
          'plural_genitive' => $settings->member_plural_genitive,
          'plural_dative' => $settings->member_plural_dative,
          'plural_accusative' => $settings->member_plural_accusative,
          'plural_instrumental' => $settings->member_plural_instrumental,
          'plural_prepositional' => $settings->member_plural_prepositional,
        ],
        'actions' => [
          'join' => $settings->action_join,
          'leave' => $settings->action_leave,
          'support' => $settings->action_support,
        ],
      ],
    ]);
  }

  public function update(Request $request, GlobalSettingsService $service)
  {
    $this->authorize('admin');

    $data = $request->validate([
      // Organization
      'org_singular_nominative' => 'nullable|string|max:255',
      'org_singular_genitive' => 'nullable|string|max:255',
      'org_singular_dative' => 'nullable|string|max:255',
      'org_singular_accusative' => 'nullable|string|max:255',
      'org_singular_instrumental' => 'nullable|string|max:255',
      'org_singular_prepositional' => 'nullable|string|max:255',
      'org_plural_nominative' => 'nullable|string|max:255',
      'org_plural_genitive' => 'nullable|string|max:255',
      'org_plural_dative' => 'nullable|string|max:255',
      'org_plural_accusative' => 'nullable|string|max:255',
      'org_plural_instrumental' => 'nullable|string|max:255',
      'org_plural_prepositional' => 'nullable|string|max:255',

      // Member
      'member_singular_nominative' => 'nullable|string|max:255',
      'member_singular_genitive' => 'nullable|string|max:255',
      'member_singular_dative' => 'nullable|string|max:255',
      'member_singular_accusative' => 'nullable|string|max:255',
      'member_singular_instrumental' => 'nullable|string|max:255',
      'member_singular_prepositional' => 'nullable|string|max:255',
      'member_plural_nominative' => 'nullable|string|max:255',
      'member_plural_genitive' => 'nullable|string|max:255',
      'member_plural_dative' => 'nullable|string|max:255',
      'member_plural_accusative' => 'nullable|string|max:255',
      'member_plural_instrumental' => 'nullable|string|max:255',
      'member_plural_prepositional' => 'nullable|string|max:255',

      // Actions
      'action_join' => 'nullable|string|max:255',
      'action_leave' => 'nullable|string|max:255',
      'action_support' => 'nullable|string|max:255',
    ]);

    // Преобразуем в формат полей модели GlobalSettings
    $map = $data; // названия совпадают с добавленными полями

    $service->updateSettings($map);

    return redirect()->route('terminology.edit')->with('success', 'Терминология обновлена');
  }
}
