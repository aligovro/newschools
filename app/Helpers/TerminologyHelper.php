<?php

namespace App\Helpers;

use App\Services\GlobalSettingsService;

class TerminologyHelper
{
  private static $service;

  /**
   * Получить сервис настроек
   */
  private static function getService(): GlobalSettingsService
  {
    if (!self::$service) {
      self::$service = app(GlobalSettingsService::class);
    }

    return self::$service;
  }

  /**
   * Получить текст с правильной терминологией
   */
  public static function text(string $key, array $params = []): string
  {
    return self::getService()->getText($key, $params);
  }

  /**
   * Получить правильную форму организации для числа
   */
  public static function organization(int $count): string
  {
    return self::getService()->getOrganizationForm($count);
  }

  /**
   * Получить правильную форму члена для числа
   */
  public static function member(int $count): string
  {
    return self::getService()->getMemberForm($count);
  }

  /**
   * Получить терминологию
   */
  public static function terminology(): array
  {
    return self::getService()->getTerminology();
  }

  /**
   * Получить настройки системы
   */
  public static function system(): array
  {
    return self::getService()->getSystemSettings();
  }

  /**
   * Проверить включена ли функция
   */
  public static function isFeatureEnabled(string $feature): bool
  {
    return self::getService()->isFeatureEnabled($feature);
  }

  /**
   * Получить настройку системы
   */
  public static function systemSetting(string $key, $default = null)
  {
    return self::getService()->getSystemSetting($key, $default);
  }

  /**
   * Быстрые методы для часто используемых терминов
   */
  public static function orgSingular(): string
  {
    return self::terminology()['organization']['singular'];
  }

  public static function orgPlural(): string
  {
    return self::terminology()['organization']['plural'];
  }

  public static function orgGenitive(): string
  {
    return self::terminology()['organization']['genitive'];
  }

  public static function memberSingular(): string
  {
    return self::terminology()['member']['singular'];
  }

  public static function memberPlural(): string
  {
    return self::terminology()['member']['plural'];
  }

  public static function memberGenitive(): string
  {
    return self::terminology()['member']['genitive'];
  }

  public static function actionJoin(): string
  {
    return self::terminology()['actions']['join'];
  }

  public static function actionLeave(): string
  {
    return self::terminology()['actions']['leave'];
  }

  public static function actionSupport(): string
  {
    return self::terminology()['actions']['support'];
  }

  /**
   * Получить название системы
   */
  public static function systemName(): string
  {
    return self::system()['name'];
  }

  /**
   * Получить описание системы
   */
  public static function systemDescription(): string
  {
    return self::system()['description'];
  }
}
