<?php

namespace App\Services;

use App\Models\Organization;
use App\Models\Project;
use App\Models\Site;
use App\Models\SiteTemplate;
use App\Models\SiteWidget;
use App\Models\Widget;
use App\Models\WidgetPosition;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Создаёт виджеты сайта организации по пресету (конфиг blagoqr_site_preset или переданный массив).
 * Только slug'и позиций и виджетов, без хардкода ID. После создания виджеты можно редактировать в конструкторе.
 */
final class BlagoqrMigratedSiteWidgetsService
{
    public function __construct(
        private readonly WidgetDataService $widgetDataService
    ) {}

    /**
     * Создать виджеты для сайта по пресету.
     *
     * @param  array<string, mixed>  $preset  Ключи: template, positions (массив с position_slug, widgets)
     * @return array{created: int, skipped: int, errors: array<int, string>}
     */
    public function seedFromPreset(Site $site, array $preset = null): array
    {
        $preset = $preset ?? config('blagoqr_site_preset', []);
        if (empty($preset['positions']) || ! is_array($preset['positions'])) {
            return ['created' => 0, 'skipped' => 0, 'errors' => []];
        }

        $template = $this->resolveTemplate($preset['template'] ?? $site->template);
        if (! $template) {
            return ['created' => 0, 'skipped' => 0, 'errors' => ['Шаблон не найден: ' . ($preset['template'] ?? $site->template)]];
        }

        // Загружаем данные из WP для обогащения конфигов виджетов
        $wpContext = $this->loadWpContext($site);

        $created = 0;
        $skipped = 0;
        $errors = [];

        foreach ($preset['positions'] as $positionBlock) {
            $positionSlug = $positionBlock['position_slug'] ?? null;
            $widgets = $positionBlock['widgets'] ?? [];
            if (! $positionSlug || ! is_array($widgets)) {
                continue;
            }

            $position = $this->resolvePosition($template, $positionSlug);
            if (! $position) {
                $errors[] = "Позиция не найдена: {$positionSlug}";
                continue;
            }

            foreach ($widgets as $index => $widgetSpec) {
                $widgetSlug = $widgetSpec['widget_slug'] ?? null;
                if (! $widgetSlug) {
                    continue;
                }

                $widgetModel = Widget::where('widget_slug', $widgetSlug)->where('is_active', true)->first();
                if (! $widgetModel) {
                    $errors[] = "Виджет не найден или неактивен: {$widgetSlug}";
                    continue;
                }

                $name = $widgetSpec['name'] ?? $widgetModel->name;
                $order = isset($widgetSpec['order']) ? (int) $widgetSpec['order'] : $index;

                $existing = SiteWidget::where('site_id', $site->id)
                    ->where('position_id', $position->id)
                    ->where('widget_id', $widgetModel->id)
                    ->first();
                if ($existing) {
                    // Виджет уже существует - обновляем конфиг если нужно (например, для share_buttons)
                    if ($widgetSlug === 'share_buttons') {
                        $config = $widgetSpec['config'] ?? [];
                        $config = $this->enrichConfigFromWp($widgetSlug, $name, $config, $wpContext);
                        if (! empty($config) && isset($config['counts'])) {
                            $existingConfig = $existing->config ?? [];
                            $existingConfig['counts'] = $config['counts'];
                            $existing->syncConfig($existingConfig);
                        }
                    }
                    $skipped++;
                    continue;
                }

                try {
                    $siteWidget = $this->createSiteWidget($site, $widgetModel, $position, $name, $order);
                    $config = $widgetSpec['config'] ?? [];

                    // Обогащаем конфиг данными из WP (баннер, шаринг и т.п.)
                    $config = $this->enrichConfigFromWp($widgetSlug, $name, $config, $wpContext);

                    if (! empty($config)) {
                        $this->applyWidgetConfig($siteWidget, $widgetSlug, $config, $site);
                    }
                    $created++;
                } catch (\Throwable $e) {
                    $errors[] = "Виджет {$widgetSlug}: " . $e->getMessage();
                }
            }
        }

        if ($created > 0 && $site->id) {
            \Illuminate\Support\Facades\Cache::forget("site_widgets_config_{$site->id}");
        }

        return ['created' => $created, 'skipped' => $skipped, 'errors' => $errors];
    }

