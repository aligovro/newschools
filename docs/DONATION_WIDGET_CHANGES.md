# Изменения в виджете пожертвований

## Последние изменения (13.10.2025)

### Убраны лишние кнопки сохранения

**Проблема:** В режиме редактирования было несколько кнопок "Сохранить" - внутри виджета и внизу модалки.

**Решение:**

- Убраны кнопки SaveButton из виджета
- Убран импорт SaveButton
- Убраны состояния `isSaving` и `saveStatus`
- Добавлено автосохранение с debounce (500мс)

**Результат:** Теперь единственные кнопки - внизу модалки (Отмена/Сохранить)

### Автосохранение конфигурации

```tsx
// Автоматическое сохранение с debounce 500мс
useEffect(() => {
    if (!onSave || !isEditable) return;

    const timer = setTimeout(() => {
        onSave(localConfig as Record<string, unknown>);
    }, 500);

    return () => clearTimeout(timer);
}, [localConfig, onSave, isEditable]);
```

**Преимущества:**

- Нет необходимости нажимать "Сохранить" внутри виджета
- Изменения автоматически попадают в pendingConfig
- Финальное сохранение происходит кнопкой модалки

## Интеграция с терминологией

Виджет автоматически использует системную терминологию:

```tsx
// Если не указан title или button_text, используется terminology.action_support
const defaultTitle = terminology?.action_support || 'Поддержать';
const defaultButtonText = terminology?.action_support || 'Поддержать';
```

**Backend передает терминологию:**

```php
'terminology' => [
    'organization_singular' => TerminologyHelper::orgSingular(),
    'organization_genitive' => TerminologyHelper::orgGenitive(),
    'action_support' => TerminologyHelper::actionSupport(),
],
```

## Структура файлов

```
resources/js/
├── utils/
│   └── widgetHelpers.ts          # getOrganizationId(), isCustomWidget()
├── components/widgets/
│   ├── registry/
│   │   └── widgetRegistry.tsx    # Реестр всех виджетов
│   ├── DonationWidget.tsx        # Виджет пожертвований
│   └── WidgetRenderer.tsx        # 81 строка, memo + useMemo
└── site-builder/
    └── WidgetEditModal.tsx       # 280 строк, useCallback + useMemo
```

## API эндпоинты

```
GET  /api/organizations/{id}/donation-widget/data
GET  /api/organizations/{id}/donation-widget/payment-methods
POST /api/organizations/{id}/donation-widget/donate
GET  /api/organizations/{id}/donation-widget/payment-status/{txId}
```
