<?php

namespace App\Services;

use App\Models\Site;

class SiteSeoService
{
  /**
   * Обновляет seo_config сайта, заполняя отсутствующие значения на основе
   * названия и описания сайта. Ничего не перезатирает, если поле уже заполнено.
   * Возвращает актуальный seo_config (после возможного обновления).
   */
  public function ensureSeoDefaults(Site $site): array
  {
    $seoConfig = $site->seo_config ?? [];

    $updates = $this->buildDefaultsFromSite($site, $seoConfig);
    if (!empty($updates)) {
      $site->update(['seo_config' => array_merge($seoConfig, $updates)]);
      return array_merge($seoConfig, $updates);
    }

    return $seoConfig;
  }

  /**
   * Принимает входящие SEO поля, дополняет их дефолтами на основе сайта,
   * не перезатирая уже переданные, и возвращает итоговый массив для записи.
   */
  public function applyDefaultsToIncoming(Site $site, array $incoming): array
  {
    $existing = $site->seo_config ?? [];
    $incomingFilled = $this->fillIncomingWithDefaults($site, $incoming);

    return array_merge($existing, $incomingFilled);
  }

  /**
   * Строит недостающие поля, основываясь на названии/описании сайта и текущем seo_config.
   * Возвращает только те ключи, которые нужно добавить.
   */
  private function buildDefaultsFromSite(Site $site, array $currentSeo): array
  {
    $name = (string) ($site->name ?? '');
    $desc = (string) ($site->description ?? '');

    $updates = [];

    if (empty($currentSeo['seo_title']) && $name !== '') {
      $updates['seo_title'] = $this->truncate($name, 60);
    }

    if (empty($currentSeo['seo_description'])) {
      $defaultDescription = $desc !== '' ? $desc : ('Официальный сайт ' . $name);
      $updates['seo_description'] = $this->truncate($defaultDescription, 160);
    }

    if (empty($currentSeo['seo_keywords']) && $name !== '') {
      $updates['seo_keywords'] = $this->generateKeywordsFromName($name);
    }

    if (empty($currentSeo['og_title']) && !empty($updates['seo_title'])) {
      $updates['og_title'] = $updates['seo_title'];
    }
    if (empty($currentSeo['og_description']) && !empty($updates['seo_description'])) {
      $updates['og_description'] = $updates['seo_description'];
    }
    if (empty($currentSeo['og_type'])) {
      $updates['og_type'] = 'website';
    }

    if (empty($currentSeo['twitter_title']) && !empty($updates['seo_title'])) {
      $updates['twitter_title'] = $updates['seo_title'];
    }
    if (empty($currentSeo['twitter_description']) && !empty($updates['seo_description'])) {
      $updates['twitter_description'] = $updates['seo_description'];
    }
    if (empty($currentSeo['twitter_card'])) {
      $updates['twitter_card'] = 'summary_large_image';
    }

    return $updates;
  }

  /**
   * Дополняет входящие поля дефолтами на основе сайта (если пусто).
   */
  private function fillIncomingWithDefaults(Site $site, array $incoming): array
  {
    $name = (string) ($site->name ?? '');
    $desc = (string) ($site->description ?? '');

    // Заголовок
    if (!array_key_exists('seo_title', $incoming) || trim((string) $incoming['seo_title']) === '') {
      $incoming['seo_title'] = $this->truncate($name, 60);
    } else {
      $incoming['seo_title'] = $this->truncate((string) $incoming['seo_title'], 60);
    }

    // Описание
    if (!array_key_exists('seo_description', $incoming) || trim((string) $incoming['seo_description']) === '') {
      $incoming['seo_description'] = $this->truncate($desc !== '' ? $desc : ('Официальный сайт ' . $name), 160);
    } else {
      $incoming['seo_description'] = $this->truncate((string) $incoming['seo_description'], 160);
    }

    // Ключевые слова
    if (!array_key_exists('seo_keywords', $incoming) || trim((string) $incoming['seo_keywords']) === '') {
      $incoming['seo_keywords'] = $this->generateKeywordsFromName($name);
    } else {
      // Нормализуем пробелы и обрезаем длину
      $incoming['seo_keywords'] = $this->truncate(trim((string) $incoming['seo_keywords']), 255);
    }

    // Open Graph
    if (!array_key_exists('og_title', $incoming) || trim((string) $incoming['og_title']) === '') {
      $incoming['og_title'] = $incoming['seo_title'];
    } else {
      $incoming['og_title'] = $this->truncate((string) $incoming['og_title'], 100);
    }
    if (!array_key_exists('og_description', $incoming) || trim((string) $incoming['og_description']) === '') {
      $incoming['og_description'] = $incoming['seo_description'];
    } else {
      $incoming['og_description'] = $this->truncate((string) $incoming['og_description'], 200);
    }
    if (!array_key_exists('og_type', $incoming) || trim((string) $incoming['og_type']) === '') {
      $incoming['og_type'] = 'website';
    }

    // Twitter
    if (!array_key_exists('twitter_title', $incoming) || trim((string) $incoming['twitter_title']) === '') {
      $incoming['twitter_title'] = $incoming['seo_title'];
    } else {
      $incoming['twitter_title'] = $this->truncate((string) $incoming['twitter_title'], 100);
    }
    if (!array_key_exists('twitter_description', $incoming) || trim((string) $incoming['twitter_description']) === '') {
      $incoming['twitter_description'] = $incoming['seo_description'];
    } else {
      $incoming['twitter_description'] = $this->truncate((string) $incoming['twitter_description'], 200);
    }
    if (!array_key_exists('twitter_card', $incoming) || trim((string) $incoming['twitter_card']) === '') {
      $incoming['twitter_card'] = 'summary_large_image';
    }

    // Ограничения на длину ссылок/изображений
    if (array_key_exists('og_image', $incoming)) {
      $incoming['og_image'] = $this->truncate((string) $incoming['og_image'], 500);
    }
    if (array_key_exists('twitter_image', $incoming)) {
      $incoming['twitter_image'] = $this->truncate((string) $incoming['twitter_image'], 500);
    }

    return $incoming;
  }

  private function truncate(?string $value, int $limit): string
  {
    $v = (string) ($value ?? '');
    $v = trim(preg_replace('/\s+/', ' ', strip_tags($v)) ?? '');
    if (mb_strlen($v) <= $limit) {
      return $v;
    }
    $cut = mb_substr($v, 0, $limit);
    $lastSpace = mb_strrpos($cut, ' ');
    if ($lastSpace !== false && $lastSpace > 20) {
      $cut = mb_substr($cut, 0, $lastSpace);
    }
    return rtrim($cut, " ,.;:-—") . '…';
  }

  private function generateKeywordsFromName(string $name): string
  {
    $words = preg_split('/[^\p{L}\p{N}]+/u', mb_strtolower($name), -1, PREG_SPLIT_NO_EMPTY) ?: [];
    $unique = array_values(array_unique(array_filter($words, static fn($w) => mb_strlen($w) > 2)));
    $keywords = implode(', ', array_slice($unique, 0, 10));
    return $this->truncate($keywords, 255);
  }
}
