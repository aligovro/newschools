<?php

namespace App\Http\Controllers;

use App\Services\GlobalSettingsService;
use App\Models\GlobalSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class GlobalSettingsController extends Controller
{
    protected GlobalSettingsService $settingsService;

    public function __construct(GlobalSettingsService $settingsService)
    {
        $this->middleware('auth');
        $this->middleware('can:manage,' . GlobalSettings::class); // Политика для супер-админов
        $this->settingsService = $settingsService;
    }

    /**
     * Показать глобальные настройки
     */
    public function index()
    {
        $settings = $this->settingsService->getSettings();
        $terminology = $this->settingsService->getTerminology();
        $systemSettings = $this->settingsService->getSystemSettings();

        return Inertia::render('admin/GlobalSettingsPage', [
            'settings' => $settings->toArray(),
            'terminology' => $terminology,
            'systemSettings' => $systemSettings,
        ]);
    }

    /**
     * Обновить терминологию
     */
    public function updateTerminology(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'organization_singular' => 'required|string|max:50',
            'organization_plural' => 'required|string|max:50',
            'organization_genitive' => 'required|string|max:50',
            'organization_dative' => 'required|string|max:50',
            'organization_instrumental' => 'required|string|max:50',
            'member_singular' => 'required|string|max:50',
            'member_plural' => 'required|string|max:50',
            'member_genitive' => 'required|string|max:50',
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
            'action_join' => 'nullable|string|max:255',
            'action_leave' => 'nullable|string|max:255',
            'action_support' => 'nullable|string|max:255',

        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $this->settingsService->updateSettings($request->only([
            'organization_singular',
            'organization_plural',
            'organization_genitive',
            'organization_dative',
            'organization_instrumental',
            'member_singular',
            'member_plural',
            'member_genitive',
            'action_join',
            'action_leave',
            'action_support'
        ]));

        return redirect()->back()->with('success', 'Терминология обновлена');
    }

    /**
     * Обновить настройки системы
     */
    public function updateSystemSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'system_name' => 'required|string|max:255',
            'system_description' => 'required|string|max:500',
            'default_language' => 'required|string|in:ru,en',
            'default_timezone' => 'required|string|max:50',
            'default_currency' => 'required|string|in:RUB,USD,EUR',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $this->settingsService->updateSettings($request->only([
            'system_name',
            'system_description',
            'default_language',
            'default_timezone',
            'default_currency'
        ]));

        return redirect()->back()->with('success', 'Настройки системы обновлены');
    }

    /**
     * Обновить настройки по умолчанию для организаций
     */
    public function updateDefaultOrganizationSettings(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'default_organization_settings' => 'array',
            'default_payment_settings' => 'array',
            'default_notification_settings' => 'array',
            'default_seo_settings' => 'array',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $this->settingsService->updateSettings($request->only([
            'default_organization_settings',
            'default_payment_settings',
            'default_notification_settings',
            'default_seo_settings'
        ]));

        return redirect()->back()->with('success', 'Настройки по умолчанию обновлены');
    }

    /**
     * Обновить флаги функций
     */
    public function updateFeatureFlags(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'feature_flags' => 'array',
            'feature_flags.donations_enabled' => 'boolean',
            'feature_flags.members_enabled' => 'boolean',
            'feature_flags.projects_enabled' => 'boolean',
            'feature_flags.news_enabled' => 'boolean',
            'feature_flags.gallery_enabled' => 'boolean',
            'feature_flags.slider_enabled' => 'boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $this->settingsService->updateSettings([
            'feature_flags' => $request->get('feature_flags', [])
        ]);

        return redirect()->back()->with('success', 'Флаги функций обновлены');
    }

    /**
     * Обновить системные настройки
     */
    public function updateSystemConfig(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'system_settings' => 'array',
            'system_settings.maintenance_mode' => 'boolean',
            'system_settings.registration_enabled' => 'boolean',
            'system_settings.auto_approve_organizations' => 'boolean',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $this->settingsService->updateSettings([
            'system_settings' => $request->get('system_settings', [])
        ]);

        return redirect()->back()->with('success', 'Системные настройки обновлены');
    }

    /**
     * Экспортировать настройки
     */
    public function export()
    {
        $settings = $this->settingsService->getSettings();

        $filename = "global_settings_" . date('Y-m-d_H-i-s') . '.json';

        return response()->json($settings->toArray())
            ->header('Content-Disposition', "attachment; filename={$filename}")
            ->header('Content-Type', 'application/json');
    }

    /**
     * Импортировать настройки
     */
    public function import(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'settings_file' => 'required|file|mimes:json|max:1024',
        ]);

        if ($validator->fails()) {
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        $file = $request->file('settings_file');
        $content = file_get_contents($file->getPathname());
        $settings = json_decode($content, true);

        if (!$settings || !is_array($settings)) {
            return redirect()->back()
                ->with('error', 'Неверный формат файла настроек');
        }

        $this->settingsService->updateSettings($settings);

        return redirect()->back()->with('success', 'Настройки успешно импортированы');
    }

    /**
     * Сбросить настройки к значениям по умолчанию
     */
    public function reset()
    {
        $this->settingsService->resetToDefaults();

        return redirect()->back()->with('success', 'Настройки сброшены к значениям по умолчанию');
    }

    /**
     * Получить предварительный просмотр терминологии
     */
    public function previewTerminology(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'organization_singular' => 'required|string|max:50',
            'organization_plural' => 'required|string|max:50',
            'organization_genitive' => 'required|string|max:50',
            'member_singular' => 'required|string|max:50',
            'member_plural' => 'required|string|max:50',
            'member_genitive' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Неверные данные',
                'errors' => $validator->errors()
            ], 422);
        }

        // Создаем временный сервис с новыми настройками для предварительного просмотра
        $tempSettings = new \App\Models\GlobalSettings($request->all());

        $preview = [
            'organization_forms' => [
                1 => $request->organization_singular,
                2 => $request->organization_plural,
                5 => $request->organization_genitive,
            ],
            'member_forms' => [
                1 => $request->member_singular,
                2 => $request->member_plural,
                5 => $request->member_genitive,
            ],
            'examples' => [
                "Управление {$request->organization_plural}",
                "Создать {$request->organization_singular}",
                "Всего {$request->organization_genitive}: 5",
                "Всего {$request->member_genitive}: 25",
                "Последние {$request->organization_plural}",
                "Последние {$request->member_plural}",
            ]
        ];

        return response()->json($preview);
    }

    /**
     * Очистить кеш настроек
     */
    public function clearCache()
    {
        $this->settingsService->clearCache();
        $this->settingsService->clearTerminologyCache();

        return response()->json([
            'success' => true,
            'message' => 'Кеш настроек очищен',
        ]);
    }
}
