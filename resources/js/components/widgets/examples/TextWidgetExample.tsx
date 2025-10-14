import React from 'react';
import { TextWidget } from '../TextWidget';

/**
 * Пример использования улучшенного текстового виджета
 */
export const TextWidgetExample: React.FC = () => {
    const exampleConfigs = [
        {
            title: 'Простой текст',
            config: {
                title: 'Добро пожаловать!',
                content:
                    'Это простой пример текстового виджета без форматирования.',
                fontSize: '16px',
                textAlign: 'left' as const,
                backgroundColor: 'transparent',
                textColor: '#000000',
                titleColor: '#2563eb',
                padding: '16px',
                margin: '0px',
                borderRadius: '8px',
                borderWidth: '0px',
                borderColor: '#e5e7eb',
                enableFormatting: false,
                enableColors: true,
            },
        },
        {
            title: 'Форматированный текст',
            config: {
                title: 'О нашей организации',
                content: `# Наша миссия

Мы стремимся **изменить мир** к лучшему, помогая людям в трудных ситуациях.

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
                textAlign: 'left' as const,
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
        },
        {
            title: 'Центрированный контент',
            config: {
                title: 'Спасибо за поддержку!',
                content: `Мы **благодарим** всех, кто поддерживает нашу миссию.

*Ваша помощь делает мир лучше!*`,
                fontSize: '18px',
                textAlign: 'center' as const,
                backgroundColor: '#fef3c7',
                textColor: '#92400e',
                titleColor: '#d97706',
                padding: '32px',
                margin: '0px',
                borderRadius: '16px',
                borderWidth: '2px',
                borderColor: '#f59e0b',
                enableFormatting: true,
                enableColors: true,
            },
        },
    ];

    return (
        <div className="space-y-8 p-6">
            <div className="text-center">
                <h1 className="mb-4 text-3xl font-bold">
                    Примеры улучшенного текстового виджета
                </h1>
                <p className="text-gray-600">
                    Демонстрация различных возможностей нового текстового
                    виджета
                </p>
            </div>

            {exampleConfigs.map((example, index) => (
                <div key={index} className="rounded-lg border p-6">
                    <h2 className="mb-4 text-xl font-semibold">
                        {example.title}
                    </h2>

                    <div className="mb-4">
                        <TextWidget
                            config={example.config}
                            isEditable={false}
                        />
                    </div>

                    <details className="mt-4">
                        <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                            Показать конфигурацию
                        </summary>
                        <pre className="mt-2 overflow-x-auto rounded bg-gray-100 p-4 text-xs">
                            {JSON.stringify(example.config, null, 2)}
                        </pre>
                    </details>
                </div>
            ))}

            <div className="rounded-lg border p-6">
                <h2 className="mb-4 text-xl font-semibold">
                    Интерактивный редактор
                </h2>
                <p className="mb-4 text-gray-600">
                    Попробуйте сами - отредактируйте текст и посмотрите, как
                    работает форматирование:
                </p>

                <TextWidget
                    config={{
                        title: 'Попробуйте отредактировать',
                        content: `# Начните здесь

Используйте панель инструментов выше для форматирования текста.

**Попробуйте:**
• Жирный текст
• *Курсив*
• [Ссылки](https://example.com)
• > Цитаты

1. Нумерованные списки
2. Работают отлично!`,
                        fontSize: '16px',
                        textAlign: 'left' as const,
                        backgroundColor: 'transparent',
                        textColor: '#000000',
                        titleColor: '#2563eb',
                        padding: '20px',
                        margin: '0px',
                        borderRadius: '8px',
                        borderWidth: '1px',
                        borderColor: '#e5e7eb',
                        enableFormatting: true,
                        enableColors: true,
                    }}
                    isEditable={true}
                    autoExpandSettings={true}
                />
            </div>
        </div>
    );
};
