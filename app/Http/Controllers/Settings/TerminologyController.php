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

        return Inertia::render('dashboard/settings/TerminologySettings', [
            'terminology' => $terminology,
            'raw' => [],
        ]);
    }

    public function update(Request $request, GlobalSettingsService $service)
    {
        $this->authorize('admin');

        $data = $request->validate([]);

        // Преобразуем в формат полей модели GlobalSettings
        $map = $data; // названия совпадают с добавленными полями

        $service->updateSettings($map);

        return redirect()->route('terminology.edit')->with('success', 'Терминология обновлена');
    }
}
