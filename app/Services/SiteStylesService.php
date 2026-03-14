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
     * URL для подключения per-site кастомного CSS.
     * Возвращает URL только если файл существует и содержит реальный CSS
     * (не только комментарии/пустые строки).
     * Шаблонный CSS (school.scss и др.) компилируется Vite — дублировать не нужно.
     */
    public function getStylesCssUrl(int $siteId): ?string
    {
        $path = $this->getStylesPath($siteId);

        if (!File::exists($path) || !$this->fileHasContent($path)) {
            return null;
        }

        return route('site-css.show', $siteId) . '?v=' . File::lastModified($path);
    }

    /**
     * Скомпилировать per-site кастомный SCSS в CSS.
     * Компилирует только файл конкретного сайта — шаблонные стили (school.scss и др.)
     * уже собраны Vite и грузятся через app.css, дублировать их не нужно.
     * Кастомный SCSS оборачивается в html body { } для повышенной специфичности.
     */
    public function getCompiledCss(int $siteId): ?string
    {
        $path = $this->getStylesPath($siteId);

        if (!File::exists($path) || !$this->fileHasContent($path)) {
            return null;
        }

        $mtime    = File::lastModified($path);
        $cacheKey = "site_styles_compiled_v4_{$siteId}_{$mtime}";

        return Cache::remember($cacheKey, 86400, function () use ($path) {
            $content = trim(File::get($path));
            $source  = "html body {\n{$content}\n}";

            try {
                $compiler = new Compiler();
                $compiler->setImportPaths([resource_path('css')]);
                return $compiler->compileString($source)->getCss();
            } catch (\Throwable $e) {
                return '/* SCSS compilation error: ' . $e->getMessage() . ' */';
            }
        });
    }

    /**
     * Проверяет, содержит ли файл реальный CSS (не только комментарии и пустые строки).
     */
    private function fileHasContent(string $path): bool
    {
        $content = File::get($path);
        // Убираем однострочные комментарии, блочные комментарии и пробелы
        $stripped = preg_replace('/\/\/[^\n]*/m', '', $content);
        $stripped = preg_replace('/\/\*.*?\*\//s', '', $stripped);
        return trim($stripped) !== '';
    }

}
