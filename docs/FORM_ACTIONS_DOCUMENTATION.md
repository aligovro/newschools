# Документация по экшенам форм

## Обзор

Экшены форм - это механизм обработки отправленных данных формы. После того как пользователь отправил форму, система автоматически выполняет настроенные экшены для обработки этих данных.

## Типы экшенов

### 1. Email уведомление 📧

Отправляет данные формы на указанные email адреса.

**Конфигурация:**

- `to` - массив email адресов получателей
- `subject` - тема письма
- `template` - шаблон письма (по умолчанию: `emails.form-submission`)

**Пример:**

```json
{
    "type": "email",
    "config": {
        "to": ["admin@example.com", "manager@example.com"],
        "subject": "Новая заявка с сайта",
        "template": "emails.form-submission"
    }
}
```

### 2. Webhook 🔗

Отправляет данные формы на внешний URL.

**Конфигурация:**

- `url` - URL для отправки данных
- `method` - HTTP метод (POST, PUT, PATCH)
- `headers` - дополнительные заголовки
- `timeout` - таймаут в секундах
- `additional_fields` - дополнительные поля для отправки

**Пример:**

```json
{
    "type": "webhook",
    "config": {
        "url": "https://api.example.com/webhook",
        "method": "POST",
        "headers": {
            "Authorization": "Bearer token123"
        },
        "timeout": 30,
        "additional_fields": {
            "source": "website_form"
        }
    }
}
```

### 3. База данных 💾

Сохраняет данные формы в указанную таблицу базы данных.

**Конфигурация:**

- `table` - название таблицы для сохранения
- `mapping` - маппинг полей формы на колонки таблицы
- `additional_fields` - дополнительные поля для сохранения

**Пример:**

```json
{
    "type": "database",
    "config": {
        "table": "form_submissions_data",
        "mapping": {
            "name": "full_name",
            "email": "email_address",
            "message": "user_message"
        },
        "additional_fields": {
            "processed_at": "2024-01-01 12:00:00"
        }
    }
}
```

### 4. Telegram 📱

Отправляет уведомление в Telegram чат.

**Конфигурация:**

- `bot_token` - токен Telegram бота
- `chat_id` - ID чата для отправки
- `message` - шаблон сообщения
- `parse_mode` - режим парсинга (HTML, Markdown)

**Плейсхолдеры в сообщении:**

- `{form_name}` - название формы
- `{submission_id}` - ID отправки
- `{timestamp}` - время отправки
- `{ip_address}` - IP адрес отправителя

**Пример:**

```json
{
    "type": "telegram",
    "config": {
        "bot_token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
        "chat_id": "-1001234567890",
        "message": "🆕 Новая заявка: {form_name}\n📅 Время: {timestamp}",
        "parse_mode": "HTML"
    }
}
```

### 5. Кастомный экшен ⚙️

Выполняет пользовательский PHP код.

**Конфигурация:**

- `class` - полное имя PHP класса
- `method` - метод для выполнения (по умолчанию: `execute`)
- `parameters` - дополнительные параметры

**Пример:**

```json
{
    "type": "custom",
    "config": {
        "class": "App\\Services\\CustomFormAction",
        "method": "execute",
        "parameters": {
            "api_key": "secret123"
        }
    }
}
```

## Создание кастомного экшена

1. Создайте PHP класс в `app/Services/FormActions/`:

```php
<?php

namespace App\Services\FormActions;

use App\Models\FormSubmission;

class CustomFormAction
{
    public function execute(FormSubmission $submission, array $config): bool
    {
        // Ваша логика обработки
        $data = $submission->data;

        // Например, отправка в CRM
        $this->sendToCRM($data);

        return true;
    }

    private function sendToCRM(array $data): void
    {
        // Логика отправки в CRM
    }
}
```

2. Зарегистрируйте экшен в форме через админку

## Порядок выполнения экшенов

Экшены выполняются в порядке их `sort_order`. Если один экшен завершится с ошибкой, остальные экшены все равно будут выполнены.

## Логирование

Все экшены логируются в Laravel лог с уровнем `info` для успешных выполнений и `error` для ошибок.

## Статусы отправок

- `pending` - ожидает обработки
- `processed` - успешно обработана
- `failed` - обработка завершилась с ошибкой

## Мониторинг

В логах Laravel можно отслеживать:

- Успешные выполнения экшенов
- Ошибки выполнения
- Время выполнения
- Детали конфигурации

## Безопасность

- Все данные валидируются перед выполнением экшенов
- Webhook URL проверяются на корректность
- Telegram токены и chat ID валидируются
- Кастомные классы проверяются на существование

## Производительность

- Экшены выполняются синхронно для надежности
- Для больших объемов рекомендуется использовать очереди Laravel
- Webhook таймауты настраиваются для предотвращения зависания

## Примеры использования

### Контактная форма с email уведомлением

```json
{
    "actions": [
        {
            "type": "email",
            "config": {
                "to": ["admin@example.com"],
                "subject": "Новое сообщение с сайта"
            }
        }
    ]
}
```

### Форма регистрации с webhook и Telegram

```json
{
    "actions": [
        {
            "type": "webhook",
            "config": {
                "url": "https://crm.example.com/api/leads",
                "method": "POST"
            }
        },
        {
            "type": "telegram",
            "config": {
                "bot_token": "BOT_TOKEN",
                "chat_id": "CHAT_ID",
                "message": "🆕 Новая регистрация: {form_name}"
            }
        }
    ]
}
```

### Форма заказа с сохранением в БД

```json
{
    "actions": [
        {
            "type": "database",
            "config": {
                "table": "orders",
                "mapping": {
                    "customer_name": "name",
                    "customer_email": "email",
                    "product": "product_name",
                    "quantity": "qty"
                }
            }
        }
    ]
}
```
