# Виджет статистики выпускников (Alumni Stats Widget)

## Описание

Виджет отображает статистику поддержки школ бывшими выпускниками в трех колонках:

1. **Количество людей** - Поддерживают свои школы
2. **Сумма поддержки** - Сумма поддержки бывшими выпускниками
3. **Количество проектов** - Реализовали бывшие выпускники

## Особенности

- Для главного сайта (без указания organization_id) отображается статистика по всем организациям
- Для сайта организации (с указанием organization_id) отображается статистика конкретной организации
- Визуально оформлен с иконками и адаптивным дизайном
- Статистика загружается динамически через API

## Backend

### API Endpoint

```
GET /api/public/alumni-stats
```

**Query Parameters:**

- `organization_id` (optional) - ID организации для фильтрации статистики

**Response:**

```json
{
    "supporters_count": 240530,
    "total_donated": 78000000000,
    "projects_count": 512
}
```

Примечание: `total_donated` возвращается в копейках.

### Контроллер

`app/Http/Controllers/Api/AlumniStatsController.php`

Контроллер получает:

- Количество уникальных доноров из таблицы `donations` (где статус completed и donor_id не null)
- Общую сумму пожертвований в копейках
- Количество завершенных проектов из таблицы `projects` (где статус completed)

## Frontend

### Основной компонент

`resources/js/components/widgets/AlumniStatsWidget.tsx`

### Output компонент

`resources/js/components/widgets/output/AlumniStatsOutput.tsx`

### Конфигурация виджета

```typescript
{
  organization_id?: number;  // ID организации (опционально)
  title?: string;            // Заголовок блока (опционально)
  showIcons?: boolean;       // Показывать ли иконки (по умолчанию true)
  styling?: Record<string, any>;  // Стилизация виджета
}
```

## Регистрация

Виджет зарегистрирован в:

- `resources/js/components/widgets/registry/widgetRegistry.tsx` - основной реестр
- `resources/js/components/widgets/output/WidgetOutputRenderer.tsx` - output рендерер

Используйте slug виджета: `alumni_stats`

## Использование

### Добавление виджета в конструкторе

1. В конструкторе сайта выберите "Статистика выпускников"
2. Настройте конфигурацию:
    - Для главного сайта: оставьте `organization_id` пустым
    - Для сайта организации: укажите ID организации
    - Добавьте заголовок (опционально)
3. Виджет автоматически загрузит актуальную статистику

## Структура данных

### База данных

Виджет использует существующие таблицы:

- `donations` - для подсчета уникальных доноров и суммы пожертвований
- `projects` - для подсчета завершенных проектов

### Фильтрация

- Статус пожертвований: `completed`
- Только зарегистрированные пользователи: `donor_id IS NOT NULL`
- Проекты со статусом: `completed`

## Стилизация

Виджет поддерживает стандартные параметры стилизации:

- `backgroundColor` - цвет фона
- `textColor` - цвет текста
- `padding` - отступы
- `margin` - внешние отступы
- `borderRadius` - скругление углов
- `borderWidth` - ширина границы
- `borderColor` - цвет границы

## Иконки

Виджет использует три SVG иконки:

- **Люди** - для количества поддерживающих
- **Валюта** - для суммы пожертвований
- **Лампочка** - для количества проектов

## Пример использования

```tsx
import { AlumniStatsWidget } from '@/components/widgets';

<AlumniStatsWidget
    config={{
        organization_id: 123,
        title: 'Наша поддержка',
        showIcons: true,
    }}
    styling={{
        backgroundColor: '#f9fafb',
        padding: '2rem',
    }}
/>;
```
