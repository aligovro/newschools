import { WidgetEditModal } from '@/components/dashboard/site-builder';
import React, { useState } from 'react';

/**
 * Тестовый компонент для проверки работы текстового виджета в модальном окне
 */
export const TextWidgetModalTest: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Тестовый виджет с различными настройками
    const testWidget = {
        id: 'test-text-widget-1',
        widget_id: 1,
        name: 'Тестовый текстовый блок',
        slug: 'text',
        config: {
            title: 'Добро пожаловать на наш сайт!',
            content: `# О нашей организации

Мы **помогаем людям** в трудных ситуациях и стремимся сделать мир лучше.

## Наши ценности

• *Честность* - основа всех наших действий
• *Открытость* - мы прозрачны в своей работе
• *Результат* - мы добиваемся поставленных целей

### Что мы делаем

1. Оказываем помощь нуждающимся
2. Организуем благотворительные акции
3. Поддерживаем местные сообщества

> "Лучший способ предсказать будущее - это создать его."
> — Питер Друкер

Для получения дополнительной информации посетите наш [сайт](https://example.com) или напишите нам на \`contact@example.com\`.`,
            fontSize: '16px',
            textAlign: 'left',
            backgroundColor: '#f8fafc',
            textColor: '#1f2937',
            titleColor: '#2563eb',
            padding: '24px',
            margin: '16px',
            borderRadius: '12px',
            borderWidth: '1px',
            borderColor: '#e5e7eb',
            enableFormatting: true,
            enableColors: true,
        },
        settings: {},
        is_active: true,
        is_visible: true,
        widget_slug: '',
        order: 1,
        position_name: 'Основной контент',
        position_slug: 'main-content',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    const handleSave = (widget: any) => {
        console.log('Сохранение виджета:', widget);
        setIsModalOpen(false);
    };

    const handleSaveConfig = async (widgetId: string, config: any) => {
        console.log('Сохранение конфигурации:', { widgetId, config });
        return Promise.resolve();
    };

    const positions = [
        { id: 1, name: 'Основной контент', slug: 'main-content' },
        { id: 2, name: 'Боковая панель', slug: 'sidebar' },
        { id: 3, name: 'Подвал', slug: 'footer' },
    ];

    const handleMove = async (widgetId: string, positionSlug: string) => {
        console.log('Перемещение виджета:', { widgetId, positionSlug });
    };

    return (
        <div className="p-6">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-4 text-2xl font-bold">
                    Тест модального окна текстового виджета
                </h1>

                <div className="mb-4 rounded-lg bg-gray-100 p-4">
                    <h2 className="mb-2 font-semibold">
                        Текущая конфигурация виджета:
                    </h2>
                    <pre className="overflow-x-auto text-xs">
                        {JSON.stringify(testWidget.config, null, 2)}
                    </pre>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                    Открыть модальное окно редактирования
                </button>

                <div className="mt-4 text-sm text-gray-600">
                    <p>Этот тест демонстрирует:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>
                            Открытие модального окна с настройками текстового
                            виджета
                        </li>
                        <li>Панель инструментов форматирования</li>
                        <li>Настройки цветов и стилей</li>
                        <li>Предварительный просмотр изменений</li>
                        <li>Сохранение конфигурации</li>
                    </ul>
                </div>
            </div>

            <WidgetEditModal
                widget={testWidget}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                onSaveConfig={handleSaveConfig}
                positions={positions}
                onMove={handleMove}
                siteId={1}
            />
        </div>
    );
};
