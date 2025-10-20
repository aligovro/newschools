<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CleanImagePaths extends Command
{
  /**
   * The name and signature of the console command.
   *
   * @var string
   */
  protected $signature = 'images:clean-paths';

  /**
   * The console command description.
   *
   * @var string
   */
  protected $description = 'Clean /storage/ prefixes from image paths in database';

  /**
   * Execute the console command.
   */
  public function handle()
  {
    $this->info('Cleaning image paths...');

    // Очищаем hero_slides
    $heroSlidesUpdated = DB::table('hero_slides')
      ->where('background_image', 'like', '/storage/%')
      ->update([
        'background_image' => DB::raw("SUBSTRING(background_image, 10)") // Убираем '/storage/'
      ]);

    $this->info("Updated {$heroSlidesUpdated} hero slides");

    // Очищаем slider_slides
    $sliderSlidesUpdated = DB::table('slider_slides')
      ->where('background_image', 'like', '/storage/%')
      ->update([
        'background_image' => DB::raw("SUBSTRING(background_image, 10)") // Убираем '/storage/'
      ]);

    $this->info("Updated {$sliderSlidesUpdated} slider slides");

    // Очищаем gallery_images
    $galleryImagesUpdated = DB::table('gallery_images')
      ->where('image_path', 'like', '/storage/%')
      ->update([
        'image_path' => DB::raw("SUBSTRING(image_path, 10)") // Убираем '/storage/'
      ]);

    $this->info("Updated {$galleryImagesUpdated} gallery images");

    $this->info('Image paths cleaned successfully!');
  }
}
