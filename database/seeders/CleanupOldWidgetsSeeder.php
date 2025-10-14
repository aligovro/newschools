<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Widget;

class CleanupOldWidgetsSeeder extends Seeder
{
  /**
   * Удаляет устаревшие виджеты
   */
  public function run(): void
  {
    $oldWidgetSlugs = [
      'contact',          // Заменен на универсальный виджет формы
      'contact_form',     // Заменен на универсальный виджет формы
      'contacts',         // Заменен на универсальный виджет формы
      'footer-contacts',  // Заменен на универсальный виджет формы
      'header-menu',      // Заменен на универсальный виджет menu
      'hero-slider',      // Объединен с hero
    ];

    $count = Widget::whereIn('slug', $oldWidgetSlugs)->delete();

    $this->command->info("Удалено устаревших виджетов: {$count}");
  }
}
