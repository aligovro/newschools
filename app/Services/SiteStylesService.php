<?php

namespace App\Services;

use App\Models\Site;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use ScssPhp\ScssPhp\Compiler;

class SiteStylesService
{
    /**
     * Каталог файлов стилей сайтов: storage/app/site-styles/
     * Вне resources/ — не попадает в npm run build. Каждый сайт получает только свой CSS.
     */
    private string $sitesDir;

    public function __construct()
    {
        $dir = config('sites.styles.dir', 'site-styles');

        $this->sitesDir = storage_path('app/' . $dir);
    }

    /**
     * Безопасное имя файла: только site{id}_styles.scss
     */
    public function getStylesFilename(int $siteId): string
    {
        return "site{$siteId}_styles.scss";
    }

    /**
     * Полный путь к файлу стилей сайта
     */
    public function getStylesPath(int $siteId): string
    {
        return $this->sitesDir . '/' . $this->getStylesFilename($siteId);
    }

    /**
     * Путь для отображения в админке (относительно корня проекта)
     */
    public function getStylesRelativePath(int $siteId): string
    {
        return 'storage/app/' . config('sites.styles.dir', 'site-styles') . '/' . $this->getStylesFilename($siteId);
    }

    /**
     * Проверяет, что путь — именно наш файл стилей (защита от path traversal)
     */
    public function isOwnStylesFile(int $siteId, string $path): bool
    {
        $expected = $this->getStylesPath($siteId);

        return realpath($path) === realpath($expected);
    }

    /** Ранее использовавшийся каталог (для миграции) */
    private function getLegacyPath(int $siteId): string
    {
        return resource_path('css/sites/' . $this->getStylesFilename($siteId));
    }

    /**
     * Создать файл стилей при создании сайта.
     * Мигрирует из resources/css/sites/ если файл там ещё есть.
     */
    public function createStylesFile(Site $site): bool
    {
        $path = $this->getStylesPath($site->id);

        if (File::exists($path)) {
            return true;
        }

        if (!File::isDirectory($this->sitesDir)) {
            File::makeDirectory($this->sitesDir, 0755, true);
        }

        $legacy = $this->getLegacyPath($site->id);
        if (File::exists($legacy)) {
            return File::move($legacy, $path);
        }

        $content = <<<SCSS
// Кастомные стили для сайта: {$site->name} (ID: {$site->id})
// Редактируйте этот файл — изменения применятся после обновления страницы (без npm run build)
// Селекторы автоматически получают повышенную специфичность (html body .site-preview)

.block__title {
  // color: #3B82F6;
}

SCSS;

        return File::put($path, $content) !== false;
    }

    /**
     * Удалить файл стилей при удалении сайта.
     * Удаляет только файл именно этого сайта.
     */
    public function deleteStylesFile(Site $site): bool
    {
        $path = $this->getStylesPath($site->id);

        if (!File::exists($path)) {
            return true;
        }

        if (!$this->isOwnStylesFile($site->id, $path)) {
            return false;
        }

        return File::delete($path);
    }

    /**
     * Есть ли файл стилей у сайта
     */
    public function hasStylesFile(int $siteId): bool
    {
        return File::exists($this->getStylesPath($siteId));
    }

    /**
     * URL для подключения CSS с cache-busting по mtime (обычное F5 обновляет стили)
     */
    public function getStylesCssUrl(int $siteId): ?string
    {
        $path = $this->getStylesPath($siteId);

        if (!File::exists($path)) {
            return null;
        }

        $mtime = File::lastModified($path);

        return route('site-css.show', $siteId) . '?v=' . $mtime;
    }

    /**
     * Скомпилировать SCSS в CSS (с кешированием по mtime файла)
     */
    public function getCompiledCss(int $siteId): ?string
    {
        $path = $this->getStylesPath($siteId);

        if (!File::exists($path)) {
            return null;
        }

        $mtime = File::lastModified($path);
        $cacheKey = "site_styles_compiled_v2_{$siteId}_{$mtime}";

        return Cache::remember($cacheKey, 86400, function () use ($path) {
            $content = File::get($path);

            if (trim($content) === '') {
                return '';
            }

            try {
                $compiler = new Compiler();
                // html body — повышает специфичность без поломки селекторов .site-type--organization
                // (корневой div имеет site-preview и site-type--organization на одном элементе)
                $wrapped = "html body {\n" . $content . "\n}";

                return $compiler->compileString($wrapped)->getCss();
            } catch (\Throwable $e) {
                return "/* SCSS compilation error: " . $e->getMessage() . " */";
            }
        });
    }

}