    private function resolveTemplate(?string $slug): ?SiteTemplate
    {
        $template = $slug
            ? SiteTemplate::where('slug', $slug)->where('is_active', true)->first()
            : null;

        return $template ?? SiteTemplate::where('is_active', true)->orderBy('id')->first();
    }

    private function resolvePosition(SiteTemplate $template, string $positionSlug): ?WidgetPosition
    {
        return WidgetPosition::where('slug', $positionSlug)
            ->where(function ($q) use ($template) {
                $q->where('template_id', $template->id)->orWhereNull('template_id');
            })
            ->where('is_active', true)
            ->orderByRaw('template_id IS NOT NULL DESC')
            ->first();
    }

    private function createSiteWidget(Site $site, Widget $widget, WidgetPosition $position, string $name, int $order): SiteWidget
    {
        return DB::transaction(function () use ($site, $widget, $position, $name, $order) {
            return SiteWidget::create([
                'site_id' => $site->id,
                'widget_id' => $widget->id,
                'position_id' => $position->id,
                'name' => $name,
                'position_name' => $position->name,
                'position_slug' => $position->slug,
                'widget_slug' => $widget->widget_slug,
                'order' => $order,
                'sort_order' => $order,
                'is_active' => true,
                'is_visible' => true,
            ]);
        });
    }

    private function applyWidgetConfig(SiteWidget $siteWidget, string $widgetSlug, array $config, Site $site): void
    {
        switch ($widgetSlug) {
            case 'menu':
                if (isset($config['items']) && is_array($config['items'])) {
                    $this->widgetDataService->saveMenuItems($siteWidget, $config['items']);
                }
                break;
            case 'donation':
                // Сохраняем основные настройки в donation_settings таблицу
                $this->widgetDataService->saveDonationSettings($siteWidget, $config);

                // Дополнительные ключи (allowRecurring, requireName, etc.)
                // сохраняем через syncConfig — они читаются фронтом из widget.config
                $extraKeys = [
                    'show_title', 'showProgress', 'show_target_amount', 'show_collected_amount',
                    'allowRecurring', 'recurringPeriods',
                    'requireName', 'requirePhone', 'requireEmail',
                    'allowAnonymous', 'showMessageField',
                ];
                $extraConfig = [];
                foreach ($extraKeys as $key) {
                    if (array_key_exists($key, $config)) {
                        $extraConfig[$key] = $config[$key];
                    }
                }
                if (! empty($extraConfig)) {
                    $siteWidget->syncConfig($extraConfig);
                }
                break;
            case 'donations_list':
                $this->widgetDataService->saveDonationsListSettings($siteWidget, [
                    'items_per_page' => $config['items_per_page'] ?? 20,
                    'title' => $config['title'] ?? null,
                    'description' => $config['description'] ?? null,
                    'sort_by' => $config['sort_by'] ?? 'created_at',
                    'sort_direction' => $config['sort_direction'] ?? 'desc',
                    'show_amount' => $config['show_amount'] ?? true,
                    'show_donor_name' => $config['show_donor_name'] ?? true,
                    'show_date' => $config['show_date'] ?? true,
                    'show_message' => $config['show_message'] ?? false,
                    'show_anonymous' => $config['show_anonymous'] ?? true,
                    'display_options' => $config['display_options'] ?? null,
                ]);
                break;
            default:
                if (! empty($config)) {
                    $siteWidget->syncConfig($config);
                }
                break;
        }
    }

    // ─────────────────── WP-контекст и обогащение конфигов ───────────────────

