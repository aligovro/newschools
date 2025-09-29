import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Edit, Move, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';

interface PageBlock {
    id: string;
    type: string;
    content: Record<string, unknown>;
    order: number;
}

interface ContentBlockProps {
    block: PageBlock;
    onUpdate: (content: Record<string, unknown>) => void;
    onDelete: () => void;
    onMoveUp?: () => void;
    onMoveDown?: () => void;
}

export const ContentBlock: React.FC<ContentBlockProps> = ({
    block,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = (newContent: Record<string, unknown>) => {
        onUpdate(newContent);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const renderBlockContent = () => {
        if (isEditing) {
            return (
                <BlockEditor
                    block={block}
                    onSave={handleSave}
                    onCancel={handleCancel}
                />
            );
        }

        return <BlockPreview block={block} />;
    };

    return (
        <div
            className="group relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card
                className={cn(
                    'transition-all duration-200',
                    isHovered && 'ring-2 ring-blue-500 ring-opacity-50',
                )}
            >
                <CardContent className="p-0">
                    {renderBlockContent()}
                </CardContent>
            </Card>

            {/* Block Controls */}
            {(isHovered || isEditing) && (
                <div className="absolute -right-2 -top-2 z-10 flex items-center space-x-1 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleEdit}
                        className="h-8 w-8 p-0"
                    >
                        <Edit className="h-4 w-4" />
                    </Button>

                    {onMoveUp && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onMoveUp}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronUp className="h-4 w-4" />
                        </Button>
                    )}

                    {onMoveDown && (
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={onMoveDown}
                            className="h-8 w-8 p-0"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={onDelete}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Drag Handle */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 transform opacity-0 transition-opacity group-hover:opacity-100">
                <div className="cursor-move rounded-full bg-gray-600 p-1 text-white">
                    <Move className="h-4 w-4" />
                </div>
            </div>
        </div>
    );
};

const BlockPreview: React.FC<{ block: PageBlock }> = ({ block }) => {
    const { type, content } = block;

    switch (type) {
        case 'hero':
            return (
                <div
                    className="relative flex h-64 items-center justify-center bg-cover bg-center"
                    style={{
                        backgroundColor: content.backgroundColor as string,
                    }}
                >
                    {typeof content.backgroundImage === 'string' &&
                        content.backgroundImage && (
                            <img
                                src={content.backgroundImage}
                                alt=""
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                        )}
                    <div className="relative z-10 text-center text-white">
                        <h1 className="mb-4 text-4xl font-bold">
                            {content.title as string}
                        </h1>
                        <p className="mb-6 text-xl">
                            {content.subtitle as string}
                        </p>
                        <button className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700">
                            {content.buttonText as string}
                        </button>
                    </div>
                </div>
            );

        case 'text':
            return (
                <div className="p-6">
                    <div
                        dangerouslySetInnerHTML={{
                            __html: content.content as string,
                        }}
                    />
                </div>
            );

        case 'image':
            return (
                <div className="p-6">
                    {content.src ? (
                        <div className={`text-${content.alignment as string}`}>
                            <img
                                src={content.src as string}
                                alt={content.alt as string}
                                className="h-auto max-w-full rounded-lg"
                            />
                            {typeof content.caption === 'string' &&
                                content.caption && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        {content.caption}
                                    </p>
                                )}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <p className="text-gray-500">
                                Изображение не выбрано
                            </p>
                        </div>
                    )}
                </div>
            );

        case 'gallery':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        Галерея изображений
                    </h3>
                    {(content.images as unknown[]).length > 0 ? (
                        <div
                            className={`grid grid-cols-${content.columns as number} gap-4`}
                        >
                            {(
                                content.images as Array<{
                                    src: string;
                                    alt: string;
                                }>
                            ).map((image, index: number) => (
                                <img
                                    key={index}
                                    src={image.src}
                                    alt={image.alt}
                                    className="h-32 w-full rounded-lg object-cover"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <p className="text-gray-500">
                                Изображения не добавлены
                            </p>
                        </div>
                    )}
                </div>
            );

        case 'slider':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Слайдер</h3>
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <p className="text-gray-500">
                            {content.sliderId
                                ? `Слайдер ID: ${content.sliderId as string}`
                                : 'Слайдер не выбран'}
                        </p>
                    </div>
                </div>
            );

        case 'testimonials':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">Отзывы</h3>
                    {(content.testimonials as unknown[]).length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {(
                                content.testimonials as Array<{
                                    text: string;
                                    author: string;
                                }>
                            ).map((testimonial, index: number) => (
                                <div
                                    key={index}
                                    className="rounded-lg bg-gray-50 p-4"
                                >
                                    <p className="mb-2 text-gray-700">
                                        "{testimonial.text}"
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {testimonial.author}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <p className="text-gray-500">Отзывы не добавлены</p>
                        </div>
                    )}
                </div>
            );

        case 'contact_form':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    <div className="mx-auto max-w-md">
                        <form className="space-y-4">
                            {(content.fields as string[]).includes('name') && (
                                <input
                                    type="text"
                                    placeholder="Имя"
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                            )}
                            {(content.fields as string[]).includes('email') && (
                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                            )}
                            {(content.fields as string[]).includes(
                                'message',
                            ) && (
                                <textarea
                                    placeholder="Сообщение"
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 p-3"
                                />
                            )}
                            <button
                                type="submit"
                                className="w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700"
                            >
                                {content.submitText as string}
                            </button>
                        </form>
                    </div>
                </div>
            );

        case 'news':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <p className="text-gray-500">
                            Показывать {content.count as number} новостей
                        </p>
                    </div>
                </div>
            );

        case 'projects':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <p className="text-gray-500">
                            Показывать {content.count as number} проектов
                        </p>
                    </div>
                </div>
            );

        case 'stats':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    {(content.stats as unknown[]).length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            {(
                                content.stats as Array<{
                                    value: string;
                                    label: string;
                                }>
                            ).map((stat, index: number) => (
                                <div key={index} className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <p className="text-gray-500">
                                Статистика не добавлена
                            </p>
                        </div>
                    )}
                </div>
            );

        case 'features':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    {(content.features as unknown[]).length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {(
                                content.features as Array<{
                                    title: string;
                                    description: string;
                                }>
                            ).map((feature, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-start space-x-3"
                                >
                                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-500">
                                        <span className="text-sm text-white">
                                            ✓
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">
                                            {feature.title}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <p className="text-gray-500">
                                Особенности не добавлены
                            </p>
                        </div>
                    )}
                </div>
            );

        case 'pricing':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    {(content.plans as unknown[]).length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            {(
                                content.plans as Array<{
                                    name: string;
                                    price: string;
                                    features: string[];
                                }>
                            ).map((plan, index: number) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-gray-200 p-6"
                                >
                                    <h4 className="mb-2 text-xl font-semibold">
                                        {plan.name}
                                    </h4>
                                    <div className="mb-4 text-3xl font-bold">
                                        {plan.price}
                                    </div>
                                    <ul className="space-y-2">
                                        {plan.features.map(
                                            (
                                                feature: string,
                                                featureIndex: number,
                                            ) => (
                                                <li
                                                    key={featureIndex}
                                                    className="text-sm text-gray-600"
                                                >
                                                    • {feature}
                                                </li>
                                            ),
                                        )}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <p className="text-gray-500">
                                Тарифные планы не добавлены
                            </p>
                        </div>
                    )}
                </div>
            );

        case 'team':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    {(content.members as unknown[]).length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {(
                                content.members as Array<{
                                    name: string;
                                    position: string;
                                }>
                            ).map((member, index: number) => (
                                <div key={index} className="text-center">
                                    <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-gray-300"></div>
                                    <h4 className="font-medium text-gray-900">
                                        {member.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {member.position}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <p className="text-gray-500">
                                Члены команды не добавлены
                            </p>
                        </div>
                    )}
                </div>
            );

        case 'services':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    {(content.services as unknown[]).length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {(
                                content.services as Array<{
                                    title: string;
                                    description: string;
                                }>
                            ).map((service, index: number) => (
                                <div
                                    key={index}
                                    className="rounded-lg border border-gray-200 p-4"
                                >
                                    <h4 className="mb-2 font-medium text-gray-900">
                                        {service.title}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {service.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                            <p className="text-gray-500">Услуги не добавлены</p>
                        </div>
                    )}
                </div>
            );

        case 'about':
            return (
                <div className="p-6">
                    <h3 className="mb-4 text-lg font-semibold">
                        {content.title as string}
                    </h3>
                    <div className="flex flex-col gap-6 md:flex-row">
                        <div className="flex-1">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: content.content as string,
                                }}
                            />
                        </div>
                        {typeof content.image === 'string' && content.image && (
                            <div className="w-full md:w-1/3">
                                <img
                                    src={content.image}
                                    alt="О нас"
                                    className="h-48 w-full rounded-lg object-cover"
                                />
                            </div>
                        )}
                    </div>
                </div>
            );

        default:
            return (
                <div className="p-6">
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                        <p className="text-gray-500">
                            Неизвестный тип блока: {type}
                        </p>
                    </div>
                </div>
            );
    }
};

const BlockEditor: React.FC<{
    block: PageBlock;
    onSave: (content: Record<string, unknown>) => void;
    onCancel: () => void;
}> = ({ block, onSave, onCancel }) => {
    const [content] = useState(block.content);

    const handleSave = () => {
        onSave(content);
    };

    return (
        <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Редактирование блока</h3>
                <div className="flex items-center space-x-2">
                    <Button size="sm" onClick={handleSave}>
                        Сохранить
                    </Button>
                    <Button size="sm" variant="outline" onClick={onCancel}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                {/* Здесь будет форма редактирования в зависимости от типа блока */}
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
                    <p className="text-gray-500">
                        Редактор для блока {block.type}
                    </p>
                    <p className="mt-2 text-sm text-gray-400">
                        Здесь будет форма редактирования содержимого блока
                    </p>
                </div>
            </div>
        </div>
    );
};
