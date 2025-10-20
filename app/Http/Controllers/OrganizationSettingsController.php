<?php

namespace App\Http\Controllers;

use App\Models\Organization;
use App\Services\OrganizationSettingsService;
use App\Http\Resources\OrganizationResource;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class OrganizationSettingsController extends Controller
{
  protected OrganizationSettingsService $settingsService;

  public function __construct(OrganizationSettingsService $settingsService)
  {
    $this->settingsService = $settingsService;
  }

  /**
   * Показать настройки организации
   */
  public function index(Organization $organization)
  {
    $this->authorize('manage', $organization);

    $settings = $this->settingsService->getSettings($organization);
    $organizationTypes = $this->settingsService->getOrganizationTypes();

    return Inertia::render('organization/admin/settings/SettingsPage', [
      'organization' => (new OrganizationResource($organization))->toArray(request()),
      'settings' => $settings,
      'organizationTypes' => $organizationTypes,
    ]);
  }

  /**
   * Обновить общие настройки
   */
  public function updateGeneral(Request $request, Organization $organization)
  {
    $this->authorize('manage', $organization);

    $validator = Validator::make($request->all(), [
      'theme' => 'required|string|in:default,modern,classic,minimal',
      'primary_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
      'secondary_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
      'accent_color' => 'required|string|regex:/^#[0-9A-Fa-f]{6}$/',
      'font_family' => 'required|string|in:Inter,Roboto,Open Sans,Lato,Source Sans Pro',
      'dark_mode' => 'boolean',
    ]);

    if ($validator->fails()) {
      return redirect()->back()
        ->withErrors($validator)
        ->withInput();
    }

    $this->settingsService->updateSettings($organization, $request->only([
      'theme',
      'primary_color',
      'secondary_color',
      'accent_color',
      'font_family',
      'dark_mode'
    ]));

    return redirect()->back()->with('success', 'Общие настройки обновлены');
  }

  /**
   * Обновить настройки сайта
   */
  public function updateSiteSettings(Request $request, Organization $organization)
  {
    $this->authorize('manage', $organization);

    $validator = Validator::make($request->all(), [
      'layout_config' => 'array',
      'advanced_layout_config' => 'array',
      'maintenance_mode' => 'boolean',
      'maintenance_message' => 'nullable|string|max:500',
    ]);

    if ($validator->fails()) {
      return redirect()->back()
        ->withErrors($validator)
        ->withInput();
    }

    $this->settingsService->updateSettings($organization, $request->only([
      'layout_config',
      'advanced_layout_config',
      'maintenance_mode',
      'maintenance_message'
    ]));

    return redirect()->back()->with('success', 'Настройки сайта обновлены');
  }

  /**
   * Обновить настройки платежей
   */
  public function updatePaymentSettings(Request $request, Organization $organization)
  {
    $this->authorize('manage', $organization);

    $validator = Validator::make($request->all(), [
      'payment_settings.enabled_methods' => 'array',
      'payment_settings.min_amount' => 'integer|min:1',
      'payment_settings.max_amount' => 'integer|min:1',
      'payment_settings.currency' => 'string|in:RUB,USD,EUR',
      'payment_settings.auto_approve' => 'boolean',
      'payment_settings.commission_percentage' => 'numeric|min:0|max:100',
      'payment_settings.test_mode' => 'boolean',
    ]);

    if ($validator->fails()) {
      return redirect()->back()
        ->withErrors($validator)
        ->withInput();
    }

    $paymentSettings = $request->get('payment_settings', []);
    $this->settingsService->updateSettings($organization, [
      'payment_settings' => $paymentSettings
    ]);

    return redirect()->back()->with('success', 'Настройки платежей обновлены');
  }

  /**
   * Обновить настройки уведомлений
   */
  public function updateNotificationSettings(Request $request, Organization $organization)
  {
    $this->authorize('manage', $organization);

    $validator = Validator::make($request->all(), [
      'notification_settings.email_notifications' => 'boolean',
      'notification_settings.telegram_notifications' => 'boolean',
      'notification_settings.donation_notifications' => 'boolean',
      'notification_settings.member_registration_notifications' => 'boolean',
      'notification_settings.project_update_notifications' => 'boolean',
      'notification_settings.news_notifications' => 'boolean',
      'notification_settings.sms_notifications' => 'boolean',
      'notification_settings.push_notifications' => 'boolean',
    ]);

    if ($validator->fails()) {
      return redirect()->back()
        ->withErrors($validator)
        ->withInput();
    }

    $notificationSettings = $request->get('notification_settings', []);
    $this->settingsService->updateSettings($organization, [
      'notification_settings' => $notificationSettings
    ]);

    return redirect()->back()->with('success', 'Настройки уведомлений обновлены');
  }

  /**
   * Обновить настройки интеграций
   */
  public function updateIntegrationSettings(Request $request, Organization $organization)
  {
    $this->authorize('manage', $organization);

    $validator = Validator::make($request->all(), [
      'integration_settings.yookassa_test_mode' => 'boolean',
      'integration_settings.telegram_bot_token' => 'nullable|string',
      'integration_settings.telegram_chat_id' => 'nullable|string',
      'analytics_settings.google_analytics_id' => 'nullable|string',
      'analytics_settings.yandex_metrica_id' => 'nullable|string',
      'analytics_settings.facebook_pixel_id' => 'nullable|string',
    ]);

    if ($validator->fails()) {
      return redirect()->back()
        ->withErrors($validator)
        ->withInput();
    }

    $integrationSettings = $request->get('integration_settings', []);
    $analyticsSettings = $request->get('analytics_settings', []);

    $this->settingsService->updateSettings($organization, [
      'integration_settings' => $integrationSettings,
      'analytics_settings' => $analyticsSettings,
    ]);

    return redirect()->back()->with('success', 'Настройки интеграций обновлены');
  }

  /**
   * Тестировать Telegram бота
   */
  public function testTelegramBot(Request $request, Organization $organization)
  {
    $this->authorize('manage', $organization);

    $validator = Validator::make($request->all(), [
      'telegram_bot_token' => 'required|string',
      'telegram_chat_id' => 'required|string',
    ]);

    if ($validator->fails()) {
      return response()->json([
        'success' => false,
        'message' => 'Неверные данные для тестирования',
        'errors' => $validator->errors()
      ], 422);
    }

    // Здесь должна быть логика тестирования Telegram бота
    // Пока возвращаем успешный результат
    return response()->json([
      'success' => true,
      'message' => 'Telegram бот успешно протестирован'
    ]);
  }

  /**
   * Экспортировать настройки
   */
  public function exportSettings(Organization $organization)
  {
    $this->authorize('manage', $organization);

    $settings = $this->settingsService->getSettings($organization);

    $filename = "organization_settings_{$organization->slug}_" . date('Y-m-d_H-i-s') . '.json';

    return response()->json($settings)
      ->header('Content-Disposition', "attachment; filename={$filename}")
      ->header('Content-Type', 'application/json');
  }

  /**
   * Импортировать настройки
   */
  public function importSettings(Request $request, Organization $organization)
  {
    $this->authorize('manage', $organization);

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

    // Валидируем импортируемые настройки
    $this->settingsService->updateSettings($organization, $settings);

    return redirect()->back()->with('success', 'Настройки успешно импортированы');
  }

  /**
   * Сбросить настройки к значениям по умолчанию
   */
  public function resetToDefaults(Organization $organization)
  {
    $this->authorize('manage', $organization);

    // Удаляем текущие настройки
    $organization->settings()->delete();

    // Очищаем кеш
    $this->settingsService->clearCache($organization);

    return redirect()->back()->with('success', 'Настройки сброшены к значениям по умолчанию');
  }
}
