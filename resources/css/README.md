# SCSS Setup для Laravel проекта

Этот проект настроен для работы с SCSS (Sass) в качестве дополнительного препроцессора CSS.

## Структура файлов

```
resources/css/
├── app.css              # Основной файл с Tailwind CSS и темой
├── custom.scss          # SCSS стили и компоненты
└── README.md           # Этот файл
```

## Использование

### 1. Основные стили

Основные стили (Tailwind CSS + тема) находятся в `app.css` и импортируются в `app.tsx`:

```tsx
import '../css/app.css';
```

### 2. SCSS стили

SCSS стили находятся в `custom.scss` и импортируются отдельно:

```tsx
import '../css/custom.scss';
```

### 3. Алиасы импортов

Настроены алиасы для удобного импорта JavaScript файлов:

- `@/` - `resources/js/`
- `@/components/` - `resources/js/components/`

**Примечание:** CSS/SCSS файлы импортируются с относительными путями, так как алиасы не работают для CSS в Vite.

### 4. Автоматический импорт переменных

SCSS переменные и миксины автоматически импортируются во все SCSS файлы через Vite конфигурацию. Не нужно добавлять `@import '../variables';` в каждый файл.

### 5. SCSS переменные

В `custom.scss` доступны переменные:

```scss
$primary-color: #3b82f6;
$secondary-color: #8b5cf6;
$accent-color: #10b981;
$warning-color: #f59e0b;
$error-color: #ef4444;
```

### 6. Готовые компоненты

В `custom.scss` есть готовые компоненты:

- `.custom-button` - кнопка с градиентом
- `.gradient-card` - карточка с градиентом
- `.animated-card` - анимированная карточка
- `.text-gradient` - градиентный текст

### 7. Миксины

Доступные миксины:

```scss
@mixin button-reset; // сброс стилей кнопки
@mixin center-flex; // центрирование через flex
@mixin hover-lift; // эффект поднятия при hover
```

## Примеры использования

### Создание кнопки

```html
<button class="custom-button">Обычная кнопка</button>
<button class="custom-button custom-button--secondary">Вторичная кнопка</button>
<button class="custom-button custom-button--warning">Предупреждение</button>
```

### Создание карточки

```html
<div class="gradient-card">
    <h3>Заголовок</h3>
    <p>Описание карточки</p>
</div>
```

### Использование в SCSS

```scss
.my-component {
    background: $primary-color;
    padding: $spacing-md;
    border-radius: $border-radius;

    &:hover {
        @include hover-lift;
    }
}
```

## Компиляция

SCSS автоматически компилируется Vite при запуске:

```bash
# Режим разработки
npm run dev

# Продакшн сборка
npm run build
```

## Интеграция с Tailwind CSS

SCSS работает совместно с Tailwind CSS:

1. Используйте Tailwind классы в HTML
2. Используйте `@apply` директиву в SCSS
3. Создавайте кастомные компоненты на SCSS
4. Используйте SCSS переменные для кастомных стилей

## Добавление новых стилей

Для добавления новых стилей:

1. Откройте `resources/css/custom.scss`
2. Добавьте ваши SCSS стили
3. Используйте доступные переменные и миксины
4. Стили автоматически скомпилируются

## Преимущества

- ✅ Все оригинальные стили сохранены
- ✅ SCSS функции доступны
- ✅ Нет дублирования стилей
- ✅ Четкое разделение ответственности
- ✅ Легко добавлять новые стили