    /**
     * Загрузить контекст из WP миграции: организация, маппинг, проекты, wp_options.
     */
    private function loadWpContext(Site $site): array
    {
        $ctx = [
            'org' => null,
            'mapping' => null,
            'wp_options' => [],
            'domain' => null,
            'org_name' => '',
            'main_project' => null,
            'total_collected' => 0,
            'total_target' => 0,
        ];

        $org = $site->organization_id ? Organization::find($site->organization_id) : null;
        if (! $org) {
            return $ctx;
        }
        $ctx['org'] = $org;
        $ctx['org_name'] = $org->name ?? '';

        $mapping = DB::table('blagoqr_import_site_mappings')
            ->where('organization_id', $org->id)
            ->first();
        if ($mapping) {
            $ctx['mapping'] = $mapping;
            $ctx['domain'] = $mapping->domain ?? null;
            $wpOpts = json_decode($mapping->wp_options ?? '{}', true);
            $ctx['wp_options'] = is_array($wpOpts) ? $wpOpts : [];
        }

        // Главный (первый активный) проект организации → данные для баннера
        $mainProject = Project::where('organization_id', $org->id)
            ->where('status', 'active')
            ->orderBy('id')
            ->first();
        if ($mainProject) {
            $ctx['main_project'] = $mainProject;
        }

        // Суммарно по организации
        $ctx['total_collected'] = (int) Project::where('organization_id', $org->id)->sum('collected_amount');
        $ctx['total_target'] = (int) Project::where('organization_id', $org->id)->sum('target_amount');

        return $ctx;
    }

    /**
     * Обновить счётчики у существующих виджетов share_buttons из wp_options.
     *
     * @return int Количество обновлённых виджетов
     */
    public function updateShareButtonsCountsFromWpOptions(int $organizationId): int
    {
        $mapping = DB::table('blagoqr_import_site_mappings')
            ->where('organization_id', $organizationId)
            ->first();

        if (! $mapping || ! ($siteId = $mapping->migrated_site_id ?? null)) {
            Log::warning('BlagoqrMigratedSiteWidgetsService::updateShareButtonsCountsFromWpOptions - mapping or site_id not found', [
                'organization_id' => $organizationId,
                'has_mapping' => (bool) $mapping,
                'site_id' => $mapping->migrated_site_id ?? null,
            ]);

            return 0;
        }

        $wpOpts = json_decode($mapping->wp_options ?? '{}', true) ?: [];
        $shareCounts = $wpOpts['share_counts'] ?? null;

        if (! is_array($shareCounts)) {
            Log::warning('BlagoqrMigratedSiteWidgetsService::updateShareButtonsCountsFromWpOptions - share_counts not found in wp_options', [
                'organization_id' => $organizationId,
                'site_id' => $siteId,
                'wp_options_keys' => array_keys($wpOpts),
            ]);

            return 0;
        }

        $counts = [
            'whatsapp' => (int) ($shareCounts['whatsapp'] ?? 0),
            'telegram' => (int) ($shareCounts['telegram'] ?? 0),
            'vk' => (int) ($shareCounts['vk'] ?? 0),
        ];

        $widgets = SiteWidget::where('site_id', $siteId)
            ->where('widget_slug', 'share_buttons')
            ->get();

        if ($widgets->isEmpty()) {
            Log::warning('BlagoqrMigratedSiteWidgetsService::updateShareButtonsCountsFromWpOptions - no share_buttons widgets found', [
                'organization_id' => $organizationId,
                'site_id' => $siteId,
            ]);

            return 0;
        }

        foreach ($widgets as $widget) {
            $config = $widget->config ?? [];
            $config['counts'] = $counts;
            $widget->syncConfig($config);

            Log::info('BlagoqrMigratedSiteWidgetsService::updateShareButtonsCountsFromWpOptions - widget updated', [
                'widget_id' => $widget->id,
                'site_id' => $siteId,
                'counts' => $counts,
            ]);
        }

        return $widgets->count();
    }

