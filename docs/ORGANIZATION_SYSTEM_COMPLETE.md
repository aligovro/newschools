# Полная система управления организациями

## Обзор

Система управления организациями теперь включает в себя полный набор инструментов для управления всеми аспектами деятельности организации, включая настройки сайта, консоль управления, платежи, редактор главной страницы, Telegram бота, отчетность и интеграцию с ЮKassa.

## Компоненты системы

### 1. Консоль управления организацией

**Контроллер:** `OrganizationConsoleController`
**Маршруты:** `/organization/{organization}/admin/console/*`

#### Функциональность:

- Главная панель с ключевыми метриками
- Статистика по доходам, участникам и проектам
- Системные уведомления и рекомендации
- Быстрые действия для администраторов
- Аналитика в реальном времени

#### Методы:

- `index()` - Главная консоль
- `statistics()` - Детальная статистика
- `revenue()` - Анализ доходов
- `members()` - Анализ участников
- `projects()` - Анализ проектов
- `notifications()` - Системные уведомления
- `quickAction()` - Быстрые действия

### 2. Настройки организации

**Контроллер:** `OrganizationSettingsController`
**Маршруты:** `/organization/{organization}/admin/settings/*`

#### Функциональность:

- Общие настройки организации
- Настройки сайта (тема, цвета, шрифты)
- Настройки платежей
- Настройки уведомлений
- Интеграционные настройки
- Импорт/экспорт настроек

#### Методы:

- `updateGeneral()` - Общие настройки
- `updateSiteSettings()` - Настройки сайта
- `updatePaymentSettings()` - Настройки платежей
- `updateNotificationSettings()` - Настройки уведомлений
- `updateIntegrationSettings()` - Интеграционные настройки
- `testTelegramBot()` - Тестирование Telegram бота
- `exportSettings()` - Экспорт настроек
- `importSettings()` - Импорт настроек
- `resetToDefaults()` - Сброс к умолчанию

### 3. Система платежей

**Контроллер:** `OrganizationPaymentsController`
**Маршруты:** `/organization/{organization}/admin/payments/*`

#### Функциональность:

- Управление транзакциями
- Создание платежей
- Обработка webhook от ЮKassa
- Возвраты платежей
- Экспорт данных
- Настройки платежной системы
- Тестирование платежей

#### Методы:

- `index()` - Главная страница платежей
- `transactions()` - Список транзакций
- `createPayment()` - Создание платежа
- `yookassaWebhook()` - Webhook ЮKassa
- `refund()` - Возврат платежа
- `export()` - Экспорт данных
- `settings()` - Настройки платежей
- `testPayment()` - Тестовый платеж

### 4. Редактор главной страницы

**Контроллер:** `OrganizationHomepageController`
**Маршруты:** `/organization/{organization}/admin/homepage/*`

#### Функциональность:

- Визуальный редактор главной страницы
- Система компонентов
- Готовые шаблоны
- Предварительный просмотр
- Загрузка изображений
- Управление контентом

#### Методы:

- `index()` - Редактор главной страницы
- `updateContent()` - Обновление контента
- `updateComponents()` - Обновление компонентов
- `addComponent()` - Добавление компонента
- `removeComponent()` - Удаление компонента
- `reorderComponents()` - Изменение порядка компонентов
- `applyTemplate()` - Применение шаблона
- `preview()` - Предварительный просмотр
- `uploadImage()` - Загрузка изображений

### 5. Telegram бот

**Контроллер:** `OrganizationTelegramController`
**Маршруты:** `/organization/{organization}/admin/telegram/*`

#### Функциональность:

- Настройка Telegram бота
- Отправка уведомлений
- Обработка webhook
- Статистика бота
- Тестирование сообщений

#### Методы:

- `index()` - Настройки Telegram
- `setupBot()` - Настройка бота
- `sendTestMessage()` - Тестовое сообщение
- `sendDonationNotification()` - Уведомление о пожертвовании
- `getBotStats()` - Статистика бота
- `setupWebhook()` - Настройка webhook
- `handleWebhook()` - Обработка webhook

### 6. Система отчетности

**Контроллер:** `OrganizationReportsController`
**Маршруты:** `/organization/{organization}/admin/reports/*`

#### Функциональность:

- Отчеты по доходам
- Отчеты по участникам
- Отчеты по проектам
- Комплексные отчеты
- Экспорт в различные форматы
- Аналитические данные

#### Методы:

- `index()` - Главная страница отчетов
- `generateRevenueReport()` - Отчет по доходам
- `generateMembersReport()` - Отчет по участникам
- `generateProjectsReport()` - Отчет по проектам
- `generateComprehensiveReport()` - Комплексный отчет
- `exportReport()` - Экспорт отчета

### 7. Интеграция с ЮKassa

**Сервис:** `YooKassaService`
**Конфигурация:** `config/payments.php`

