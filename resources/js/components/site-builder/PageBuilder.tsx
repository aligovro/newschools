import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Eye, Plus, Redo, Save, Undo } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { ContentBlock } from './ContentBlock';
import { DropZone } from './DropZone';

interface PageBlock {
    id: string;
    type: string;
    content: Record<string, unknown>;
    order: number;
}

interface PageBuilderProps {
    initialBlocks?: PageBlock[];
    onSave?: (blocks: PageBlock[]) => void;
    onPreview?: () => void;
    className?: string;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({
    initialBlocks = [],
    onSave,
    onPreview,
    className,
}) => {
    const [blocks, setBlocks] = useState<PageBlock[]>(initialBlocks);
    const [history, setHistory] = useState<PageBlock[][]>([initialBlocks]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const addToHistory = useCallback(
        (newBlocks: PageBlock[]) => {
            const newHistory = history.slice(0, historyIndex + 1);
            newHistory.push(newBlocks);
            setHistory(newHistory);
            setHistoryIndex(newHistory.length - 1);
        },
        [history, historyIndex],
    );

    const handleDrop = useCallback(
        (blockType: { type: string }) => {
            const newBlock: PageBlock = {
                id: `${blockType.type}-${Date.now()}`,
                type: blockType.type,
                content: getDefaultContent(blockType.type),
                order: blocks.length,
            };

            const newBlocks = [...blocks, newBlock];
            setBlocks(newBlocks);
            addToHistory(newBlocks);
        },
        [blocks, addToHistory],
    );

    const handleUpdateBlock = useCallback(
        (blockId: string, content: Record<string, unknown>) => {
            const newBlocks = blocks.map((block) =>
                block.id === blockId ? { ...block, content } : block,
            );
            setBlocks(newBlocks);
            addToHistory(newBlocks);
        },
        [blocks, addToHistory],
    );

    const handleDeleteBlock = useCallback(
        (blockId: string) => {
            const newBlocks = blocks.filter((block) => block.id !== blockId);
            setBlocks(newBlocks);
            addToHistory(newBlocks);
        },
        [blocks, addToHistory],
    );

    const handleMoveBlock = useCallback(
        (blockId: string, direction: 'up' | 'down') => {
            const blockIndex = blocks.findIndex(
                (block) => block.id === blockId,
            );
            if (blockIndex === -1) return;

            const newBlocks = [...blocks];
            const targetIndex =
                direction === 'up' ? blockIndex - 1 : blockIndex + 1;

            if (targetIndex >= 0 && targetIndex < blocks.length) {
                [newBlocks[blockIndex], newBlocks[targetIndex]] = [
                    newBlocks[targetIndex],
                    newBlocks[blockIndex],
                ];
                setBlocks(newBlocks);
                addToHistory(newBlocks);
            }
        },
        [blocks, addToHistory],
    );

    const handleUndo = useCallback(() => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setBlocks(history[historyIndex - 1]);
        }
    }, [historyIndex, history]);

    const handleRedo = useCallback(() => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setBlocks(history[historyIndex + 1]);
        }
    }, [historyIndex, history]);

    const handleSave = useCallback(() => {
        onSave?.(blocks);
    }, [blocks, onSave]);

    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;

    return (
        <div className={cn('flex h-full flex-col', className)}>
            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4">
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndo}
                        disabled={!canUndo}
                    >
                        <Undo className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRedo}
                        disabled={!canRedo}
                    >
                        <Redo className="h-4 w-4" />
                    </Button>
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={onPreview}>
                        <Eye className="mr-2 h-4 w-4" />
                        Предпросмотр
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                        <Save className="mr-2 h-4 w-4" />
                        Сохранить
                    </Button>
                </div>
            </div>

            {/* Page Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 p-4">
                <div className="mx-auto max-w-4xl">
                    {blocks.length === 0 ? (
                        <DropZone onDrop={handleDrop}>
                            <Card className="border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400">
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <Plus className="mb-4 h-12 w-12 text-gray-400" />
                                    <h3 className="mb-2 text-lg font-medium text-gray-900">
                                        Начните создавать страницу
                                    </h3>
                                    <p className="text-center text-gray-500">
                                        Перетащите блоки контента с панели
                                        слева, чтобы создать вашу страницу
                                    </p>
                                </CardContent>
                            </Card>
                        </DropZone>
                    ) : (
                        <div className="space-y-4">
                            {blocks.map((block, index) => (
                                <DropZone key={block.id} onDrop={handleDrop}>
                                    <ContentBlock
                                        block={block}
                                        onUpdate={(content) =>
                                            handleUpdateBlock(block.id, content)
                                        }
                                        onDelete={() =>
                                            handleDeleteBlock(block.id)
                                        }
                                        onMoveUp={
                                            index > 0
                                                ? () =>
                                                      handleMoveBlock(
                                                          block.id,
                                                          'up',
                                                      )
                                                : undefined
                                        }
                                        onMoveDown={
                                            index < blocks.length - 1
                                                ? () =>
                                                      handleMoveBlock(
                                                          block.id,
                                                          'down',
                                                      )
                                                : undefined
                                        }
                                    />
                                </DropZone>
                            ))}

                            {/* Add Block Zone */}
                            <DropZone onDrop={handleDrop}>
                                <Card className="border-2 border-dashed border-gray-300 transition-colors hover:border-gray-400">
                                    <CardContent className="flex items-center justify-center py-8">
                                        <div className="text-center">
                                            <Plus className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                                            <p className="text-gray-500">
                                                Добавить блок
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </DropZone>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

function getDefaultContent(blockType: string): Record<string, unknown> {
    switch (blockType) {
        case 'hero':
            return {
                title: 'Заголовок страницы',
                subtitle: 'Подзаголовок страницы',
                buttonText: 'Кнопка действия',
                buttonUrl: '#',
                backgroundImage: null,
                backgroundColor: '#f3f4f6',
            };
        case 'text':
            return {
                content: '<p>Введите ваш текст здесь...</p>',
            };
        case 'image':
            return {
                src: null,
                alt: 'Изображение',
                caption: '',
                alignment: 'center',
            };
        case 'gallery':
            return {
                images: [],
                columns: 3,
                showCaptions: true,
            };
        case 'slider':
            return {
                sliderId: null,
                autoplay: true,
                interval: 5000,
            };
        case 'testimonials':
            return {
                testimonials: [],
            };
        case 'contact_form':
            return {
                title: 'Связаться с нами',
                fields: ['name', 'email', 'message'],
                submitText: 'Отправить',
            };
        case 'news':
            return {
                title: 'Новости',
                count: 6,
                showExcerpt: true,
            };
        case 'projects':
            return {
                title: 'Наши проекты',
                count: 6,
                showDescription: true,
            };
        case 'stats':
            return {
                title: 'Наша статистика',
                stats: [],
            };
        case 'features':
            return {
                title: 'Наши преимущества',
                features: [],
            };
        case 'pricing':
            return {
                title: 'Тарифные планы',
                plans: [],
            };
        case 'team':
            return {
                title: 'Наша команда',
                members: [],
            };
        case 'services':
            return {
                title: 'Наши услуги',
                services: [],
            };
        case 'about':
            return {
                title: 'О нас',
                content: '<p>Расскажите о вашей организации...</p>',
                image: null,
            };
        default:
            return {};
    }
}