    /**
     * Обогатить конфиг виджета данными из WP (баннер HTML, шаринг-текст и счётчики).
     */
    private function enrichConfigFromWp(string $widgetSlug, string $widgetName, array $config, array $ctx): array
    {
        // Баннер HTML — заполняем из данных проекта
        if ($widgetSlug === 'html' && stripos($widgetName, 'баннер') !== false) {
            $bannerHtml = $this->buildBannerHtml($ctx);
            if ($bannerHtml) {
                $config['htmlContent'] = $bannerHtml;
            }
        }

        // Кнопки «Поделиться» — share_text, share_url, counts из WP
        if ($widgetSlug === 'share_buttons') {
            $wpOpts = $ctx['wp_options'] ?? [];

            // share_text из wp_options → options_text_socials_share или из первого проекта
            $shareText = $wpOpts['options_text_socials_share'] ?? '';
            if (! $shareText && ! empty($ctx['org_name'])) {
                $shareText = $ctx['org_name'];
            }
            if ($shareText) {
                $config['share_text'] = $shareText;
            }

            // share_url — домен из маппинга
            if (! empty($ctx['domain'])) {
                $config['share_url'] = 'https://' . ltrim($ctx['domain'], 'https://');
            }

            // Счётчики: пытаемся достать из wp_options (ключ share_counts)
            $shareCounts = $wpOpts['share_counts'] ?? null;
            if (is_array($shareCounts)) {
                $config['counts'] = [
                    'whatsapp' => (int) ($shareCounts['whatsapp'] ?? 0),
                    'telegram' => (int) ($shareCounts['telegram'] ?? 0),
                    'vk' => (int) ($shareCounts['vk'] ?? 0),
                ];
            }
        }

        return $config;
    }

    /**
     * Сгенерировать HTML баннера с прогрессом сбора.
     */
    private function buildBannerHtml(array $ctx): string
    {
        $project = $ctx['main_project'] ?? null;
        $orgName = $ctx['org_name'] ?? '';

        if (! $project && ! $orgName) {
            return '';
        }

        $title = $project ? ($project->title ?? $orgName) : $orgName;
        $targetRaw = $project ? (int) ($project->target_amount ?? 0) : ($ctx['total_target'] ?? 0);
        $collectedRaw = $project ? (int) ($project->collected_amount ?? 0) : ($ctx['total_collected'] ?? 0);

        // Суммы в копейках → рубли
        $target = $targetRaw > 0 ? $targetRaw / 100 : 0;
        $collected = $collectedRaw > 0 ? $collectedRaw / 100 : 0;
        $remaining = max($target - $collected, 0);
        $percent = $target > 0 ? min(round(($collected / $target) * 100), 100) : 0;

        $fmtCollected = number_format($collected, 0, '.', "\u{00A0}");
        $fmtTarget = number_format($target, 0, '.', "\u{00A0}");
        $fmtRemaining = number_format($remaining, 0, '.', "\u{00A0}");

        $imageUrl = '';
        if ($project && $project->image) {
            $imageUrl = $project->image;
        }

        $bgStyle = $imageUrl
            ? "background-image:url('{$imageUrl}'); background-size:cover; background-position:center;"
            : 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);';

        $titleEsc = e($title);

        return <<<HTML
<div class="fundraising-banner" style="position:relative; border-radius:12px; overflow:hidden; color:#fff; padding:2rem; min-height:280px; {$bgStyle}">
  <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);"></div>
  <div style="position:relative;z-index:1;">
    <h3 style="font-size:1.35rem;font-weight:700;margin-bottom:1.25rem;line-height:1.3;">{$titleEsc}</h3>
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;margin-bottom:1rem;">
      <div>
        <div style="font-size:0.75rem;text-transform:uppercase;opacity:0.8;">Цель</div>
        <div style="font-size:1.25rem;font-weight:700;">{$fmtTarget}&nbsp;₽</div>
      </div>
      <div>
        <div style="font-size:0.75rem;text-transform:uppercase;opacity:0.8;">Осталось собрать</div>
        <div style="font-size:1.25rem;font-weight:700;">{$fmtRemaining}&nbsp;₽</div>
      </div>
    </div>
    <div style="margin-bottom:0.5rem;">
      <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px;">
        <span>Собрано</span><span>Нужно</span>
      </div>
      <div style="height:10px;background:rgba(255,255,255,0.25);border-radius:5px;overflow:hidden;">
        <div style="height:100%;width:{$percent}%;background:#4ade80;border-radius:5px;transition:width .6s;"></div>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:0.85rem;margin-top:4px;">
        <span>{$fmtCollected}&nbsp;₽</span><span>{$fmtTarget}&nbsp;₽</span>
      </div>
    </div>
    <div style="text-align:center;font-size:2rem;font-weight:800;margin:0.5rem 0;">{$percent}%</div>
  </div>
</div>
HTML;
    }
}