#### Функциональность:

- Создание платежей
- Проверка статуса платежей
- Отмена платежей
- Создание возвратов
- Обработка webhook
- Валидация настроек

#### Методы:

- `createPayment()` - Создание платежа
- `getPaymentStatus()` - Статус платежа
- `cancelPayment()` - Отмена платежа
- `createRefund()` - Создание возврата
- `handleWebhook()` - Обработка webhook
- `validateOrganizationSettings()` - Валидация настроек

## Структура базы данных

### Таблица organization_settings (расширенная)

```sql
-- Основные настройки
theme VARCHAR(50)
primary_color VARCHAR(7)
secondary_color VARCHAR(7)
accent_color VARCHAR(7)
font_family VARCHAR(100)
dark_mode BOOLEAN
custom_css JSON
layout_config JSON

-- Расширенные настройки
advanced_layout_config JSON
seo_settings JSON
social_media_settings JSON
analytics_settings JSON
security_settings JSON
backup_settings JSON
external_integrations JSON
advanced_notification_settings JSON
theme_settings JSON
performance_settings JSON
settings_metadata JSON

-- Системные настройки
feature_flags JSON
integration_settings JSON
payment_settings JSON
notification_settings JSON
maintenance_mode BOOLEAN
maintenance_message TEXT
```

## Конфигурация

### config/payments.php

```php
return [
    'methods' => [
        'yookassa' => [
            'name' => 'ЮKassa',
            'enabled' => true,
            'test_mode' => env('YOOKASSA_TEST_MODE', true),
            'shop_id' => env('YOOKASSA_SHOP_ID'),
            'secret_key' => env('YOOKASSA_SECRET_KEY'),
            // ... другие настройки
        ],
    ],

    'defaults' => [
        'currency' => 'RUB',
        'min_amount' => 100,
        'max_amount' => 100000000,
        'timeout' => 30,
        'auto_capture' => true,
    ],

    'commissions' => [
        'organization' => [
            'fee_percentage' => 2.0,
            'fee_fixed' => 0,
        ],
    ],
];
```

## Middleware

### OrganizationAdminMiddleware

Проверяет права доступа к админ-панели организации:

```php
// Проверяет, является ли пользователь администратором организации
// или супер-администратором системы
```

## Маршруты

### Основные группы маршрутов:

```php
// Консоль управления
Route::prefix('organization/{organization}/admin/console')

// Настройки организации
Route::prefix('organization/{organization}/admin/settings')

// Платежи
Route::prefix('organization/{organization}/admin/payments')

// Редактор главной страницы
Route::prefix('organization/{organization}/admin/homepage')

// Telegram бот
Route::prefix('organization/{organization}/admin/telegram')

// Отчеты
Route::prefix('organization/{organization}/admin/reports')
```

## Безопасность

### Проверки доступа:

- Middleware `organization.admin` проверяет права администратора
- Валидация всех входящих данных
- Защита от CSRF атак
- Логирование всех критических операций

### Настройки безопасности:

- Шифрование чувствительных данных
- Ограничение частоты запросов
- Валидация webhook подписей
- Белый список IP для webhook

## Уведомления

### Типы уведомлений:

- Email уведомления
- Telegram уведомления
- SMS уведомления (опционально)
- Системные уведомления в админ-панели

### События для уведомлений:

- Новые пожертвования
- Регистрация участников
- Обновления проектов
- Системные ошибки
- Успешные/неуспешные платежи

## Аналитика

### Метрики:

- Доходы по периодам
- Количество участников
- Эффективность проектов
- Конверсия
- Retention rate
- Рост организации

### Отчеты:

- Ежедневные/еженедельные/ежемесячные
- По проектам
- По источникам трафика
- Комплексные отчеты

## Интеграции

### Поддерживаемые сервисы:

- ЮKassa (платежи)
- Telegram (уведомления)
- Google Analytics (аналитика)
- Yandex Metrika (аналитика)
- Facebook Pixel (реклама)

## Развертывание

### Требования:

- PHP 8.1+
- Laravel 11+
- MySQL 8.0+
- Redis (для кеширования)

### Переменные окружения:

```env
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
YOOKASSA_TEST_MODE=true
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

### Команды для развертывания:

```bash
php artisan migrate
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Мониторинг

### Логирование:

- Все платежные операции
- Ошибки интеграций
- Действия администраторов
- Системные события

### Мониторинг:

- Статус платежных систем
- Доступность webhook
- Производительность API
- Использование ресурсов

## Поддержка

### Документация:

- API документация
- Руководство администратора
- FAQ
- Примеры интеграций

### Техническая поддержка:

- Email поддержка
- Telegram поддержка
- Документация по API
- Примеры кода

---

Эта система предоставляет полный набор инструментов для управления организацией, от базовых настроек до сложной аналитики и интеграций с внешними сервисами.
