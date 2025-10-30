# Система управления мультисайтами

Современная система управления сайтами с использованием React, Redux Toolkit, TypeScript и современных библиотек для работы с изображениями.

## 🚀 Возможности

### ✨ Основные функции

- **Создание сайтов** - пошаговый мастер создания с валидацией
- **Управление медиа** - загрузка, обрезка и оптимизация изображений
- **SEO настройки** - полная настройка мета-тегов и поисковой оптимизации
- **Кастомизация тем** - создание уникальных дизайнов с цветовой схемой
- **Мультисайтовость** - управление множественными сайтами из одной панели

### 🛠 Технологии

#### Frontend

- **React 19** - современная библиотека UI
- **Redux Toolkit** - управление состоянием
- **TypeScript** - типизация
- **React Hook Form + Yup** - формы и валидация
- **Framer Motion** - анимации
- **React Dropzone** - drag & drop загрузка файлов
- **React Image Crop** - обрезка изображений
- **React Color** - выбор цветов
- **React Icons** - иконки

#### Стили

- **SCSS** - препроцессор CSS
- **Модульная архитектура** - отдельные файлы для каждого компонента
- **Темная тема** - поддержка темной темы
- **Responsive дизайн** - адаптивность для всех устройств

## 📁 Структура проекта

```
resources/js/
├── components/sites/
│   ├── ImageUploader.tsx          # Компонент загрузки и обрезки изображений
│   ├── SeoSettings.tsx           # Настройки SEO
│   ├── ThemeCustomizer.tsx       # Кастомизация тем
│   └── README.md                 # Документация
├── pages/sites/
│   └── CreateSite.tsx            # Страница создания сайта
├── store/slices/
│   └── sitesSlice.ts             # Redux slice для управления сайтами
├── hooks/
│   └── useSites.ts               # Хук для работы с сайтами
└── lib/validations.ts            # Схемы валидации
```

```
resources/css/
├── components/sites/
│   ├── image-uploader.scss       # Стили для загрузчика изображений
│   ├── seo-settings.scss         # Стили для SEO настроек
│   └── theme-customizer.scss     # Стили для кастомизатора тем
└── pages/sites/
    └── create-site.scss          # Стили для страницы создания сайта
```

## 🎯 Компоненты

### ImageUploader

Компонент для загрузки и обработки изображений с возможностями:

- Drag & Drop загрузка
- Обрезка изображений с заданным соотношением сторон
- Масштабирование и поворот
- Поддержка различных форматов (JPEG, PNG, GIF, WebP)
- Ограничения по размеру файла

```tsx
<ImageUploader
    onImageUpload={(file) => handleUpload(file)}
    onImageCrop={(croppedImage) => handleCrop(croppedImage)}
    aspectRatio={16 / 9}
    maxSize={10 * 1024 * 1024} // 10MB
/>
```

### SeoSettings

Компонент для настройки SEO параметров:

- Мета-теги (title, description, keywords)
- Open Graph теги для социальных сетей
- Настройки robots.txt
- Канонические URL
- Валидация длины заголовков и описаний

```tsx
<SeoSettings
    initialData={seoData}
    onSave={(data) => handleSeoSave(data)}
    isLoading={isLoading}
/>
```

### ThemeCustomizer

Компонент для кастомизации дизайна:

- Выбор цветовой схемы с визуальным редактором
- Настройка шрифтов
- Предварительный просмотр изменений
- Пользовательский CSS
- Сохранение тем

```tsx
<ThemeCustomizer
    initialData={themeData}
    onSave={(data) => handleThemeSave(data)}
    isLoading={isLoading}
/>
```

## 🔄 Redux Store

### Sites Slice

Управляет состоянием всех сайтов:

```typescript
interface SitesState {
    sites: Site[];
    currentSite: Site | null;
    isLoading: boolean;
    error: string | null;
    uploadProgress: number;
    isUploading: boolean;
}
```

### Actions

- `fetchSites` - загрузка списка сайтов
- `createSite` - создание нового сайта
- `updateSite` - обновление существующего сайта
- `deleteSite` - удаление сайта
- `uploadMedia` - загрузка медиа файлов

## 📝 Валидация

Все формы используют Yup для валидации:

```typescript
// Схема создания сайта
export const siteCreationSchema = yup.object({
    name: yup.string().min(2).max(100).required(),
    domain: yup
        .string()
        .matches(/^[a-zA-Z0-9...]/)
        .required(),
    subdomain: yup
        .string()
        .matches(/^[a-zA-Z0-9...]/)
        .optional(),
    description: yup.string().max(500).optional(),
    organizationId: yup.number().positive().required(),
});
```

## 🎨 Стилизация

### Принципы

- **Модульность** - каждый компонент имеет свои стили
- **BEM методология** - четкая структура классов
- **Темная тема** - поддержка через CSS переменные
- **Responsive** - адаптивность для всех устройств

### Пример структуры стилей

```scss
.image-uploader {
    &__dropzone {
        border: 2px dashed #d1d5db;
        transition: all 0.2s ease-in-out;

        &:hover {
            border-color: #3b82f6;
        }

        &--active {
            border-color: #3b82f6;
            transform: scale(1.02);
        }
    }
}
```

## 🚀 Использование

### Создание сайта

```tsx
import CreateSite from '../pages/sites/CreateSite';

const MyComponent = () => {
    const handleSiteCreated = (siteId: number) => {
        console.log('Сайт создан:', siteId);
    };

    return (
        <CreateSite
            organizationId={1}
            onSuccess={handleSiteCreated}
            onCancel={() => console.log('Отменено')}
        />
    );
};
```

### Использование хука useSites

```tsx
import { useSites } from '../hooks/useSites';

const MyComponent = () => {
    const {
        sites,
        currentSite,
        isLoading,
        createNewSite,
        updateSiteData,
        deleteSiteData,
        uploadSiteMedia,
    } = useSites();

    // Использование методов...
};
```

## 🔧 API Integration

Система интегрирована с Laravel API:

### Endpoints

- `GET /api/organizations/{id}/sites` - список сайтов
- `POST /api/organizations/{id}/sites` - создание сайта
- `PATCH /api/organizations/{id}/sites/{siteId}` - обновление сайта
- `DELETE /api/organizations/{id}/sites/{siteId}` - удаление сайта
- `POST /api/sites/{siteId}/media` - загрузка медиа

### Авторизация

Все запросы автоматически включают Bearer токен из localStorage.

## 📱 Адаптивность

Система полностью адаптивна и работает на:

- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (до 767px)

## 🌙 Темная тема

Поддержка темной темы через CSS медиа-запросы:

```scss
@media (prefers-color-scheme: dark) {
    .component {
        background-color: #1f2937;
        color: #f9fafb;
    }
}
```

## 🎯 Будущие улучшения

- [ ] Drag & Drop для переупорядочивания сайтов
- [ ] Массовые операции с сайтами
- [ ] Шаблоны тем
- [ ] Экспорт/импорт настроек
- [ ] Аналитика сайтов
- [ ] Система уведомлений
- [ ] Мультиязычность

## 📚 Дополнительные ресурсы

- [React Hook Form документация](https://react-hook-form.com/)
- [Redux Toolkit документация](https://redux-toolkit.js.org/)
- [Yup валидация](https://github.com/jquense/yup)
- [Framer Motion анимации](https://www.framer.com/motion/)
- [React Dropzone](https://react-dropzone.js.org/)
- [React Image Crop](https://github.com/DominicTobias/react-image-crop)

---

Система готова к использованию и легко расширяется для добавления новых функций! 🚀
