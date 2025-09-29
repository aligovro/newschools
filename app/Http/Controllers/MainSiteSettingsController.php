<?php

namespace App\Http\Controllers;

use App\Services\MainSiteSettingsService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MainSiteSettingsController extends Controller
{
    protected MainSiteSettingsService $mainSiteSettings;

    public function __construct(MainSiteSettingsService $mainSiteSettings)
    {
        $this->middleware('auth');
        $this->middleware('can:manage,App\Models\GlobalSettings'); // Только супер-админ

        $this->mainSiteSettings = $mainSiteSettings;
    }

    /**
     * Показать страницу настроек главного сайта
     */
    public function index()
    {
        $settings = $this->mainSiteSettings->getSettings();

        return Inertia::render('admin/MainSiteSettingsPage', [
            'settings' => $settings,
        ]);
    }

    /**
     * Обновить основные настройки
     */
    public function updateBasicSettings(Request $request)
    {
        $data = $request->validate([
            'site_name' => 'required|string|max:255',
            'site_description' => 'nullable|string',
            'site_logo' => 'nullable|string|max:500',
            'site_favicon' => 'nullable|string|max:500',
            'site_theme' => 'required|string|max:50',
            'primary_color' => 'required|string|max:7',
            'secondary_color' => 'required|string|max:7',
            'dark_mode' => 'boolean',
        ]);

        $settings = $this->mainSiteSettings->updateBasicSettings($data);

        return response()->json([
            'success' => true,
            'message' => 'Основные настройки обновлены',
            'settings' => $settings,
        ]);
    }

    /**
     * Обновить SEO настройки
     */
    public function updateSeoSettings(Request $request)
    {
        $data = $request->validate([
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'meta_keywords' => 'nullable|string',
            'og_title' => 'nullable|string|max:255',
            'og_description' => 'nullable|string|max:500',
            'og_image' => 'nullable|string|max:500',
            'og_type' => 'required|string|max:50',
            'twitter_card' => 'required|string|max:50',
            'twitter_title' => 'nullable|string|max:255',
            'twitter_description' => 'nullable|string|max:500',
            'twitter_image' => 'nullable|string|max:500',
        ]);

        $settings = $this->mainSiteSettings->updateSeoSettings($data);

        return response()->json([
            'success' => true,
            'message' => 'SEO настройки обновлены',
            'settings' => $settings,
        ]);
    }

    /**
     * Обновить контактную информацию
     */
    public function updateContactSettings(Request $request)
    {
        $data = $request->validate([
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'contact_address' => 'nullable|string',
            'contact_telegram' => 'nullable|string|max:100',
            'contact_vk' => 'nullable|string|max:100',
            'social_links' => 'nullable|array',
        ]);

        $settings = $this->mainSiteSettings->updateContactSettings($data);

        return response()->json([
            'success' => true,
            'message' => 'Контактная информация обновлена',
            'settings' => $settings,
        ]);
    }

    /**
     * Обновить настройки аналитики
     */
    public function updateAnalyticsSettings(Request $request)
    {
        $data = $request->validate([
            'google_analytics_id' => 'nullable|string|max:50',
            'yandex_metrika_id' => 'nullable|string|max:50',
            'custom_head_code' => 'nullable|string',
            'custom_body_code' => 'nullable|string',
        ]);

        $settings = $this->mainSiteSettings->updateAnalyticsSettings($data);

        return response()->json([
            'success' => true,
            'message' => 'Настройки аналитики обновлены',
            'settings' => $settings,
        ]);
    }

    /**
     * Обновить настройки платежей
     */
    public function updatePaymentSettings(Request $request)
    {
        $data = $request->validate([
            'payment_settings' => 'required|array',
            'payment_settings.enabled_methods' => 'required|array',
            'payment_settings.min_amount' => 'required|integer|min:1',
            'payment_settings.max_amount' => 'required|integer|min:1',
            'payment_settings.currency' => 'required|string|max:3',
            'payment_settings.auto_approve' => 'boolean',
        ]);

        $settings = $this->mainSiteSettings->updatePaymentSettings($data);

        return response()->json([
            'success' => true,
            'message' => 'Настройки платежей обновлены',
            'settings' => $settings,
        ]);
    }

    /**
     * Обновить настройки уведомлений
     */
    public function updateNotificationSettings(Request $request)
    {
        $data = $request->validate([
            'notification_settings' => 'required|array',
            'notification_settings.email_notifications' => 'boolean',
            'notification_settings.telegram_notifications' => 'boolean',
            'notification_settings.donation_notifications' => 'boolean',
        ]);

        $settings = $this->mainSiteSettings->updateNotificationSettings($data);

        return response()->json([
            'success' => true,
            'message' => 'Настройки уведомлений обновлены',
            'settings' => $settings,
        ]);
    }

    /**
     * Обновить настройки интеграций
     */
    public function updateIntegrationSettings(Request $request)
    {
        $data = $request->validate([
            'integration_settings' => 'required|array',
            'integration_settings.yookassa_test_mode' => 'boolean',
            'integration_settings.telegram_bot_enabled' => 'boolean',
        ]);

        $settings = $this->mainSiteSettings->updateIntegrationSettings($data);

        return response()->json([
            'success' => true,
            'message' => 'Настройки интеграций обновлены',
            'settings' => $settings,
        ]);
    }

    /**
     * Очистить кеш настроек
     */
    public function clearCache()
    {
        $this->mainSiteSettings->clearCache();

        return response()->json([
            'success' => true,
            'message' => 'Кеш настроек главного сайта очищен',
        ]);
    }

    /**
     * Сбросить настройки к значениям по умолчанию
     */
    public function reset()
    {
        $settings = $this->mainSiteSettings->resetToDefaults();

        return response()->json([
            'success' => true,
            'message' => 'Настройки сброшены к значениям по умолчанию',
            'settings' => $settings,
        ]);
    }
}
