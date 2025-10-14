# Виджет пожертвований (Donation Widget)

Полнофункциональный виджет для приема пожертвований с поддержкой всех платежных систем, регулярных платежей и гибкой настройкой внешнего вида.

## Содержание

- [Обзор](#обзор)
- [Возможности](#возможности)
- [Установка](#установка)
- [Настройка](#настройка)
- [Использование](#использование)
- [API](#api)
- [Примеры](#примеры)
- [FAQ](#faq)

## Обзор

Виджет пожертвований — это комплексное решение для приема благотворительных взносов на сайтах организаций. Виджет поддерживает:

- **Множественные платежные системы**: ЮKassa, Тинькофф, СБП, SberPay, T-Pay
- **Регулярные платежи**: ежедневные, еженедельные, ежемесячные
- **Привязка к сборам средств**: автоматический учет прогресса
- **Гибкая настройка**: внешний вид, поля формы, способы оплаты
- **Анонимные пожертвования**: опция для доноров
- **Адаптивный дизайн**: работает на всех устройствах

## Возможности

### Функциональность

1. **Прием пожертвований**
    - Единоразовые платежи
    - Регулярные подписки
    - Гибкие суммы и предустановленные значения
    - Минимальные и максимальные ограничения

2. **Платежные системы**
    - Интеграция с ЮKassa (банковские карты)
    - Система быстрых платежей (СБП)
    - Тинькофф
    - SberPay
    - T-Pay
    - Автоматический выбор доступных методов

3. **Сборы средств**
    - Привязка к конкретным сборам
    - Отображение прогресса
    - Целевая и собранная суммы
    - Процент выполнения

4. **Форма донора**
    - Настраиваемые обязательные поля
    - Имя, email, телефон
    - Сообщение от донора
    - Анонимные пожертвования

5. **Регулярные платежи**
    - Ежедневная подписка
    - Еженедельная подписка
    - Ежемесячная подписка
    - Согласие на автоплатеж

6. **Уведомления**
    - Email чеки
    - Сообщение благодарности
    - Перенаправление после оплаты

### Настройка внешнего вида

- **Цветовые схемы**: светлая, темная, автоматическая
- **Основной цвет**: настраиваемый
- **Стиль кнопки**: primary, secondary, success, gradient
- **Скругление углов**: от none до full
- **Тени**: от none до large
- **Позиция**: inline, sticky, modal

## Установка

### 1. Запуск сидера

Выполните команду для добавления виджета в базу данных:

```bash
php artisan db:seed --class=DonationWidgetSeeder
```

### 2. Импорт стилей

Добавьте стили виджета в ваш основной файл стилей:

```scss
// resources/css/app.scss
@import 'widgets/donation-widget';
```

### 3. Регистрация компонента

Компонент автоматически регистрируется в `WidgetRenderer.tsx` и доступен для использования.

## Настройка

### Основные настройки

```typescript
{
  // Заголовок и описание
  title: 'Поддержать организацию',
  description: 'Ваша поддержка поможет в развитии',

  // Привязка к сбору
  fundraiser_id: 1,
  project_id: null,

  // Отображение прогресса
  show_progress: true,
  show_target_amount: true,
  show_collected_amount: true,
}
```

### Настройки сумм

```typescript
{
  // Предустановленные суммы (в рублях)
  preset_amounts: [100, 300, 500, 1000],

  // Сумма по умолчанию
  default_amount: 100,

  // Ограничения
  min_amount: 100,
  max_amount: 0, // 0 = без ограничений

  // Валюта
  currency: 'RUB', // 'RUB', 'USD', 'EUR'
}
```

### Платежные системы

```typescript
{
  // Доступные методы (если не указано - все активные)
  payment_methods: ['yookassa', 'sbp', 'tinkoff'],

  // Метод по умолчанию
  default_payment_method: 'yookassa',

  // Показывать иконки
  show_payment_icons: true,
}
```

### Регулярные платежи

```typescript
{
  // Разрешить регулярные платежи
  allow_recurring: true,

  // Доступные периоды
  recurring_periods: ['daily', 'weekly', 'monthly'],

  // Период по умолчанию
  default_recurring_period: 'daily',
}
```

### Форма донора

```typescript
{
  // Обязательные поля
  require_name: true,
  require_email: false,
  require_phone: false,

  // Опции
  allow_anonymous: true,
  show_message_field: false,
}
```

### Внешний вид

```typescript
{
  // Текст кнопки
  button_text: 'Поддержать организацию',

  // Стиль кнопки
  button_style: 'primary', // 'primary', 'secondary', 'success', 'gradient'

  // Цветовая схема
  color_scheme: 'light', // 'light', 'dark', 'auto'

  // Основной цвет
  primary_color: '#3b82f6',

  // Скругление углов
  border_radius: 'medium', // 'none', 'small', 'medium', 'large', 'full'

  // Тень
  shadow: 'small', // 'none', 'small', 'medium', 'large'
}
```

## Использование

### Добавление виджета на сайт

1. В конструкторе сайтов выберите "Виджет пожертвований"
2. Настройте параметры через панель настроек
3. Разместите виджет в нужной позиции
4. Опубликуйте изменения

### Использование в React

```tsx
import { DonationWidget } from '@/components/widgets';

function MyPage() {
    return (
        <DonationWidget
            config={{
                title: 'Поддержать проект',
                fundraiser_id: 1,
                preset_amounts: [100, 500, 1000],
                allow_recurring: true,
            }}
            organizationId={1}
            isEditable={false}
        />
    );
}
```

### Использование в режиме редактирования

```tsx
<DonationWidget
    config={widgetConfig}
    isEditable={true}
    autoExpandSettings={true}
    onSave={async (newConfig) => {
        await saveWidgetConfig(widgetId, newConfig);
    }}
    widgetId={widgetId}
    organizationId={organizationId}
/>
```

## API

### Эндпоинты

#### Получение данных виджета

```http
GET /api/organizations/{organization}/donation-widget/data?fundraiser_id=1
```

**Ответ:**

```json
{
  "organization": {
    "id": 1,
    "name": "Благотворительная организация",
    "logo": "https://example.com/logo.png"
  },
  "fundraiser": {
    "id": 1,
    "title": "Строительство нового здания",
    "target_amount": 35000000,
    "collected_amount": 142390,
    "progress_percentage": 0.41
  },
  "payment_methods": [...]
}
```

#### Создание пожертвования

```http
POST /api/organizations/{organization}/donation-widget/donate
Content-Type: application/json

{
  "amount": 500,
  "currency": "RUB",
  "payment_method_slug": "yookassa",
  "fundraiser_id": 1,
  "donor_name": "Александр",
  "donor_email": "user@example.com",
  "is_anonymous": false,
  "is_recurring": false,
  "send_receipt": true
}
```

**Ответ:**

```json
{
    "success": true,
    "data": {
        "transaction_id": "TXN_123456",
        "payment_url": "https://yookassa.ru/checkout/...",
        "amount": 500,
        "currency": "RUB"
    }
}
```

#### Получение методов оплаты

```http
GET /api/organizations/{organization}/donation-widget/payment-methods
```

#### Статус платежа

```http
GET /api/organizations/{organization}/donation-widget/payment-status/{transactionId}
```

### События

Виджет генерирует следующие события:

- `donation:created` - создано пожертвование
- `donation:success` - платеж успешен
- `donation:failed` - ошибка платежа
- `donation:cancelled` - платеж отменен

## Примеры

### Базовый виджет

```typescript
{
  title: 'Поддержать',
  preset_amounts: [100, 300, 500, 1000],
  default_amount: 100,
  button_text: 'Пожертвовать',
}
```

### Виджет со сбором средств

```typescript
{
  title: 'Строительство нового здания',
  description: 'Помогите нам построить новое здание организации',
  fundraiser_id: 1,
  show_progress: true,
  show_target_amount: true,
  show_collected_amount: true,
  preset_amounts: [500, 1000, 5000, 10000],
}
```

### Виджет с регулярными платежами

```typescript
{
  title: 'Ежемесячная поддержка',
  allow_recurring: true,
  recurring_periods: ['monthly'],
  default_recurring_period: 'monthly',
  preset_amounts: [100, 300, 500],
  require_email: true,
}
```

### Кастомизированный виджет

```typescript
{
  title: 'Поддержать организацию',
  primary_color: '#10b981',
  button_style: 'gradient',
  border_radius: 'large',
  shadow: 'medium',
  preset_amounts: [200, 500, 1000, 2000],
  payment_methods: ['sbp', 'yookassa'],
}
```

### Минимальный виджет

```typescript
{
  title: 'Donate',
  preset_amounts: [10, 25, 50],
  currency: 'USD',
  allow_anonymous: true,
  require_name: false,
}
```

## FAQ

### Как добавить новый метод оплаты?

1. Создайте новый gateway в `app/Services/Payment/`
2. Добавьте конфигурацию в `config/payments.php`
3. Создайте запись в таблице `payment_methods`
4. Виджет автоматически подхватит новый метод

### Как настроить минимальную сумму?

```typescript
{
  min_amount: 100, // минимум 100 рублей
  max_amount: 100000, // максимум 100 000 рублей
}
```

### Как изменить цвета виджета?

```typescript
{
  primary_color: '#10b981', // основной цвет
  button_style: 'gradient', // стиль кнопки с градиентом
  color_scheme: 'dark', // темная тема
}
```

### Как сделать виджет фиксированным?

В настройках виджета установите:

```typescript
settings: {
  position: 'sticky',
  sticky_position: 'bottom-right',
}
```

### Как получать уведомления о пожертвованиях?

Настройте уведомления в настройках организации:

1. Email уведомления
2. Telegram бот
3. Webhook

### Как протестировать виджет?

Включите тестовый режим в платежных настройках организации. В этом режиме реальные платежи не проводятся.

### Как экспортировать данные о пожертвованиях?

В админ-панели организации перейдите в раздел "Платежи" → "Экспорт" и выберите нужный формат (CSV, Excel, PDF).

## Поддержка

Если у вас возникли вопросы или проблемы:

1. Проверьте логи в `storage/logs/laravel.log`
2. Убедитесь, что все миграции выполнены
3. Проверьте настройки платежных систем
4. Обратитесь к документации по платежным системам

## Лицензия

Этот виджет является частью системы управления сайтами организаций.
