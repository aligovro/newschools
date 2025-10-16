<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\SiteWidgetHeroSlide;
use Illuminate\Support\Facades\DB;

class MigrateImageUrls extends Command
{
  protected $signature = 'migrate:image-urls';
  protected $description = 'Migrate full image URLs to relative paths in hero slides';

  public function handle()
  {
    $this->info('Starting image URL migration...');

    $slides = SiteWidgetHeroSlide::where('background_image', 'like', 'http%')->get();

    $this->info("Found {$slides->count()} slides with full URLs");

    $updated = 0;

    foreach ($slides as $slide) {
      $oldUrl = $slide->background_image;

      // Извлекаем только путь к файлу
      if (preg_match('/\/storage\/(.+)$/', $oldUrl, $matches)) {
        $newPath = $matches[1];
        $slide->background_image = $newPath;
        $slide->save();

        $updated++;
        $this->line("Updated slide {$slide->id}: {$oldUrl} -> {$newPath}");
      }
    }

    $this->info("Migration completed. Updated {$updated} slides.");

    return 0;
  }
}
