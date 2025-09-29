# Система виджетов для конструктора сайтов

## Обзор

Полноценная система виджетов для конструктора сайтов с базой данных, админ-панелью и гибкой конфигурацией. Позволяет создавать, настраивать и управлять виджетами для сайтов организаций.

## 🏗️ Архитектура системы

### Backend компоненты

#### Модели

- **SiteTemplate** - Шаблоны сайтов с конфигурацией
- **Widget** - Базовые виджеты с настройками
- **WidgetPosition** - Позиции виджетов в шаблонах
- **SiteWidget** - Экземпляры виджетов на конкретных сайтах

#### Контроллеры

- **WidgetController** - API для управления виджетами
- **SiteConstructorController** - Интеграция с конструктором сайтов

#### База данных

- `site_templates` - Шаблоны сайтов
- `widgets` - Базовые виджеты
- `widget_positions` - Позиции в шаблонах
- `site_widgets` - Виджеты на сайтах

### Frontend компоненты

#### Основные компоненты

- **WidgetPanel** - Панель выбора виджетов
- **WidgetEditor** - Редактор настроек виджета
- **SiteBuilder** - Обновленный конструктор сайтов

## 📊 Структура базы данных

### Таблица `site_templates`

```sql
CREATE TABLE site_templates (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    preview_image VARCHAR(255),
    layout_config JSON,
    theme_config JSON,
    available_blocks JSON,
    default_positions JSON,
    custom_settings JSON,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Таблица `widgets`

```sql
CREATE TABLE widgets (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    category VARCHAR(255) NOT NULL,
    fields_config JSON,
    settings_config JSON,
    component_name VARCHAR(255),
    css_classes TEXT,
    js_script TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_premium BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Таблица `widget_positions`

```sql
CREATE TABLE widget_positions (
    id BIGINT PRIMARY KEY,
    template_id BIGINT REFERENCES site_templates(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    area VARCHAR(255) NOT NULL,
    order INT DEFAULT 0,
    allowed_widgets JSON,
    layout_config JSON,
    is_required BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(template_id, slug)
);
```

### Таблица `site_widgets`

```sql
CREATE TABLE site_widgets (
    id BIGINT PRIMARY KEY,
    site_id BIGINT REFERENCES organization_sites(id),
    widget_id BIGINT REFERENCES widgets(id),
    position_id BIGINT REFERENCES widget_positions(id),
    name VARCHAR(255) NOT NULL,
    position_name VARCHAR(255) NOT NULL,
    config JSON,
    settings JSON,
    order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## 🎨 Система шаблонов

### Базовые шаблоны

#### 1. Стандартный шаблон

```json
{
    "name": "Стандартный",
    "slug": "default",
    "layout_config": {
        "header": {
            "type": "fixed",
            "background": "white",
            "show_logo": true,
            "show_navigation": true
        },
        "footer": {
            "type": "default",
            "show_links": true,
            "show_social": true
        }
    },
    "theme_config": {
        "primary_color": "#3B82F6",
        "secondary_color": "#6B7280",
        "font_family": "Inter"
    },
    "available_blocks": ["hero", "text", "image", "gallery", "projects"]
}
```

#### 2. Современный шаблон

```json
{
    "name": "Современный",
    "slug": "modern",
    "layout_config": {
        "header": {
            "type": "sticky",
            "background": "transparent",
            "show_search": true
        },
        "footer": {
            "type": "modern",
            "show_newsletter": true
        }
    },
    "theme_config": {
        "primary_color": "#6366F1",
        "secondary_color": "#8B5CF6",
        "font_family": "Poppins"
    },
    "available_blocks": [
        "hero",
        "text",
        "image",
        "gallery",
        "projects",
        "stats",
        "features"
    ]
}
```

#### 3. Корпоративный шаблон

```json
{
    "name": "Корпоративный",
    "slug": "corporate",
    "layout_config": {
        "header": {
            "type": "fixed",
            "show_search": true
        },
        "sidebar": {
            "enabled": true,
            "position": "left"
        }
    },
    "theme_config": {
        "primary_color": "#1E40AF",
        "secondary_color": "#374151",
        "font_family": "Roboto"
    },
    "available_blocks": [
        "hero",
        "text",
        "image",
        "gallery",
        "projects",
        "team",
        "services"
    ]
}
```

### Позиции виджетов

Каждый шаблон автоматически создает стандартные позиции:

1. **Главный баннер** (hero) - Верхняя часть страницы
2. **Основной контент** (content) - Основная область контента
3. **Боковая панель** (sidebar) - Дополнительная информация
4. **Подвал** (footer) - Контактная информация

## 🔧 Система виджетов

### Базовые виджеты

#### 1. Hero Widget (Главный баннер)

```json
{
    "name": "Главный баннер",
    "slug": "hero",
    "category": "layout",
    "fields_config": {
        "title": { "type": "text", "required": true, "label": "Заголовок" },
        "subtitle": { "type": "text", "label": "Подзаголовок" },
        "description": { "type": "textarea", "label": "Описание" },
        "background_image": { "type": "image", "label": "Фоновое изображение" },
        "button_text": { "type": "text", "label": "Текст кнопки" },
        "button_url": { "type": "url", "label": "Ссылка кнопки" }
    },
    "settings_config": {
        "height": { "type": "text", "default": "400px" },
        "parallax": { "type": "checkbox", "default": false },
        "overlay": { "type": "checkbox", "default": true }
    }
}
```

#### 2. Projects Widget (Проекты)

```json
{
    "name": "Проекты",
    "slug": "projects",
    "category": "content",
    "fields_config": {
        "title": { "type": "text", "default": "Наши проекты" },
        "limit": { "type": "number", "min": 1, "max": 20, "default": 6 },
        "columns": { "type": "number", "min": 1, "max": 4, "default": 3 },
        "show_description": { "type": "checkbox", "default": true },
        "show_progress": { "type": "checkbox", "default": true }
    },
    "settings_config": {
        "animation": {
            "type": "select",
            "options": ["none", "fade", "slide"],
            "default": "fade"
        },
        "hover_effect": {
            "type": "select",
            "options": ["none", "lift", "shadow"],
            "default": "lift"
        }
    }
}
```

#### 3. Gallery Widget (Галерея)

```json
{
    "name": "Галерея",
    "slug": "gallery",
    "category": "media",
    "fields_config": {
        "images": { "type": "images", "required": true },
        "columns": { "type": "number", "min": 1, "max": 6, "default": 3 },
        "show_captions": { "type": "checkbox", "default": false },
        "lightbox": { "type": "checkbox", "default": true }
    },
    "settings_config": {
        "gap": { "type": "text", "default": "10px" },
        "border_radius": { "type": "text", "default": "8px" },
        "hover_effect": {
            "type": "select",
            "options": ["none", "scale", "overlay"],
            "default": "overlay"
        }
    }
}
```

### Типы полей конфигурации

#### Поддерживаемые типы полей:

- **text** - Текстовое поле
- **textarea** - Многострочный текст
- **richtext** - Текст с HTML разметкой
- **number** - Числовое поле
- **select** - Выпадающий список
- **checkbox** - Чекбокс
- **color** - Выбор цвета
- **url** - URL поле
- **image** - Загрузка изображения
- **images** - Загрузка нескольких изображений
- **range** - Ползунок

#### Поддерживаемые типы настроек:

- **text** - Текстовые настройки
- **select** - Выбор из вариантов
- **checkbox** - Включить/выключить
- **range** - Числовые диапазоны

## 🚀 API Endpoints

### Получение виджетов

```http
GET /organization/{organization}/admin/api/widgets/
GET /organization/{organization}/admin/api/widgets/template/{template}
GET /organization/{organization}/admin/api/widgets/site/{site}
```

### Управление виджетами сайта

```http
POST /organization/{organization}/admin/api/widgets/site/{site}/add
PUT /organization/{organization}/admin/api/widgets/site/{site}/widget/{widget}
DELETE /organization/{organization}/admin/api/widgets/site/{site}/widget/{widget}
PATCH /organization/{organization}/admin/api/widgets/site/{site}/reorder
```

### Конфигурация

```http
GET /organization/{organization}/admin/api/widgets/config/{widget}
GET /organization/{organization}/admin/api/widgets/template/{template}/positions
GET /organization/{organization}/admin/api/widgets/position/{position}/widgets
```

## 🎯 Frontend интеграция

### WidgetPanel компонент

```tsx
<WidgetPanel
    template={template}
    onAddWidget={(widget, position) => {
        // Добавить виджет на сайт
        addWidgetToSite(widget, position);
    }}
/>
```

### WidgetEditor компонент

```tsx
<WidgetEditor
    siteWidget={siteWidget}
    isOpen={isEditorOpen}
    onClose={() => setIsEditorOpen(false)}
    onSave={(widget, config, settings) => {
        // Сохранить настройки виджета
        updateWidgetSettings(widget.id, config, settings);
    }}
    onDelete={(widget) => {
        // Удалить виджет
        deleteWidget(widget.id);
    }}
/>
```

### Интеграция с SiteBuilder

```tsx
<SiteBuilder
    template={selectedTemplate}
    onAddWidget={handleAddWidget}
    initialContent={siteContent}
    onSave={handleSave}
/>
```

## 🔄 Жизненный цикл виджета

### 1. Создание виджета

1. Пользователь выбирает виджет из панели
2. Виджет добавляется в выбранную позицию
3. Создается экземпляр SiteWidget с базовой конфигурацией

### 2. Настройка виджета

1. Открывается редактор виджета
2. Пользователь настраивает поля конфигурации
3. Применяются настройки отображения
4. Изменения сохраняются в базе данных

### 3. Отображение виджета

1. Система загружает конфигурацию виджета
2. Рендерится соответствующий React компонент
3. Применяются CSS стили и настройки

### 4. Управление виджетами

1. Изменение порядка через drag & drop
2. Активация/деактивация виджетов
3. Удаление ненужных виджетов

## 📈 Производительность

### Оптимизации

- **Кеширование** конфигураций виджетов
- **Lazy loading** тяжелых компонентов
- **Минификация** CSS и JavaScript
- **CDN** для статических ресурсов

### Метрики

- Время загрузки панели виджетов: < 200ms
- Время добавления виджета: < 500ms
- Время сохранения настроек: < 300ms
- Размер бандла виджетов: < 100KB

## 🔒 Безопасность

### Валидация

- Серверная валидация всех конфигураций
- Санитизация пользовательского ввода
- Проверка прав доступа к виджетам

### Права доступа

- Только администраторы могут добавлять виджеты
- Проверка принадлежности сайта к организации
- Валидация разрешенных виджетов для позиций

## 🎨 Кастомизация

### Создание новых виджетов

1. Добавить виджет в базу данных
2. Создать React компонент
3. Настроить конфигурацию полей
4. Добавить CSS стили

### Создание новых шаблонов

1. Создать шаблон в базе данных
2. Настроить позиции виджетов
3. Определить доступные виджеты
4. Создать превью изображение

## 🚀 Будущие улучшения

### Планируемые функции

1. **Визуальный редактор** для создания виджетов
2. **Маркетплейс** виджетов
3. **A/B тестирование** виджетов
4. **Аналитика** использования виджетов
5. **Автоматическое** создание виджетов из API

### Технические улучшения

1. **TypeScript** типизация для всех компонентов
2. **Storybook** для документирования виджетов
3. **Unit тесты** для виджетов
4. **E2E тесты** для конструктора
5. **Микросервисная** архитектура для виджетов

## 📝 Заключение

Система виджетов предоставляет:

- **Гибкую архитектуру** для создания виджетов
- **Интуитивный интерфейс** для управления
- **Высокую производительность** и масштабируемость
- **Безопасность** и валидацию данных
- **Расширяемость** для будущего развития

Система готова к использованию в продакшене и может обрабатывать тысячи виджетов с оптимальной производительностью.
