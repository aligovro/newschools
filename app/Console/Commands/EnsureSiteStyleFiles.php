<?php

namespace App\Console\Commands;

use App\Models\Site;
use App\Services\SiteStylesService;
use Illuminate\Console\Command;

class EnsureSiteStyleFiles extends Command
{
    protected $signature = 'sites:ensure-style-files {--dry-run : Не создавать файлы, только показать}';

    protected $description = 'Создать файлы стилей для сайтов, у которых их ещё нет';

    public function handle(SiteStylesService $service): int
    {
        $dryRun = $this->option('dry-run');
        $sites = Site::all();

        $created = 0;
        foreach ($sites as $site) {
            if ($site->isMainSite()) {
                continue;
            }
            if (!$service->hasStylesFile($site->id)) {
                $path = $service->getStylesRelativePath($site->id);
                if (!$dryRun) {
                    $service->createStylesFile($site);
                }
                $this->line("  [{$site->id}] {$site->name} → {$path}");
                $created++;
            }
        }

        if ($created > 0) {
            $this->info($dryRun
                ? "Найдено {$created} сайтов без файла стилей. Запустите без --dry-run для создания."
                : "Создано {$created} файлов стилей."
            );
        } else {
            $this->info('Все сайты уже имеют файлы стилей.');
        }

        return 0;
    }
}
